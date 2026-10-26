import type {StudyTerm} from '../study-acronyms';import {legacy2018CloudStudyTerms} from './legacy-2018-pm-cloud-study-terms';
export const legacy2018SpringPm4StudyTerms:StudyTerm[]=[...structuredClone(legacy2018CloudStudyTerms),
 {term:'PC',expansion:'Personal Computer',meaning:'本問では利用者が写真投稿・検索に用いるクライアントの一つ。'},
 {term:'ID',expansion:'Identifier',meaning:'対象を区別する識別子。本問では写真ごとに一意のIDを付け、属性情報と処理対象を対応付ける。'},
 {term:'URL',expansion:'Uniform Resource Locator',meaning:'資源の場所などを表す識別子。本問ではフロントサーバが写真のURLを作り、クライアントはそのURLで複製先へアクセスする。'},
 {term:'HTTP',expansion:'Hypertext Transfer Protocol',meaning:'Webの要求と応答をやり取りする通信規約。本問の表3では各サーバが受け付ける規約とポート番号を対応付ける。'},
 {term:'TLS',expansion:'Transport Layer Security',meaning:'通信を暗号化し相手認証などを行う通信規約。本問の負荷分散装置はHTTP over TLSを443番ポートで受け付ける。'},
].map(term=>({...term,sources:['2018h30h-fe-pm-4']}));
