# 2019年度秋期・旧午後 内容検査の参照資料

出典：令和元年度 秋期 基本情報技術者試験 午後／©2019 独立行政法人情報処理推進機構（IPA）。

- 問題：<https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_qs.pdf>、SHA256 `03bce7f05aea913ec2341f6947b35c775be8731a443655119e8696ff52b99312`
- 解答例：<https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_fe_pm_ans.pdf>、SHA256 `a84f5f62f34a48500f4845028bff19bfab827ede632f2ebaf47559bc6ce4b78a`

参照頁は問1=5〜9、問2=10〜14、問3=15〜19、問4=20〜23、問5=24〜27、問6=28〜32、問7=33〜37、問8=38〜44、問9=45〜49、問10=50〜56、問11=57〜63、問12=64〜69、問13=70〜76、必要共通=3〜4・85〜90。問12の数値ISA確認は79〜84の必要数値部分だけで、81下段JISの文面・図表は含めない。

`pm9-reference.c` は原47〜48ページから別に転記して固定した参照C。実srcの表示Cも別にコンパイルし、両者の出力をASan/UBSan下で比較する。`pm10-source-70-lines.txt` は原51〜53ページの70番号行を固定した字句照合用資料。これらを生成器の出力から作り直さない。

`PeerProbe.java` はMap登録・通知キュー・停止状態を独立に確認するテストコード、`OutputProbe.java` は実Testerの生成したworkerと実リスナを動かし、原58/62/63ページの「コロン＋半角空白1個」を独立に期待するテストコードである。入力と正答は原資料・独立査読から固定し、生成器の正答計算を期待値に使わない。Java8 APIの必要挙動は公式Map/HashMap/List/ArrayList文書と実Java8互換実行で確認した。原API付録の文面・表を複製するfixtureではない。

`tests/helpers` の表計算、CASL数値実行器、macro実行器は独立した検算用実装。CASLでは表示命令列との対応、具体的SP/PR・stack/literal pool、全誤答の反例を調べ、別の十進文字列oracleで全2,997,001入力も比較する。native CASL処理系や全ISAの実装とは称しない。問13dの8式は原76ページから固定し、ウはi/i/j、正答はキのままとする。

問5の未確認質問票原文・原図、Java原API付録、JIS原文・図表を新しいfixtureへ混入させない。この候補の作成時点ではRoot素材scope・通常採用は未承認であり、Source/Rightsの用途別状態を承認へ変更するものではない。
