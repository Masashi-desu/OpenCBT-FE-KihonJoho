#!/usr/bin/env python3
"""Read-only exact-PDF verification for the prepared13-booklet assets.

Only the requested JSON receipt is written. Full JPEG streams (including the
held JIS region of p76) and the research PDF are never copied into the candidate.
Requires pypdf and Pillow in the developer's Python environment.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image


def digest(value):
    return hashlib.sha256(value).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('prepared_folder')
    parser.add_argument('source_pdf')
    parser.add_argument('receipt')
    args = parser.parse_args()
    folder = Path(args.prepared_folder).resolve()
    pdf_path = Path(args.source_pdf).resolve()
    receipt = Path(args.receipt).resolve()
    assert 'output' in folder.parts and 'public' not in folder.parts
    assert receipt.parent == folder and not receipt.exists()
    data = pdf_path.read_bytes()
    assert digest(data) == 'bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9'
    assert len(data) == 20020715
    pdf = PdfReader(io.BytesIO(data))
    assert len(pdf.pages) == 89
    ledger = json.loads((folder / 'asset-ledger.json').read_text())
    assert len(ledger) == 85
    observed = []
    for item in ledger:
        number, asset, metadata = item['number'], item['asset'], item['metadata']
        proof, page_number = metadata['rawImageExtraction'], metadata['page']
        page = pdf.pages[page_number - 1]
        operations = page.get_contents().operations
        assert [op.decode() for operands, op in operations] == ['q', 'cm', 'Do', 'Q']
        matrix = next([float(v) for v in operands] for operands, op in operations if op == b'cm')
        assert matrix == proof['pageMatrix']
        objects = page['/Resources']['/XObject'].get_object()
        images = [(name, ref.get_object()) for name, ref in objects.items() if ref.get_object().get('/Subtype') == '/Image']
        assert len(images) == 1
        name, obj = images[0]
        assert str(name) == proof['xobject']
        assert str(obj['/Filter']) == '/DCTDecode'
        raw = obj._data
        assert raw == obj.get_data() and raw.startswith(bytes.fromhex('ffd8ff'))
        assert digest(raw) == proof['sourceJPEGSHA256']
        assert len(raw) == proof['sourceJPEGByteLength']
        original = Image.open(io.BytesIO(raw)).convert('RGB')
        crop = proof['crop']
        if crop is not None:
            assert number == 12 and page_number == 76
            assert crop == [0, 0, 1432, 1240]
            original = original.crop(tuple(crop))
        else:
            assert not (number == 12 and page_number == 76)
        path = folder / asset['path']
        encoded = path.read_bytes()
        assert len(encoded) == asset['byteLength'] and digest(encoded) == asset['sha256']
        decoded = Image.open(io.BytesIO(encoded)).convert('RGB')
        assert original.size == decoded.size == (asset['width'], asset['height'])
        source_pixels, actual_pixels = original.tobytes(), decoded.tobytes()
        assert source_pixels == actual_pixels
        assert digest(source_pixels) == proof['decodedRGBSHA256']
        assert digest(actual_pixels) == proof['webpDecodedRGBSHA256']
        observed.append({'number': number, 'page': page_number, 'assetId': asset['id'], 'path': asset['path'], 'assetSHA256': digest(encoded), 'sourceJPEGSHA256': digest(raw), 'sourceJPEGByteLength': len(raw), 'xobject': str(name), 'sourcePDFMatrix': matrix, 'crop': crop, 'dimensions': list(decoded.size), 'decodedRGBSHA256': digest(actual_pixels), 'allPixelsEqual': True})
    assert [sum(row['number'] == n for row in observed) for n in range(1, 14)] == [5,3,4,5,6,6,3,8,6,7,7,11,14]
    result = {'status': 'all85_actual_source_DCT_to_candidate_lossless_pixels_match', 'sourcePDFSHA256': digest(data), 'sourcePDFByteLength': len(data), 'sourcePDFPages': len(pdf.pages), 'assets': 85, 'rawOrFullPDFWritten': False, 'onlyExplicitCrop': {'number': 12, 'physicalPage': 76, 'crop': [0,0,1432,1240]}, 'heldJisTableDistributed': False, 'materialPermission': 'not_assessed_here', 'ordinaryAppAcceptance': 'not_assessed_here', 'rows': observed}
    receipt.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'assets': 85, 'allPixelsEqual': True, 'receiptSHA256': digest(receipt.read_bytes()), 'receipt': str(receipt)}))


if __name__ == '__main__':
    main()
