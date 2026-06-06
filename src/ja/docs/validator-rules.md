---
title: 検証器ルール一覧
description: MIDI Sketch Bach の検証器が返す全47ルールの索引。対位法コースの該当章へのリンク付き。
---

# 検証器ルール一覧

このページは検証器の全47ルールのフラットな索引です。音楽上の考え方を学ぶには[対位法コース](/ja/docs/counterpoint)を読み、エラー・ログ・イベントデバッグでルール ID を見たときは、このページから該当する解説へ飛んでください。

::: info ルール ID の読み方
ルール ID は品質スコアではなく、破られた音楽的契約の名前です。同じ悪い楽句が複数の契約に同時に違反することもあります。各違反は指摘対象のスパンとともに報告されるので、レポートの最初の失敗から見ていきます。
:::

## ルールの層

検証器は作曲の複数の層を守ります。局所的な音程ルールと形式の同一性ルールはどちらも失敗ですが、理解に必要な文脈が異なります。

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

すべての失敗には `FailKind` も付きます。`MusicalFail`（対位法・和声の契約。既定値）、`StructuralFail`（形式の構造的な約束——不変キャリアと終止レイアウトの破綻）、`ConfigFail`（不正なリクエスト。作曲前に報告）の三種です。

## 声部の運動と独立

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `parallel_fifth` | [2. 運動](/ja/docs/counterpoint/motion) | 両声部が動き、直前と現在の縦の音程がどちらも完全5度。 |
| `parallel_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 両声部が動き、直前と現在の音程がどちらもユニゾンまたはオクターヴ。 |
| `hidden_parallel_fifth` | [2. 運動](/ja/docs/counterpoint/motion) | 5度以外の音程から、同方向の運動で完全5度に着地。 |
| `hidden_parallel_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 上声部ペアの強拍で、同方向の運動でオクターヴに着地。 |
| `voice_crossing` | [2. 運動](/ja/docs/counterpoint/motion) | 下の声部が上の声部を越えた（声部の上下関係はテクスチュアの契約）。 |
| `spacing_adjacent_voices_within_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 三声以上で、隣接する上声部の間隔がオクターヴを超えた。 |
| `invertible_at_octave` | [2. 運動](/ja/docs/counterpoint/motion) | 上声部ペアが強拍で並行8度を作った。転回すると並行ユニゾンになる。 |
| `fourth_only_on_weak_beat` | [2. 運動](/ja/docs/counterpoint/motion) | 上声部ペアの強拍に完全4度が柱として置かれた。 |

## 不協和音の扱い

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `strong_beat_dissonance` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 小節頭の音がその場の三和音の外にある。 |
| `vertical_dissonance` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 強拍で同時に鳴る声部が、支えのない不協和音程を作った。 |
| `unprepared_dissonance` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 弱拍の不協和が順次進行で出入りしていない。 |
| `suspension_preparation` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 掛留の準備が協和でない、または掛留へタイでつながっていない。 |
| `suspension_resolution_step_down` | [3. 不協和](/ja/docs/counterpoint/dissonance) | 掛留が定められた方向への順次進行で解決していない（4-3 / 7-6 / 9-8 は下行、2-3 は上行）。 |
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
| `cadence_voice_leading` | [5. 調性](/ja/docs/counterpoint/tonality) | 外声が宣言された終止型（完全・不完全正格・変格・半・偽・フリギア・ピカルディ）に一致しない。終止レイアウトの破綻（2声未満・独立したバスがない）は **StructuralFail**、声部進行の不一致そのものは MusicalFail。 |
| `doubling_no_leading_tone` | [5. 調性](/ja/docs/counterpoint/tonality) | 導音を含む和音で導音が重複された。 |
| `doubling_no_seventh` | [5. 調性](/ja/docs/counterpoint/tonality) | 和音の第7音が重複された。 |
| `cross_relation` | [5. 調性](/ja/docs/counterpoint/tonality) | 1拍の窓の中で、声部間に同じ音度の半音階的衝突（対斜）が生じた。 |
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
| `middle_entry_in_related_key` | [6. フーガ](/ja/docs/counterpoint/fugue) | 中間入りの調が V/vi/IV/ii の一族でない、またはその調の音階から外れた。 |
| `stretto_overlap_valid` | [6. フーガ](/ja/docs/counterpoint/fugue) | ストレッタのエントリが重なっていない、または後続が正確な移調でない。 |
| `pedal_point_tonic_or_dominant` | [6. フーガ](/ja/docs/counterpoint/fugue) | 保続音が主音・属音以外の音度に置かれた。 |

## フレーズ・テクスチュア・物理的制約

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `phrase_periodicity_4_or_8_bar` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 宣言されたフレーズ開始の間隔が4小節でも8小節でもない。 |
| `anacrusis_consistent` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 弱起のメタデータとフレーズ開始のメタデータが食い違っている。 |
| `pedal_range_soft_penalty` | [7. 形式](/ja/docs/counterpoint/form-constraints) | オルガンのペダル音が演奏可能な音域（MIDI 12〜62）の外に出た。 |
| `voice_independence_threshold` | [7. 形式](/ja/docs/counterpoint/form-constraints) | トリオ・ソナタの声部ペアの独立度スコアが 0.6 を下回った。 |
| `section_contrast_required` | [7. 形式](/ja/docs/counterpoint/form-constraints) | ファンタジアの隣接セクションが密度でも音域でも対比していない。 |

## 形式の同一性

| Rule ID | コースの章 | 読み方 |
|---------|------------|--------|
| `ground_bass_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | シャコンヌの固執低音が周回の途中で変わった。**StructuralFail。** |
| `passacaglia_ground_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | パッサカリアの8小節グラウンドが周回の途中で変わった。**StructuralFail。** |
| `cantus_firmus_immutable` | [7. 形式](/ja/docs/counterpoint/form-constraints) | コラール前奏曲の小節頭が宣言された骨格音を再現していない。**StructuralFail。** |
| `variation_role_ornament_constraint` | [7. 形式](/ja/docs/counterpoint/form-constraints) | グラウンド役の変奏が4分音符より細かく分割された。 |
| `figuration_harmonic_consistency` | [7. 形式](/ja/docs/counterpoint/form-constraints) | フィグレーションの小節頭が非和声音で始まった。 |
| `toccata_archetype_compatible` | [7. 形式](/ja/docs/counterpoint/form-constraints) | トッカータのセクション原型が宣言された性格と両立しない。 |
| `implicit_voice_counterpoint` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 独奏弦のアルペジオの暗示声部（低音線・上声線）が旋律ルールに違反した。 |
| `arpeggio_no_parallel_perfect` | [7. 形式](/ja/docs/counterpoint/form-constraints) | 暗示声部がセル間で完全音程の並行を作った。 |

## デバッグの手順

1. ルール ID と `FailKind` を特定する。
2. 問題の音がイベント JSON で `source: "material"` / `"compose"` / `"ornament"` のどれかを確認する。
3. 局所ルールなら、前後の音のペアを調べる。
4. 構造ルールなら、宣言された形式・素材スパン・フレーズスパン・和声プランを調べる。
5. API レベルではなく音楽的なルールなら、リンク先のコース章を読む。

::: tip 役に立つメンタルモデル
フォームディレクタが「どんな音楽的オブジェクトを作るか」を宣言する。候補探索が編集可能なスパンを埋める。素材キャリアが固定スパンを再生する。検証器は宣言された音楽的契約を破った結果を拒否する。
:::
