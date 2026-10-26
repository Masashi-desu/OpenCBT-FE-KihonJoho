"""Render the reviewed IPA sample without altering question content.

Usage: python render-december-a-source.py /path/to/sample-b-qs.pdf output/source-import/dec-a
Requires PyMuPDF and Pillow; neither is a distributed app dependency.
"""
import hashlib
import json
from pathlib import Path
import sys
import fitz
from PIL import Image

source, target = Path(sys.argv[1]), Path(sys.argv[2])
expected = "5a95b05825d1bae7c5fac7e17b0d102e5559530869b9c281d1292d0ff5dd610e"
if hashlib.sha256(source.read_bytes()).hexdigest() != expected:
    raise ValueError("Reviewed PDF hash differs; review the new source before import")
target.mkdir(parents=True, exist_ok=True)
paper = fitz.open(source)
records = []
source_pages = [4,4,5,5,6,7,8,8,9,9,9,10,10,11,12,12,13,13,13,14,14,14,15,15,16,16,16,16,17,17,18,18,18,19,19,20,20,20,20,21,21,21,22,22,23,23,23,24,24,25,25,26,26,27,27,28,28,28,29,29]
for number, pages in enumerate([[2,3]]+[[p] for p in source_pages]):
    for page_number in pages:
        page = paper[page_number - 1]
        pixels = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        name = f"ipa-sample-2022-dec-a-{number}-p{page_number}.webp"
        Image.frombytes("RGB", [pixels.width, pixels.height], pixels.samples).save(target / name, lossless=True)
        data = (target / name).read_bytes()
        records.append(dict(number=number, page=page_number, name=name, width=pixels.width, height=pixels.height,
                            byteLength=len(data), sha256=hashlib.sha256(data).hexdigest(), text=page.get_text("text").strip()))
(target / "pages.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
print(f"Rendered {len(records)} unmodified full pages from the hash-verified official PDF")
