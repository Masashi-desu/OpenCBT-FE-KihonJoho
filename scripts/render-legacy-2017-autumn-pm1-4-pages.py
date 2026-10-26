"""Extract original DCT streams for S2-02 Q1-4; ignored preparation only."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
from pypdf.generic import ContentStream

PAPERS = {
    'questionPaper': ('787ad5492b60949988e7e39ca532ac7c1c78ebfe5b3cbd9af4e6f621793ddd9a', 14044358, 93),
    'answerPaper': ('7bbf8eff0464a05ae1f65c9ecff1ee978c946fb1bd28ef13858e710b9d3678c1', 190582, 4),
}
RANGES = {1: [6, 7, 8], 2: [9, 10, 11, 12], 3: [13, 14, 15, 16, 17], 4: [18, 19, 20, 21, 22]}
sha = lambda b: hashlib.sha256(b).hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--qs', required=True)
    ap.add_argument('--ans', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()
    project = Path(__file__).resolve().parents[1]
    out = Path(args.out).resolve()
    if not out.is_relative_to(project / 'output') or out.exists():
        raise ValueError('New ignored output directory required')
    readers, papers = {}, {}
    for role, filename in [('questionPaper', args.qs), ('answerPaper', args.ans)]:
        raw = Path(filename).read_bytes()
        expected_hash, expected_size, pages = PAPERS[role]
        if sha(raw) != expected_hash or len(raw) != expected_size:
            raise ValueError('Official PDF pin mismatch: ' + role)
        readers[role] = PdfReader(io.BytesIO(raw))
        assert len(readers[role].pages) == pages
        papers[role] = {'sha256': expected_hash, 'byteLength': expected_size}
    out.mkdir(parents=True)
    for number, page_numbers in RANGES.items():
        dest = out / ('pm' + str(number))
        (dest / 'assets').mkdir(parents=True)
        (dest / 'raw').mkdir()
        metadata = {'papers': papers, 'pages': []}
        for n in page_numbers:
            p = readers['questionPaper'].pages[n - 1]
            assert p.get('/Rotate', 0) == 0
            objects = p['/Resources']['/XObject']
            assert len(objects) == 1
            name, ref = next(iter(objects.items()))
            image = ref.get_object()
            assert image['/Subtype'] == '/Image' and image['/Filter'] == '/DCTDecode'
            assert image['/ColorSpace'] == '/DeviceGray' and image['/BitsPerComponent'] == 8
            assert '/Decode' not in image and '/SMask' not in image and '/Mask' not in image
            operations = ContentStream(p.get_contents(), readers['questionPaper']).operations
            assert [op for _, op in operations] == [b'q', b'cm', b'Do', b'Q']
            assert list(operations[2][0]) == [name]
            matrix = [float(v) for v in operations[1][0]]
            assert matrix[1:3] == [0.0, 0.0] and matrix[4:] == [0.0, 0.0]
            assert abs(matrix[0] - float(p.mediabox.width)) < .001
            assert abs(matrix[3] - float(p.mediabox.height)) < .001
            raw = image._data
            assert raw.startswith(b'\xff\xd8')
            decoded = Image.open(io.BytesIO(raw))
            assert decoded.size == (1432, 2026) and decoded.mode == 'L'
            rgb = decoded.convert('RGB')
            encoded = io.BytesIO()
            rgb.save(encoded, format='WEBP', lossless=True, method=6)
            webp = encoded.getvalue()
            restored = Image.open(io.BytesIO(webp)).convert('RGB')
            assert rgb.tobytes() == restored.tobytes()
            filename = f'2017h29a-fe-pm-{number}-p{n}.webp'
            (dest / 'raw' / f'p{n}.jpg').write_bytes(raw)
            (dest / 'assets' / filename).write_bytes(webp)
            metadata['pages'].append({'page': n, 'name': filename, 'width': 1432, 'height': 2026,
                'byteLength': len(webp), 'sha256': sha(webp), 'rawImageExtraction': {
                    'method': 'original_DCT_stream_to_lossless_RGB_WebP', 'xobject': str(name),
                    'sourceJPEGByteLength': len(raw), 'sourceJPEGSHA256': sha(raw),
                    'decodedRGBSHA256': sha(rgb.tobytes()), 'webpDecodedRGBSHA256': sha(restored.tobytes()),
                    'pageMatrix': matrix, 'contentOperators': ['q', 'cm', 'Do', 'Q'],
                    'crop': None, 'resized': False, 'allPixelsEqual': True}})
        (dest / 'pages.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'scope': 'excluded_S2-02_Q1-4_preparation_only', 'originalPages': 17, 'output': str(out)}))

if __name__ == '__main__':
    main()
