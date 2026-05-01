"""
Resize every sukarin PNG to a target square size in place.

Default target = 768×768. Largest realistic display is the 220px hero on a 2×
retina screen (= 440px), so 768 keeps a comfortable ~1.75× headroom for any
future enlargement (e.g. a 384px hero).

Lanczos resample + optimize=True at PNG save. Idempotent: re-running on an
already-768 image is a no-op.

Usage:
    python scripts/resize_sukarin.py                      # 768×768, in place
    python scripts/resize_sukarin.py --size 512           # alt target
    python scripts/resize_sukarin.py --dry-run
    python scripts/resize_sukarin.py DARCX                # single code
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image


REPO_ROOT = Path(__file__).resolve().parents[1]
SUKARIN_DIR = REPO_ROOT / "src" / "assets" / "sukarin"


def resize_one(path: Path, target: int, dry_run: bool) -> tuple[int, int]:
    """Returns (old_size_bytes, new_size_bytes)."""
    old_bytes = path.stat().st_size
    img = Image.open(path).convert("RGBA")
    if img.size == (target, target):
        return old_bytes, old_bytes

    resized = img.resize((target, target), Image.LANCZOS)

    if dry_run:
        # Estimate new size by saving to memory.
        from io import BytesIO
        buf = BytesIO()
        resized.save(buf, format="PNG", optimize=True)
        return old_bytes, buf.tell()

    resized.save(path, format="PNG", optimize=True)
    return old_bytes, path.stat().st_size


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("codes", nargs="*", help="Specific codes. Default: all 32.")
    parser.add_argument("--size", type=int, default=768, help="Target side in px (square). Default 768.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.codes:
        targets = [SUKARIN_DIR / f"{c}.png" for c in args.codes]
        missing = [t for t in targets if not t.exists()]
        if missing:
            print(f"Missing: {[str(p) for p in missing]}", file=sys.stderr)
            return 1
    else:
        targets = sorted(SUKARIN_DIR.glob("*.png"))

    total_old = 0
    total_new = 0
    for path in targets:
        old, new = resize_one(path, args.size, args.dry_run)
        total_old += old
        total_new += new
        verb = "would shrink" if args.dry_run else "shrunk"
        delta = (1 - new / old) * 100 if old else 0
        print(f"{path.name}: {old/1024:.0f}KB → {new/1024:.0f}KB ({verb} {delta:+.0f}%)")

    print()
    print(f"Total: {total_old/1e6:.1f}MB → {total_new/1e6:.1f}MB ({(1 - total_new/total_old)*100:.0f}% smaller)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
