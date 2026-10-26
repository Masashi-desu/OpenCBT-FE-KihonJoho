import type {Asset} from './types';

/** Header and declared extension/MIME checks. A successful header check is not
 * a full decode; the browser separately decodes the hash-pinned bytes and
 * verifies dimensions before showing the asset. */
export function hasAssetSignature(asset: Pick<Asset,'path'|'mediaType'>, raw: Uint8Array): boolean {
  const extension=asset.path.split('.').at(-1);
  const ascii=(start:number,end:number)=>String.fromCharCode(...raw.slice(start,end));
  if(asset.mediaType==='image/webp')return extension==='webp'&&raw.length>=12&&ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';
  if(asset.mediaType==='image/png')return extension==='png'&&raw.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>raw[i]===n);
  if(asset.mediaType==='image/jpeg')return extension==='jpg'&&raw.length>=3&&raw[0]===255&&raw[1]===216&&raw[2]===255;
  return false;
}
