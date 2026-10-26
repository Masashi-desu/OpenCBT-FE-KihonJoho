"""S2-02 Q11 body + required fixed API pages only only: raw DCT stream -> lossless WebP; never writes public."""
import argparse, hashlib, io, json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
parser=argparse.ArgumentParser()
parser.add_argument('--qs',type=Path,required=True)
parser.add_argument('--ans',type=Path,required=True)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args()
assert 'output' in args.out.resolve().parts and 'public' not in args.out.resolve().parts
assert not (args.out/'pages.json').exists()
papers={}
for role,file,sha,size in [('questionPaper',args.qs,'787ad5492b60949988e7e39ca532ac7c1c78ebfe5b3cbd9af4e6f621793ddd9a',14044358),('answerPaper',args.ans,'7bbf8eff0464a05ae1f65c9ecff1ee978c946fb1bd28ef13858e710b9d3678c1',190582)]:
    data=file.read_bytes();assert len(data)==size and hashlib.sha256(data).hexdigest()==sha
    papers[role]={'sha256':sha,'byteLength':size}
reader=PdfReader(args.qs);assert len(reader.pages)==93
(args.out/'assets').mkdir(parents=True,exist_ok=True)
rows=[];rawrows=[]
for page in [58,59,60,61,62,63,76,77,78]:
    objects=reader.pages[page-1]['/Resources']['/XObject'].get_object()
    images=[x.get_object() for x in objects.values() if x.get_object().get('/Subtype')=='/Image']
    assert len(images)==1
    obj=images[0];assert str(obj.get('/Filter'))=='/DCTDecode' and obj.get('/Decode') is None
    raw=obj._data;img=Image.open(io.BytesIO(raw)).convert('RGB')
    assert img.size==(int(obj['/Width']),int(obj['/Height']))
    name=f'2017h29a-fe-pm-11'+('-api' if page>=76 else '')+f'-p{page}.webp';target=args.out/'assets'/name
    img.save(target,format='WEBP',lossless=True)
    decoded=Image.open(target).convert('RGB');assert decoded.size==img.size and decoded.tobytes()==img.tobytes()
    data=target.read_bytes();rows.append({'page':page,'name':name,'width':img.width,'height':img.height,'byteLength':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    rawrows.append({'page':page,'rawJPEGByteLength':len(raw),'rawJPEGSha256':hashlib.sha256(raw).hexdigest(),'decodedRGBPixelSha256':hashlib.sha256(img.tobytes()).hexdigest(),'losslessWebpPixelsExact':True,'rawExportMethod':'pypdf XObject DCT _data; no JPEG reencoding'})
(args.out/'pages.json').write_text(json.dumps({'papers':papers,'pages':rows,'rawImageExtraction':rawrows},indent=2)+'\n')
