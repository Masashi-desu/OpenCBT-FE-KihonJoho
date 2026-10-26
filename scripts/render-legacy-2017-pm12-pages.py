"""Bounded Q12 source assets only. Verify official bytes first; never write public/."""
import argparse, hashlib, json, subprocess, tempfile
from pathlib import Path
from PIL import Image
parser=argparse.ArgumentParser()
parser.add_argument('--qs',type=Path,required=True)
parser.add_argument('--ans',type=Path,required=True)
parser.add_argument('--out',type=Path,required=True)
parser.add_argument('--pdfimages',default='pdfimages')
args=parser.parse_args()
papers={}
for role,file,sha,size in [('questionPaper',args.qs,'7d976c989149a8027c45cce63e420af0b4da8967e563146220dfa1e50eba43c8',13923067),('answerPaper',args.ans,'7d83ed5839b533c1a2bc804698e08eb6bb55865ef1aef3f74e15c42faad7772b',202195)]:
    data=file.read_bytes();assert len(data)==size and hashlib.sha256(data).hexdigest()==sha
    papers[role]={'sha256':sha,'byteLength':size}
assert not (args.out/'pages.json').exists()
(args.out/'assets').mkdir(parents=True,exist_ok=True)
rows=[]
raw_rows=[]
with tempfile.TemporaryDirectory(prefix='pm12-pages-',dir=args.out) as temp:
    prefix=Path(temp)/'page'
    subprocess.run([args.pdfimages,'-f','58','-l','62','-j',str(args.qs),str(prefix)],check=True)
    images=sorted(Path(temp).glob('page-*.jpg'));assert len(images)==5
    for page,file in zip(range(58,63),images):
        img=Image.open(file).convert('RGB')
        name=f'2017h29h-fe-pm-12-p{page}.webp';target=args.out/'assets'/name
        img.save(target,format='WEBP',lossless=True)
        decoded=Image.open(target).convert('RGB');assert decoded.size==img.size and decoded.tobytes()==img.tobytes()
        data=target.read_bytes();rows.append({'page':page,'name':name,'width':img.width,'height':img.height,'byteLength':len(data),'sha256':hashlib.sha256(data).hexdigest()})
        raw_rows.append({'page':page,'rawJPEGByteLength':file.stat().st_size,'rawJPEGSha256':hashlib.sha256(file.read_bytes()).hexdigest(),'decodedRGBPixelSha256':hashlib.sha256(img.tobytes()).hexdigest(),'losslessWebpPixelsExact':True,'rawExportMethod':'Poppler pdfimages -j DCT stream; no JPEG reencoding'})
(args.out/'pages.json').write_text(json.dumps({'papers':papers,'pages':rows,'rawImageExtraction':raw_rows},ensure_ascii=False,indent=2)+'\n')
