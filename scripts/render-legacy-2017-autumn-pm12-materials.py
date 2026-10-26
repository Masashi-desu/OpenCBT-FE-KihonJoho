"""Prepare the numeric CASL/COMET references from the autumn 2017 PDF.

This developer tool writes only to a fresh ignored output directory. It does
not admit material to the app or decide rights. The lower part of physical
page 81 is never exported, including during extraction. A booklet review must
also establish that its original and generated questions do not need it.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

QUESTION_SHA256 = "787ad5492b60949988e7e39ca532ac7c1c78ebfe5b3cbd9af4e6f621793ddd9a"
P81_DCT_SHA256 = "f5af1ba7b1a18e2a391494a18d6b48d80a81c683567c03f37c78cc2df3506449"
P81_RGB_SHA256 = "8726cd8e014374764f781b853b9f0b8e60524ed5d0a1e7767d5e1bbe5b71de5f"
P81_RECTANGLE = (0, 0, 1432, 1240)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pin(file):
    raw = file.read_bytes()
    return {"path": str(file), "byteLength": len(raw), "sha256": sha(raw)}


def extract(args):
    question_bytes = args.qs.read_bytes()
    if len(question_bytes) != 14044358 or sha(question_bytes) != QUESTION_SHA256:
        raise ValueError("wrong_autumn_question_paper")
    reader = PdfReader(io.BytesIO(question_bytes))
    if len(reader.pages) != 93:
        raise ValueError("wrong_autumn_page_count")
    out = args.out.resolve()
    ignored_root = (Path.cwd() / "output").resolve()
    if not out.is_relative_to(ignored_root) or out == ignored_root or out.exists():
        raise ValueError("fresh_ignored_output_required")
    out.mkdir(parents=True)
    (out / "assets").mkdir()
    rows = []
    for number in range(79, 85):
        page = reader.pages[number - 1]
        if page.get("/Rotate", 0) != 0:
            raise ValueError("unexpected_material_rotation")
        images = [item.get_object() for item in page["/Resources"]["/XObject"].values()
                  if item.get_object().get("/Subtype") == "/Image"]
        if len(images) != 1 or str(images[0]["/Filter"]) != "/DCTDecode":
            raise ValueError("expected_one_original_dct_stream")
        # Read the original DCT stream; do not JPEG-encode a rendered page.
        raw = images[0]._data
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        original_size = list(image.size)
        if number == 81:
            if len(raw) != 225496 or sha(raw) != P81_DCT_SHA256 or image.size != (1432, 2026):
                raise ValueError("wrong_autumn_page81_stream")
            image = image.crop(P81_RECTANGLE)
            if sha(image.tobytes()) != P81_RGB_SHA256:
                raise ValueError("wrong_autumn_page81_crop_pixels")
            name = "2017h29a-fe-pm-12-p81-instructions.webp"
        else:
            name = f"2017h29a-fe-pm-12-p{number}.webp"
        target = out / "assets" / name
        image.save(target, format="WEBP", lossless=True)
        decoded = Image.open(target).convert("RGB")
        if decoded.size != image.size or decoded.tobytes() != image.tobytes():
            raise ValueError("lossless_webp_pixel_mismatch")
        row = {"page": number, "path": "assets/" + name, "width": image.width,
               "height": image.height, "rawDCTSHA256": sha(raw),
               "rawDCTByteLength": len(raw), "rawDimensions": original_size,
               "decodedRGBPixelSHA256": sha(image.tobytes()),
               "losslessWebpPixelsExact": True, "file": pin(target)}
        if number == 81:
            row["cropRectangle"] = list(P81_RECTANGLE)
        rows.append(row)
        # Full source streams stay in memory and are not output artifacts.
        del raw
    metadata = {
        "collection": "2017h29a-fe-pm", "major": 12,
        "questionPaperSHA256": QUESTION_SHA256,
        "status": "prepared_references_pending_booklet_material_and_semantic_review",
        "normalAppRegistered": False, "rightsAdmissionPerformed": False,
        "materials": rows,
        "extraction": {
            "method": "original PDF DCT stream decoded to RGB then lossless WebP",
            "physicalPages": [79, 80, 81, 82, 83, 84],
            "page81Rectangle": list(P81_RECTANGLE),
            "page81RequiredLastLegendDarkPixelY": 1214,
            "page81ExcludedSectionFirstDarkPixelY": 1261,
            "page81FullStreamPersisted": False,
            "excluded": "physical p81 section 1.3 heading, prose and character-code table",
            "scopeLimit": "Pixel identity is not a rights or generated-domain review.",
        },
        "producer": pin(Path(__file__).resolve()),
    }
    report = out / "materials-only.json"
    report.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    manifest = {"artifacts": [pin(report), *[row["file"] for row in rows]],
                "inputSHA256": QUESTION_SHA256,
                "status": "preparation_only_not_a_release_receipt"}
    (out / "MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"output": str(out), "materials": len(rows),
                      "status": metadata["status"], "normalAppRegistered": False}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--qs", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    extract(parser.parse_args())
