#!/usr/bin/env python3
"""Build script: combines modular src/ files into a single dist/index.html."""

import glob
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
DIST = os.path.join(ROOT, "dist")


def concat_files(directory: str, ext: str) -> str:
    pattern = os.path.join(directory, f"*.{ext}")
    files = sorted(glob.glob(pattern))
    parts = []
    for f in files:
        with open(f, "r", encoding="utf-8") as fh:
            parts.append(f"/* ── {os.path.basename(f)} ── */\n{fh.read()}")
    return "\n\n".join(parts)


def build():
    with open(os.path.join(SRC, "index.html"), "r", encoding="utf-8") as f:
        template = f.read()

    css = concat_files(os.path.join(SRC, "styles"), "css")
    js = concat_files(os.path.join(SRC, "scripts"), "js")

    html = template.replace("<!-- INJECT:styles -->", f"<style>\n{css}\n</style>")
    html = html.replace("<!-- INJECT:scripts -->", f"<script>\n{js}\n</script>")

    os.makedirs(DIST, exist_ok=True)
    out_path = os.path.join(DIST, "index.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(out_path) / 1024
    print(f"Built dist/index.html ({size_kb:.1f} KB)")


if __name__ == "__main__":
    build()
