"""S2-02 Q5 six bounded source assets; exact raw-DCT -> decoded lossless WebP.
The erratum image uses its upright embedded landscape pixels; the PDF's Rotate270
is recorded, not silently treated as a different official problem page.
"""
import argparse,hashlib,json,io
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
parser=argparse.ArgumentParser();parser.add_argument('--question-pdf',type=Path,required=True);parser.add_argument('--answer-pdf',type=Path,required=True);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args()
papers={}
for role,p,sha,size in [('questionPaper',args.question_pdf,'787ad5492b60949988e7e39ca532ac7c1c78ebfe5b3cbd9af4e6f621793ddd9a',14044358),('answerPaper',args.answer_pdf,'7bbf8eff0464a05ae1f65c9ecff1ee978c946fb1bd28ef13858e710b9d3678c1',190582)]:
 b=p.read_bytes();assert len(b)==size and hashlib.sha256(b).hexdigest()==sha;papers[role]={'sha256':sha,'byteLength':size}
assert not (args.out/'pages.json').exists();(args.out/'assets').mkdir(parents=True,exist_ok=True)
doc=PdfReader(args.question_pdf);assert len(doc.pages)==93;rows=[];raw=[]
for n in [23,24,25,26,27,2]:
 page=doc.pages[n-1];objects=page['/Resources']['/XObject'];assert len(objects)==1
 key,ref=next(iter(objects.items()));x=ref.get_object();assert str(x['/Subtype'])=='/Image' and str(x['/Filter'])=='/DCTDecode' and str(x['/ColorSpace'])=='/DeviceGray' and x.get('/Decode') is None
 b=x.get_data();im=Image.open(io.BytesIO(b)).convert('RGB');assert im.size==(int(x['/Width']),int(x['/Height']))
 name=f'2017h29a-fe-pm-5-p{n}.webp';target=args.out/'assets'/name;assert not target.exists();im.save(target,format='WEBP',lossless=True,method=6)
 decoded=Image.open(target).convert('RGB');assert decoded.size==im.size and decoded.tobytes()==im.tobytes();out=target.read_bytes()
 rows.append(dict(page=n,name=name,width=im.width,height=im.height,byteLength=len(out),sha256=hashlib.sha256(out).hexdigest()))
 raw.append(dict(page=n,xObjectName=str(key),rawJPEGByteLength=len(b),rawJPEGSha256=hashlib.sha256(b).hexdigest(),decodedRGBPixelSha256=hashlib.sha256(im.tobytes()).hexdigest(),losslessWebpPixelsExact=True,pdfPageRotate=page.rotation,presentation='upright embedded landscape without page Rotate270' if n==2 else 'full original embedded page pixels',rawExportMethod='pypdf XObject DCT get_data; not Page.images data / no JPEG reencoding'))
(args.out/'pages.json').write_text(json.dumps(dict(papers=papers,pages=rows,rawImageExtraction=raw),ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(assets=len(rows),output=str(args.out),normalAppRegistered=False)))
