"""Bounded numeric CASL/COMET appendix assets; exclude all of section 1.3.
The only p74 image persisted is its reviewed upper crop. Temporary full embedded
JPEG bytes are deleted on leaving the owned temporary directory.
"""
import argparse, hashlib, json, subprocess, tempfile
from pathlib import Path
from PIL import Image
parser=argparse.ArgumentParser()
parser.add_argument('--qs',type=Path,required=True)
parser.add_argument('--crop',type=Path,required=True)
parser.add_argument('--out',type=Path,required=True)
parser.add_argument('--pdfimages',default='pdfimages')
args=parser.parse_args()
sha=lambda data:hashlib.sha256(data).hexdigest()
assert sha(args.qs.read_bytes())=='7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8'
crop_sha='d57ee1019fda6c5e9752f681e0a2dcaa0c4f856c299f73a4aa1b02c22b2916e0'
assert sha(args.crop.read_bytes())==crop_sha
crop=Image.open(args.crop).convert('RGB');assert crop.size==(1432,1240)
meta=json.loads((args.out/'pages.json').read_text());assert [r['page'] for r in meta['pages']]==[58,59,60,61,62]
rows=[]
raw_rows=[]
with tempfile.TemporaryDirectory(prefix='pm12-materials-',dir=args.out) as temp:
    folder=Path(temp)
    subprocess.run([args.pdfimages,'-f','74','-l','74','-j',str(args.qs),str(folder/'embedded')],check=True)
    embedded=[p for p in folder.glob('embedded-*') if p.suffix.lower() in ['.jpg','.jpeg']]
    assert len(embedded)==1
    assert sha(embedded[0].read_bytes())=='6f4c74f72c34277c9af9ba77efba08b6552fea734e409b1f41965a0f7e61f6f6'
    original=Image.open(embedded[0]).convert('RGB');assert original.size==(1432,2026)
    assert original.crop((0,0,1432,1240)).tobytes()==crop.tobytes()
    for page in [72,73,74,75,76,77]:
        if page==74:
            image=crop;name='2017h29h-fe-pm-12-p74-instructions.webp'
        else:
            prefix=folder/f'page-{page}'
            subprocess.run([args.pdfimages,'-f',str(page),'-l',str(page),'-j',str(args.qs),str(prefix)],check=True)
            raw_files=list(folder.glob(f'page-{page}-*.jpg'));assert len(raw_files)==1
            raw_file=raw_files[0];image=Image.open(raw_file).convert('RGB');name=f'2017h29h-fe-pm-12-p{page}.webp'
            raw_rows.append({'page':page,'rawJPEGByteLength':raw_file.stat().st_size,'rawJPEGSha256':sha(raw_file.read_bytes()),'decodedRGBPixelSha256':sha(image.tobytes()),'losslessWebpPixelsExact':True,'rawExportMethod':'Poppler pdfimages -j DCT stream; no JPEG reencoding'})
        target=args.out/'assets'/name;assert not target.exists()
        image.save(target,format='WEBP',lossless=True)
        decoded=Image.open(target).convert('RGB');assert decoded.size==image.size and decoded.tobytes()==image.tobytes()
        data=target.read_bytes();rows.append({'page':page,'name':name,'width':image.width,'height':image.height,'byteLength':len(data),'sha256':sha(data)})
meta['pages']+=rows
meta['rawImageExtraction']+=raw_rows
meta['materialExtraction']={'status':'bounded_fixed_numeric_instructions_only','p74OriginalEmbeddedSha256':'6f4c74f72c34277c9af9ba77efba08b6552fea734e409b1f41965a0f7e61f6f6','approvedCropPngSha256':crop_sha,'cropRectangle':[0,0,1432,1240],'cropSourcePixelsExact':True,'losslessWebpPixelsExact':True,'excluded':'p74 section1.3 and its full table; never rendered/copied into final assets','p74FullEmbeddedTemporaryDeleted':True}
(args.out/'pages.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
(args.out/'materials-only.json').write_text(json.dumps({'materials':rows,'extraction':meta['materialExtraction']},ensure_ascii=False,indent=2)+'\n')
