"""Render the reviewed IPA sample without altering question content.

Usage: python render-april-source.py /path/to/sample-b-qs.pdf output/source-import/dec-b
Requires PyMuPDF and Pillow; neither is a distributed app dependency.
"""
import hashlib
import json
from pathlib import Path
import sys
import fitz
from PIL import Image

source, target = Path(sys.argv[1]), Path(sys.argv[2])
expected = "54e16b636f3c69fc30cd92dbbbcb1b0e0acbb1e64bbd5066e971dce954d7dd11"
if hashlib.sha256(source.read_bytes()).hexdigest() != expected:
    raise ValueError("Reviewed PDF hash differs; review the new source before import")
target.mkdir(parents=True, exist_ok=True)
paper = fitz.open(source)
records = []
for number, pages in enumerate([[2,3],[4],[5],[6],[7],[8],[9],[10],[12,13],[14,15],[16,17],[18],[20,21],[22],[23],[24,25],[26,27],[28,29],[30,31],[32,33],[34,35]]):
    for page_number in pages:
        page = paper[page_number - 1]
        pixels = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        name = f"ipa-sample-2022-dec-b-{number}-p{page_number}.webp"
        Image.frombytes("RGB", [pixels.width, pixels.height], pixels.samples).save(target / name, lossless=True)
        data = (target / name).read_bytes()
        records.append(dict(number=number, page=page_number, name=name, width=pixels.width, height=pixels.height,
                            byteLength=len(data), sha256=hashlib.sha256(data).hexdigest(), text=page.get_text("text").strip()))
(target / "pages.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
print(f"Rendered {len(records)} unmodified full pages from the hash-verified official PDF")
