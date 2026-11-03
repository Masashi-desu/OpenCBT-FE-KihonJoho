"""Render each reviewed IPA sample question, using the same bounds for text.

Usage: python render-december-a-source.py /path/to/sample-a-qs.pdf output/source-import/dec-a
Requires PyMuPDF and Pillow; neither is a distributed app dependency.
"""
import hashlib
import json
import re
from pathlib import Path
import sys
import fitz
from PIL import Image, ImageChops

source, target = Path(sys.argv[1]), Path(sys.argv[2])
expected = "5a95b05825d1bae7c5fac7e17b0d102e5559530869b9c281d1292d0ff5dd610e"
if hashlib.sha256(source.read_bytes()).hexdigest() != expected:
    raise ValueError("Reviewed PDF hash differs; review the new source before import")
target.mkdir(parents=True, exist_ok=True)
paper = fitz.open(source)
records = []
boundary = json.loads((Path(__file__).parent / "source-evidence/december-a-question-boundaries.json").read_text())
assert boundary["sourceSha256"] == expected
assert [q["number"] for q in boundary["questions"]] == list(range(1, 61))
scale = boundary["scale"]
for item in [dict(number=0, page=p) for p in [2, 3]] + boundary["questions"]:
    number, page_number = item["number"], item["page"]
    page = paper[page_number - 1]
    pixels = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    image = Image.frombytes("RGB", [pixels.width, pixels.height], pixels.samples)
    crop = item.get("pixelCrop")
    if crop:
        assert list(image.size) == boundary["pagePixels"]
        image = image.crop(crop)
        assert hashlib.sha256(image.tobytes()).hexdigest() == item["pixelSha256"], f"Question {number}: pixel bounds differ"
    # PDF extraction must use the image's rectangle, never the whole page.
    clip = fitz.Rect(*(v / scale for v in crop)) if crop else page.rect
    text = page.get_text("text", clip=clip).strip()
    if crop:
        heads = [int(n) for n in re.findall(r"(?:^|\n)\s*問\s*([0-9０-９]+)(?=\s|$)", text)]
        assert heads == [number], f"Question {number}: adjacent question in extracted text: {heads}"
        assert hashlib.sha256(text.encode()).hexdigest() == item["textSha256"], f"Question {number}: extracted text differs"
    name = f"ipa-sample-2022-dec-a-{number}-p{page_number}.webp"
    image.save(target / name, lossless=True)
    data = (target / name).read_bytes()
    records.append(dict(number=number, page=page_number, name=name, width=image.width, height=image.height,
                        byteLength=len(data), sha256=hashlib.sha256(data).hexdigest(), text=text, pixelCrop=crop))
# Independently check completeness: outside the question rectangles there may
# be only white space above the page-number footer. This covers figure pixels
# and rules that PDF text extraction cannot account for.
for page_number in sorted({q["page"] for q in boundary["questions"]}):
    page = paper[page_number - 1]
    pixels = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    original = Image.frombytes("RGB", [pixels.width, pixels.height], pixels.samples)
    remaining = ImageChops.difference(original, Image.new("RGB", original.size, "white"))
    crops = [q["pixelCrop"] for q in boundary["questions"] if q["page"] == page_number]
    for i, crop in enumerate(crops):
        if i:
            assert crops[i - 1][3] < crop[1], f"Page {page_number}: overlapping questions"
        remaining.paste((0, 0, 0), tuple(crop))
    assert remaining.crop((0, 0, original.width, int((page.rect.height - 48) * scale))).getbbox() is None, f"Page {page_number}: omitted source pixels"
(target / "pages.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
print(f"Rendered 60 bounded questions and 2 common notation pages from the hash-verified official PDF")
