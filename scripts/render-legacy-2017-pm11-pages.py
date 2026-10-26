"""Bounded Q11 source assets only. Verify official bytes first; never write public/."""
import argparse, hashlib, json, io
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
parser=argparse.ArgumentParser()
parser.add_argument('--qs',type=Path,required=True)
parser.add_argument('--ans',type=Path,required=True)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args()
papers={}
for role,file,sha,size in [('questionPaper',args.qs,'7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8',13923067),('answerPaper',args.ans,'7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b',202195)]:
    data=file.read_bytes();assert len(data)==size and hashlib.sha256(data).hexdigest()==sha
    papers[role]={'sha256':sha,'byteLength':size}
assert not (args.out/'pages.json').exists()
(args.out/'assets').mkdir(parents=True,exist_ok=True)
rows=[];proof=[];pdf=PdfReader(args.qs)
assert len(pdf.pages)==88
for page in range(52,58):
    p=pdf.pages[page-1];objects=list(p['/Resources']['/XObject'].values());assert len(objects)==1 and p.get('/Rotate',0)==0
    obj=objects[0].get_object();assert obj['/Filter']=='/DCTDecode' and obj['/ColorSpace']=='/DeviceGray' and obj.get('/Decode') is None
    raw=obj.get_data();img=Image.open(io.BytesIO(raw)).convert('RGB')
    name=f'2017h29h-fe-pm-11-p{page}.webp';target=args.out/'assets'/name
    img.save(target,format='WEBP',lossless=True)
    assert Image.open(target).convert('RGB').tobytes()==img.tobytes()
    data=target.read_bytes();rows.append({'page':page,'name':name,'width':img.width,'height':img.height,'byteLength':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    proof.append({'page':page,'rawEmbeddedJpegSHA256':hashlib.sha256(raw).hexdigest(),'decodedRGBSHA256':hashlib.sha256(img.tobytes()).hexdigest(),'webpPixelsExact':True})
(args.out/'pages.json').write_text(json.dumps({'papers':papers,'pages':rows},ensure_ascii=False,indent=2)+'\n')
(args.out/'source-pixel-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
