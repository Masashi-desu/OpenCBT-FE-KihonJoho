#!/usr/bin/env python3
"""Explicit ignored-output renderer, never a network fetch or public installer.

Extract original embedded DCT bytes without JPEG re-encoding, then lossless RGB
WebP. Page76 is never emitted in full: only the reviewed instruction rectangle.
This is a metadata/byte operation, not permission or booklet admission.
"""
import argparse,hashlib,io,json
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

SHA=lambda b:hashlib.sha256(b).hexdigest()
QS='bb172e6225037b05e18aec455f7aec8ec66f3e82838c92a27bb50d2d203dbfb9'
ANS='50c0b5defdb6a579048671d6a371e1ecf982ad59d370c08d1909e16d0f7b0777'
def main():
 p=argparse.ArgumentParser();p.add_argument('--pdf',required=True);p.add_argument('--answer',required=True);p.add_argument('--unicode-dir',required=True);p.add_argument('--out',required=True);a=p.parse_args()
 out=Path(a.out).resolve();assert 'output' in out.parts and 'public' not in out.parts;out.mkdir(parents=True,exist_ok=True)
 qs=Path(a.pdf).read_bytes();ans=Path(a.answer).read_bytes();assert(SHA(qs),len(qs))==(QS,20020715);assert(SHA(ans),len(ans))==(ANS,200776)
 reader=PdfReader(io.BytesIO(qs));assert len(reader.pages)==89;assert len(PdfReader(io.BytesIO(ans)).pages)==4
 def page_record(n,name):
  page=reader.pages[n-1];resources=page['/Resources']['/XObject'];images=[(key,obj.get_object()) for key,obj in resources.items() if obj.get_object().get('/Subtype')=='/Image'];assert len(images)==1
  key,obj=images[0];assert obj.get('/Filter')=='/DCTDecode';raw=obj._data;image=Image.open(io.BytesIO(raw)).convert('RGB');assert image.size==((2026,1432) if n==2 else (1432,2026))
  operations=page.get_contents().operations;ops=[op.decode('ascii') for _,op in operations];assert ops==['q','cm','Do','Q'];matrix=[float(x) for operands,op in operations if op==b'cm' for x in operands]
  crop=None
  if n==76:
   assert SHA(raw)=='4481eff6a24dd891415fffd5f03e098c82d9e06dfc93538dfad0fb5788cf6645';crop=[0,0,1432,1240];image=image.crop(tuple(crop));assert SHA(image.tobytes())=='b50516ce98e9ad95ddff592e475d5f467d84ae187bf4d545f54ed5f2c8f75f56'
  dest=out/'assets'/name;dest.parent.mkdir(parents=True,exist_ok=True);image.save(dest,format='WEBP',lossless=True,method=6,exact=True);encoded=dest.read_bytes();decoded=Image.open(io.BytesIO(encoded)).convert('RGB');assert decoded.size==image.size and decoded.tobytes()==image.tobytes()
  if n==76:assert SHA(encoded)=='fc293fd67f28ab4dcbe0c961cf6e6d12384b2525651dcf199a81ac5d647e988b'
  return {'page':n,'name':name,'width':image.width,'height':image.height,'byteLength':len(encoded),'sha256':SHA(encoded),'rawImageExtraction':{'method':'original_DCT_stream_to_lossless_RGB_WebP','xobject':str(key),'sourceJPEGByteLength':len(raw),'sourceJPEGSHA256':SHA(raw),'decodedRGBSHA256':SHA(image.tobytes()),'webpDecodedRGBSHA256':SHA(decoded.tobytes()),'pageMatrix':matrix,'contentOperators':ops,'crop':crop,'resized':False,'allPixelsEqual':True}}
 collection={'id':'2018h30h-fe-pm','questionPaper':{'url':'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_qs.pdf','sha256':QS,'byteLength':len(qs),'pageCount':89},'answerPaper':{'url':'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fabr-att/2018h30h_fe_pm_ans.pdf','sha256':ANS,'byteLength':len(ans),'pageCount':4}}
 papers={role:{k:collection[role][k] for k in ['sha256','byteLength']} for role in ['questionPaper','answerPaper']}
 all_records=[]
 for question,pages in [(9,range(44,50)),(10,range(50,56)),(11,range(56,63)),(12,range(63,68))]:
  records=[page_record(n,f'2018h30h-fe-pm-{question}-p{n}.webp') for n in pages];materials=[page_record(2,'2018h30h-fe-pm-10-p2.webp')] if question==10 else [page_record(n,f'2018h30h-fe-pm-12-casl-p{n}.webp') for n in range(74,80)] if question==12 else []
  data={'collection':collection,'rendered':{'papers':papers,'pages':records},'materials':materials}
  if question==12:
   u=Path(a.unicode_dir);ud=(u/'unicode-17-data.txt').read_bytes();license=(u/'unicode-license-current.txt').read_bytes();readme=(u/'unicode-17-readme.txt').read_bytes();terms=(u/'unicode-terms-current.html').read_bytes()
   assert SHA(ud)=='2e1efc1dcb59c575eedf5ccae60f95229f706ee6d031835247d843c11d96470c';assert SHA(license)=='e7a93b009565cfce55919a381437ac4db883e9da2126fa28b91d12732bc53d96';assert len(license)==1995
   rows=[]
   for line_no,line in enumerate(ud.decode('utf8').splitlines(),1):
    fields=line.split(';')
    if fields[0] in ['0020','002E']+[f'003{n}' for n in range(10)]:rows.append({'line':line_no,'code':fields[0],'name':fields[1]})
   assert len(rows)==12
   data['unicode']={'dataSHA256':SHA(ud),'dataByteLength':len(ud),'readmeSHA256':SHA(readme),'termsSHA256':SHA(terms),'licenseSHA256':SHA(license),'licenseByteLength':len(license),'licenseText':license.decode('utf8'),'rows':rows}
  (out/f'pm{question}-input.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');all_records+=records+materials
 (out/'RENDER-RECEIPT.json').write_text(json.dumps({'sourcePDFSHA256':QS,'sourceAnswerSHA256':ANS,'pages':all_records,'fullPage76Emitted':False,'permissionOrAdmission':False},ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
