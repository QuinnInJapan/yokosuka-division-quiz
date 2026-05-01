"""
Fill interior transparent regions ("holes") in each sukarin PNG.

Algorithm:
  1. Build a binary "transparent" mask (alpha < THRESHOLD).
  2. Flood-fill from every border pixel that is transparent → that connected
     component is the OUTSIDE. Anything still transparent after that pass
     is an interior hole.
  3. Determine the fill color: the most common high-luminance opaque pixel
     in the image (the "white" the artwork already uses). Fall back to
     pure white if none found.
  4. Replace each interior-hole pixel with (fill_color, alpha=255).
  5. Write the result back in place.

Usage:
    python scripts/fill_sukarin_holes.py                 # process all PNGs
    python scripts/fill_sukarin_holes.py --dry-run       # report only
    python scripts/fill_sukarin_holes.py DARCX           # single code

Idempotent: re-running on already-filled images is a no-op (no holes left).
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


REPO_ROOT = Path(__file__).resolve().parents[1]
SUKARIN_DIR = REPO_ROOT / "src" / "assets" / "sukarin"

# A pixel with alpha below this is treated as transparent.
ALPHA_THRESHOLD = 16

# A pixel with R,G,B all >= this counts as a candidate "white" for the fill.
WHITE_LUMA_THRESHOLD = 235


def detect_fill_color(rgba: np.ndarray) -> tuple[int, int, int]:
    """Return the most common near-white opaque color in the image."""
    r, g, b, a = rgba[..., 0], rgba[..., 1], rgba[..., 2], rgba[..., 3]
    opaque = a >= ALPHA_THRESHOLD
    near_white = opaque & (r >= WHITE_LUMA_THRESHOLD) & (g >= WHITE_LUMA_THRESHOLD) & (b >= WHITE_LUMA_THRESHOLD)
    if not near_white.any():
        return 255, 255, 255
    pixels = rgba[near_white][:, :3]  # (N, 3)
    # Pack into a single int per pixel and take the mode.
    packed = (pixels[:, 0].astype(np.uint32) << 16) | (pixels[:, 1].astype(np.uint32) << 8) | pixels[:, 2].astype(np.uint32)
    values, counts = np.unique(packed, return_counts=True)
    top = values[counts.argmax()]
    return ((top >> 16) & 0xFF, (top >> 8) & 0xFF, top & 0xFF)


def find_interior_holes(alpha: np.ndarray) -> np.ndarray:
    """Boolean mask of pixels that are transparent but NOT connected to the border."""
    transparent = alpha < ALPHA_THRESHOLD
    # Label every connected transparent region (4-connectivity).
    labels, n = ndi.label(transparent, structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]]))
    if n == 0:
        return np.zeros_like(transparent, dtype=bool)
    # Anything touching the image border is the outside.
    border_labels = set()
    border_labels.update(labels[0, :].tolist())
    border_labels.update(labels[-1, :].tolist())
    border_labels.update(labels[:, 0].tolist())
    border_labels.update(labels[:, -1].tolist())
    border_labels.discard(0)  # 0 = not transparent
    interior_mask = transparent.copy()
    for lbl in border_labels:
        interior_mask &= labels != lbl
    return interior_mask


def process(
    path: Path,
    *,
    dry_run: bool = False,
    out_dir: Path | None = None,
    override_color: tuple[int, int, int] | None = None,
) -> tuple[int, tuple[int, int, int] | None]:
    """Fill interior holes in `path`. Returns (pixels_filled, fill_color_or_none)."""
    img = Image.open(path).convert("RGBA")
    rgba = np.array(img, dtype=np.uint8)
    alpha = rgba[..., 3]

    interior = find_interior_holes(alpha)
    n_filled = int(interior.sum())
    if n_filled == 0:
        return 0, None

    fill = override_color if override_color is not None else detect_fill_color(rgba)

    if not dry_run:
        rgba[interior] = (*fill, 255)
        out_path = (out_dir / path.name) if out_dir else path
        Image.fromarray(rgba, mode="RGBA").save(out_path, optimize=True)

    return n_filled, fill


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("codes", nargs="*", help="Specific archetype codes to process. Default: all 32.")
    parser.add_argument("--dry-run", action="store_true", help="Report what would change without writing.")
    parser.add_argument("--out-dir", help="Write outputs here instead of in-place.")
    parser.add_argument("--debug-color", help="Fill holes with this hex color (e.g. ff0000) instead of detected white.")
    args = parser.parse_args()

    debug_rgb: tuple[int, int, int] | None = None
    if args.debug_color:
        h = args.debug_color.lstrip("#")
        debug_rgb = (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

    out_dir = Path(args.out_dir).resolve() if args.out_dir else None
    if out_dir:
        out_dir.mkdir(parents=True, exist_ok=True)

    if args.codes:
        targets = [SUKARIN_DIR / f"{code}.png" for code in args.codes]
        missing = [t for t in targets if not t.exists()]
        if missing:
            print(f"Missing files: {[str(p) for p in missing]}", file=sys.stderr)
            return 1
    else:
        targets = sorted(SUKARIN_DIR.glob("*.png"))

    total_files_with_holes = 0
    total_pixels = 0
    for path in targets:
        filled, fill = process(
            path,
            dry_run=args.dry_run,
            out_dir=out_dir,
            override_color=debug_rgb,
        )
        if filled:
            total_files_with_holes += 1
            total_pixels += filled
            color = f"rgb{fill}" if fill else "—"
            verb = "would fill" if args.dry_run else "filled"
            print(f"{path.name}: {verb} {filled:>6} interior pixels with {color}")
        else:
            print(f"{path.name}: no interior holes")

    print()
    print(f"Total: {total_files_with_holes}/{len(targets)} files had interior holes; {total_pixels} pixels {'would be' if args.dry_run else 'were'} filled.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
