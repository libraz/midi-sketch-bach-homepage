---
title: 検証器ルール一覧
description: MIDI Sketch Bach の検証器が返す全60ルールの索引。対位法コースの該当章へのリンク付き。
---

# 検証器ルール一覧

このページは検証器の全60ルールのフラットな索引です。音楽上の考え方を学ぶには[対位法コース](/ja/docs/counterpoint)を読み、エラー・ログ・イベントデバッグでルール ID を見たときは、このページから該当する解説へ飛んでください。

::: info ルール ID の読み方
ルール ID は品質スコアではなく、破られた音楽的契約の名前です。同じ楽句が複数の契約に同時に違反することもあります。検証器は最初の失敗で停止せず、その処理で見つけた失敗をまとめ、各違反を指摘対象のスパンとともに報告します。
:::

## ルールの層

検証器は作曲の複数の層を守ります。局所的な音程ルールと形式の同一性ルールはどちらも失敗ですが、理解に必要な文脈が異なります。

![その層のルールが譜面のどれだけを見る必要があるかで並べた 9 つの層と、3 つの FailKind](/images/validator-layers-ja.svg)

| 層 | 守るもの | 必要な文脈 |
|----|----------|------------|
| 局所的な縦の響き | 安定した音程、和声音 | ある拍で鳴る二声 |
| 旋律の妥当性 | 一つの声部内の自然な動き | 同じ声部の前後の音 |
| 声部の独立 | 別々に聴き取れる線 | 二つの時点にまたがる二声 |
| 調性の文法 | 終止、借用和音、転調 | 和声プランとフレーズ上の位置 |
| フーガの構造 | 主唱・応唱・対主題・模倣 | 宣言された素材とエントリのスパン |
| フレーズの構造 | 小節グリッドの一貫性 | フレーズのメタデータと拍子 |
| 形式の同一性 | 固定されたグラウンド・定旋律・フィグレーションの役割 | 素材キャリアと形式の配置 |
| 物理的な制約 | 演奏可能な音域、楽器の音域 | 声部音域・ペダル音域・楽器傾向 |
| 宣言との整合 | 出力された音が形式の宣言どおりか | 来歴レコードと作譜済みスパン |

すべての失敗には `FailKind` も付きます。`MusicalFail`（対位法・和声の契約。既定値）、`StructuralFail`（形式の構造的な約束——不変キャリアと終止レイアウトの破綻）、`ConfigFail`（不正なリクエスト。作曲前に報告）の三種です。

::: info 停止させる失敗と参考情報
最終スコアの検査は、作譜済みの素材も含めて出力された音そのものを対象にします。対位法の観測レコーダーが扱う検出結果では、すべての対象音が有効な作譜コンテキストを持つ場合に限り、実行を止める失敗ではなく参考情報として記録されます。`Compose` 音は作曲器が作譜した音として扱い、`Material` 音は宣言との一致を、`Ornament` 音は宣言されたキャリア内での実現マーカーと音域を確認します。それ以外は、対処可能なスパンを持つ停止失敗としてレコーダーから送られます。生成時は、対象音がすべて不変の `Material` または `Ornament` なら `exempted` として数え、それ以外（`Compose` 音を含む）は `gated` として停止失敗へ送ります。声部交差、掛留、終止、宣言整合性などの直接検査はそれぞれ失敗を直接追加するため、作譜コンテキストに関係なく停止します。さらに、形式別の対位法予算で閉じている垂直規則に一致すると、`span_id: null` の停止 `MusicalFail` が1件追加されます。現在の公開生成経路は停止させる失敗があると処理を中止し、スコアの修復や生成の再試行は行いません。`getDiagnostic()` が返すのは停止させる失敗であり、参考情報ではありません。
:::

## 幾何分類・振り分け・形式別予算

生成されたスコアは、検出結果を失敗または参考情報へ振り分ける前に、対位法の一致を記録します。`geometry` の `linear` は1声部内の進行、`vertical` は発音中の声部同士または声部と和声プランの関係を示します。`unclassified` は幾何分類表に登録されていない規則 ID 用です。`total` は振り分け前の一致数、`gated` は停止させる失敗へ送った件数、`exempted` は生成時にすべての対象音が不変の `Material` または `Ornament` だったため除外した件数です。このレコーダーで扱う検出結果では、`total - gated - exempted` が参考情報として表現される一致数です。独立した参考情報ルールには観測値がない場合があります。

形式別予算の対象は垂直規則だけです。予算表にある規則は、その形式ではまだ開いています。一致は `counterpoint_observations` に記録されますが、それだけでは処理を停止しません。ソースの `Unresolved` 行は未修復の作業を、`Accepted` 行は測定したトレードオフまたは形式上の制約を記録します。どちらも開いている行で、ゲートは理由ではなく行の存在を使います。形式の表にない垂直規則は閉じています。その規則の観測値が1件以上になると、`span_id: null` の停止 `MusicalFail` が1件追加されます。旋律規則はこの予算の対象外で、前述の素材または作譜済みコンテキストによる通常の振り分けを使います。[対位法予算のソース](https://github.com/libraz/midi-sketch-bach/blob/973659e705915c2178d72663d5a65ab95d3cae4b/src/composer/counterpoint_budget.cpp)が10形式の開いている `(form, rule_id)` 組み合わせを定める完全な許可リストの正本です。

この予算表は、開いている規則を音楽的に望ましいと宣言するものではなく、実装が現在許容して測定する形式別の境界です。行を削除するとその形式で規則が閉じ、行を追加すると再び開きます。

## 声部の運動と独立

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `parallel_fifth` | [2. 運動](/ja/docs/counterpoint/motion) | 両声部が同方向に動き、直前と現在の縦の音程がどちらも完全5度に縮約される。 |
| `parallel_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 両声部が同方向に動き、直前と現在の音程がどちらもユニゾンまたはオクターヴに縮約される。 |
| `anti_parallel_perfect` | [2. 運動](/ja/docs/counterpoint/motion) | 反行で、同じ種類の完全音程（完全5度またはユニゾン／オクターヴ）から同じ種類へ進む。 |
| `battuta` | [2. 運動](/ja/docs/counterpoint/motion) | 反行で新しいユニゾン／オクターヴへ進み、到達時の上声が全音より大きく下降跳躍する。 |
| `hidden_parallel_fifth` | [2. 運動](/ja/docs/counterpoint/motion) | 異なる直前の音程から同方向運動で完全5度へ入り、慣例上の上声が全音より大きく（>2半音）跳躍する。 |
| `hidden_parallel_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 同じ隠伏完全音程の条件でユニゾン／オクターヴへ入る。上声ペアや強拍だけに限定されない。 |
| `voice_crossing` | [2. 運動](/ja/docs/counterpoint/motion) | 慣例上の上声（小さいインデックス）が下声（大きいインデックス）より低い音を鳴らす。トリオ・ソナタでは上二声の一時的な交換を許す場合があるが、持続する交差は失敗となり、全体の音域も重なる必要がある。 |
| `spacing_adjacent_voices_within_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 三声以上で、隣接する上声部の間隔がオクターヴを超えた。 |
| `invertible_at_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 隣接する上声部のペアが構造的アクセントで並行オクターヴを作った。転回すると並行ユニゾンになるためで、最下ペアは対象外。 |

発音中のペアで、現在の下声部の音に `CadenceCellCommitted` プロビナンスビットが付いている拍では、`parallel_fifth`、`parallel_octave`、`hidden_parallel_fifth`、`hidden_parallel_octave`、`anti_parallel_perfect`、`battuta` を検査しません。この終止セルの除外は、声部交差、間隔、その他の検査を一括して免除するものではありません。

## 不協和音の扱い

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `strong_beat_dissonance` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 構造的アクセントの音がその場の和音構成音の外にある。宣言された第7音は和音構成音に含める。 |
| `vertical_dissonance` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 強拍で同時に鳴る声部が、支えのない不協和音程を作った。 |
| `unprepared_dissonance` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 弱拍の非三和音音が、前後とも順次進行（最大2半音）になっていない。 |
| `suspension_preparation` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 掛留の準備が、最下声の相手に対して協和になっていない。 |
| `suspension_preparation_duration` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 準備が、それが準備する掛留より短い。 |
| `suspension_metrical_accent` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 掛留が準備より強い拍に置かれていない。 |
| `suspension_resolution_step_down` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 掛留が定められた方向への順次進行で解決していない（4-3／7-6／9-8 は下行、エンジンの `Sus2_3` は上行）。歴史的な下声部の 2-3 掛留は下行解決として説明されることが多いため、用語を対応付けるときは [Open Music Theory](https://viva.pressbooks.pub/openmusictheorycopy/chapter/fourth-species-counterpoint/) も参照してください。 |
| `suspension_interval` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 掛留声部と同時に鳴る他声部の最低音との音程が、宣言された型（4-3 / 7-6 / 9-8 / 2-3）に合っていない。2-3 では掛留声部がバスなので、そこから上向きに測定します。 |
| `suspension_seventh_sixth` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 宣言された 7-6 掛留が、バス上の本物の7度→6度の形を作っていない。 |

## 旋律のルール

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `augmented_melodic` | [4. 旋律](/ja/docs/counterpoint/melody) | 増音程の旋律進行（副次ドミナント圏では免除）。 |
| `diminished_melodic` | [4. 旋律](/ja/docs/counterpoint/melody) | 減音程の旋律進行（同上の免除）。 |
| `tritone_melodic` | [4. 旋律](/ja/docs/counterpoint/melody) | 三全音の跳躍（同上の免除）。 |
| `consecutive_leaps` | [4. 旋律](/ja/docs/counterpoint/melody) | 大跳躍（5度以上）が2回連続した（方向は問わない）。 |
| `leading_tone_resolution` | [4. 旋律](/ja/docs/counterpoint/melody) | 印づけられた導音が主音へ上行解決していない。 |
| `voice_range_integrity` | [4. 旋律](/ja/docs/counterpoint/melody) | 音が声部の宣言された MIDI 音域の外に出た。 |

## 調性の文法

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `cadence_voice_leading` | [5. 調性](/ja/docs/counterpoint/tonality) | 終止の声部が宣言された終止型（完全・不完全正格・変格・半・偽・フリギア・ピカルディ）に一致しない。**StructuralFail** になるのは終止に到達する声部がない場合、または終止位置が最初の拍より前の場合だけで、単旋律形式は旋律終止として検査する。声部進行の不一致そのものは MusicalFail。 |
| `doubling_no_leading_tone` | [5. 調性](/ja/docs/counterpoint/tonality) | 導音を含む和音で導音が重複された。 |
| `doubling_no_seventh` | [5. 調性](/ja/docs/counterpoint/tonality) | 和音の第7音が重複された。 |
| `cross_relation` | [5. 調性](/ja/docs/counterpoint/tonality) | 後の開始位置で有効な局所調で、同じ音度を異なる変化記号で鳴らす声部が、同時、またはどちらの声部にも途中の開始位置がない隣接する音符開始位置で続けて鳴らす。異なる音度どうしの自然な半音は除外。 |
| `secondary_dominant_resolution` | [5. 調性](/ja/docs/counterpoint/tonality) | 副次ドミナントの次に目標の度数が来ていない。 |
| `modulation_pivot_chord_required` | [5. 調性](/ja/docs/counterpoint/tonality) | ピボット転調のピボット和音が両方の調で全音階的でない。 |

## フーガの構造

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `tonal_answer_dominant_mapping` | [6. フーガ](/ja/docs/counterpoint/fugue) | 変応の冒頭が主唱の開始ピッチクラスを I↔V で写像していない。 |
| `countersubject_continuous` | [6. フーガ](/ja/docs/counterpoint/fugue) | 応唱の区間で対主題が途切れた。 |
| `episode_motif_derived` | [6. フーガ](/ja/docs/counterpoint/fugue) | 嬉遊部の音が、宣言された元スライス×モチーフ変形の結果と一致しない。 |
| `sequence_pattern_consistency` | [6. フーガ](/ja/docs/counterpoint/fugue) | ゼクエンツの段が、種の宣言どおりの正確な移調になっていない。 |
| `imitation_entry_match` | [6. フーガ](/ja/docs/counterpoint/fugue) | 後続声部のエントリが、宣言された時間差または音程差とずれている。 |
| `imitation_entry_realization` | [6. フーガ](/ja/docs/counterpoint/fugue) | 出力された音が、宣言された主唱・応唱のエントリをキャリア声部で実際には実現していない。 |
| `countersubject_invertible` | [6. フーガ](/ja/docs/counterpoint/fugue) | 対主題が強拍で主唱に対して完全5度を作り、オクターヴで転回できない。**参考情報のみ** — 自由書法の対主題では正当に起こるため、実行を止めることはない。 |
| `middle_entry_in_related_key` | [6. フーガ](/ja/docs/counterpoint/fugue) | 中間入りの調が V/vi/IV/ii の一族でない、またはその調の音階から外れた。 |
| `stretto_overlap_valid` | [6. フーガ](/ja/docs/counterpoint/fugue) | ストレッタのエントリが重なっていない、または後続が正確な移調でない。 |
| `pedal_point_tonic_or_dominant` | [6. フーガ](/ja/docs/counterpoint/fugue) | 保続音が主音・属音以外の音度に置かれた。 |

## フレーズ・テクスチュア・物理的制約

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `phrase_periodicity_4_or_8_bar` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 宣言されたフレーズ開始の間隔が3〜8小節の整数小節ではない。互換性のため固定されたルール ID には、以前の「4または8小節」という名前が残っている。 |
| `anacrusis_consistent` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 弱起のメタデータとフレーズ開始のメタデータが食い違っている。 |
| `pedal_range_soft_penalty` | [7. 形式](/ja/docs/counterpoint/form-constraints) | オルガンのペダル音が演奏可能な音域（MIDI 12〜62）の外に出た。 |
| `voice_independence_threshold` | [7. 形式](/ja/docs/counterpoint/form-constraints) | トリオ・ソナタの声部ペアの独立度スコアが 0.6 を下回った。 |
| `trio_upper_register_overlap` | [7. 形式](/ja/docs/counterpoint/form-constraints) | トリオ・ソナタの2つの上声部が音域をまったく共有せず、掛け合う一対ではなく別々の鍵盤に聞こえる。 |
| `section_contrast_required` | [7. 形式](/ja/docs/counterpoint/form-constraints) | ファンタジアの隣接セクションが密度でも音域でも対比していない。 |

## 形式の同一性

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `ground_bass_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | シャコンヌの再現が、同じ周回相対位置にある固執低音の小節頭の音高骨格を変えた。弱拍の細分音は比較しない。**StructuralFail。** |
| `passacaglia_ground_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | パッサカリアの再現が、同じ周回相対位置にある8小節グラウンドの小節頭の音高骨格を変えた。弱拍の細分音は比較しない。**StructuralFail。** |
| `cantus_firmus_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | コラール前奏曲の小節頭が宣言された骨格音を再現していない。**StructuralFail。** |
| `goldberg_aria_bass_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | ゴルトベルクの変奏ブロックが、宣言されたアリア・バスのすべての開始位置を、周回相対の開始位置・長さ・音高まで同じに再現していない。終端の `CodaCarrier` による主和音終止は最後のブロック範囲を置き換えられる。**StructuralFail。** |
| `variation_role_ornament_constraint` | [7. 形式](/ja/docs/counterpoint/form-constraints) | グラウンド役の変奏が4分音符より細かく分割された。 |
| `figuration_harmonic_consistency` | [7. 形式](/ja/docs/counterpoint/form-constraints) | フィグレーションの小節頭が非和声音で始まった。 |
| `toccata_archetype_compatible` | [7. 形式](/ja/docs/counterpoint/form-constraints) | トッカータのセクション原型が宣言された性格と両立しない。 |
| `implicit_voice_counterpoint` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 独奏弦のアルペジオの暗示声部（低音線・上声線）が旋律ルールに違反した。 |
| `arpeggio_no_parallel_perfect` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 暗示声部がセル間で完全音程の並行を作った。 |

## 宣言との整合

これらは音楽的な契約ではなく、出力された楽譜と宣言を突き合わせます。来歴の検査は最終スコアでのみ走りますが、`declared_doubling_integrity` は検証器が宣言された重複を認める前にも確認します。いずれも **StructuralFail** です。出力が宣言と一致していないため、再試行の前に宣言と出力された音を確認します。

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `note_provenance_alignment` | -- | ノート列と来歴列の長さが異なり、どの音も来歴に紐付けられない。 |
| `carrier_declaration_integrity` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 作譜済みキャリアを名乗る音が、そのキャリアの宣言された開始位置・長さ・音高と一致しない。 |
| `ornament_declaration_integrity` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 装飾音について、それが装飾するキャリアとの間で同じ不一致が起きた。 |
| `ornament_group_integrity` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 装飾の展開が元のキャリアを正確に覆っていない（隙間・重なり、または主要音以外で終わっている）。 |
| `declared_doubling_integrity` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 宣言された重複が、異なる2声部と主声部の音符を少なくとも1つ含む有効で空でない半開区間を指定していない、またはその区間内の出力された音符数・開始位置・長さ・移調後の音高と一致しない。**StructuralFail。** |

## デバッグの手順

1. ルール ID と `FailKind` を特定する。
2. 問題の音がイベント JSON で `source: "material"` / `"compose"` / `"ornament"` のどれかを確認する。
3. 局所ルールなら、前後の音のペアを調べる。
4. 構造ルールなら、宣言された形式・素材スパン・フレーズスパン・和声プランを調べる。
5. API レベルではなく音楽的なルールなら、リンク先のコース章を読む。

::: tip 役に立つメンタルモデル
形式ディレクターが構築する音楽オブジェクトを宣言する。既定では素材キャリアがすべての作譜済みスパンを再生し、採点付き探索は任意の自由対位法でのみ使われる。検証器は宣言された音楽的契約への違反をすべて報告し、公開生成経路は停止させる失敗があれば処理を中止する。
:::
