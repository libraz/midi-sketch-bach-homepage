---
title: 対位法コース
description: MIDI Sketch Bach の検証器が実装するバロック対位法の規則を、五線譜と音で学ぶコース。
---

# 対位法コース

MIDI Sketch Bach では、対位法は雰囲気づくりの説明文ではありません。コンポーザは素材を組み立て、演奏可能な候補音を探索し、その結果を明示的な音楽上の制約——現行検証器では 47 の名前付きルール——で検証します。このコースでは、その制約をエンジンが見ているとおりの形で学びます。一つひとつが検証可能な小さな契約であり、すべて五線譜の譜例で示され、音でも確かめられます。

::: tip 用語が初めてなら
本文中でも各規則はその場で説明しますが、基本語として **声部**、**小節**、**和音**、**音程**、**5度**、**終止**、**強拍** が出てきます。最初の土台——五線譜の読み方と、なぜ小節の1拍目が特別なのか——は[エンジニアのための音楽用語入門](/ja/docs/music-primer)にまとめています。
:::

## なぜルール一覧ではなくコースなのか

`parallel_fifth` のようなルール IDは、音楽的な推論の連鎖の*終点*です。「これが禁則なのは二つの声部が一つに溶けて聞こえるからで、それが問題なのは、対位法が独立した複数の旋律を同時に鳴らす技法だからだ」——この連鎖を遡って読めるようになると、検証レポートは恣意的な拒絶ではなく、読める文章になります。コースはこの連鎖を順番にたどります。

| 章 | 学ぶこと | 扱うルール |
|----|----------|------------|
| [1. 音程と協和](/ja/docs/counterpoint/intervals) | 同時に鳴る2音の分類——完全協和・不完全協和・不協和、そして両義的な4度 | すべての垂直ルールの土台 |
| [2. 声部の運動と並行禁則](/ja/docs/counterpoint/motion) | 4種類の相対運動。並行・隠伏の完全音程が禁じられる理由。声部交差・間隔・転回対位法 | `parallel_fifth`, `parallel_octave`, `hidden_parallel_fifth`, `hidden_parallel_octave`, `voice_crossing`, `spacing_adjacent_voices_within_octave`, `invertible_at_octave`, `fourth_only_on_weak_beat` |
| [3. 不協和音の扱い](/ja/docs/counterpoint/dissonance) | 強拍は和声音を要求し、弱拍は経過音・刺繍音を許す。4種類の掛留 | `strong_beat_dissonance`, `vertical_dissonance`, `unprepared_dissonance`, `suspension_preparation`, `suspension_resolution_step_down`, `suspension_seventh_sixth` |
| [4. 旋律の書法](/ja/docs/counterpoint/melody) | 各声部を一本の旋律として評価する。禁止される跳躍、跳躍の回復、導音の義務 | `augmented_melodic`, `diminished_melodic`, `tritone_melodic`, `consecutive_leaps`, `leading_tone_resolution`, `voice_range_integrity` |
| [5. 調性の文法](/ja/docs/counterpoint/tonality) | 7種類の終止、傾向音の重複禁止、対斜、副次ドミナント、ピボット転調 | `cadence_voice_leading`, `doubling_no_leading_tone`, `doubling_no_seventh`, `cross_relation`, `secondary_dominant_resolution`, `modulation_pivot_chord_required` |
| [6. フーガの技法](/ja/docs/counterpoint/fugue) | 主唱と応唱、対主題、嬉遊部とゼクエンツ、模倣、ストレッタ、保続音 | `tonal_answer_dominant_mapping`, `countersubject_continuous`, `episode_motif_derived`, `sequence_pattern_consistency`, `imitation_entry_match`, `middle_entry_in_related_key`, `stretto_overlap_valid`, `pedal_point_tonic_or_dominant` |
| [7. 形式固有の制約](/ja/docs/counterpoint/form-constraints) | 不変の固執低音と定旋律、フィグレーションの和声、独奏弦の暗示声部、フレーズの周期、テクスチュアの契約 | `ground_bass_immutable`, `passacaglia_ground_immutable`, `cantus_firmus_immutable`, `variation_role_ornament_constraint`, `figuration_harmonic_consistency`, `toccata_archetype_compatible`, `implicit_voice_counterpoint`, `arpeggio_no_parallel_perfect`, `phrase_periodicity_4_or_8_bar`, `anacrusis_consistent`, `pedal_range_soft_penalty`, `voice_independence_threshold`, `section_contrast_required` |

デバッグ用の全ルール ID 一覧は [検証器ルール一覧](/ja/docs/validator-rules)にあります。

## 譜例の読み方

各章の譜例は同じコンポーネントで描画されます。大半は合成例です。単体テストと同じ考え方で、一つのルールが発火する（あるいは合法的に回避される）最小の音楽的状況だけを、二段または三段の譜に切り出しています。**「バッハの実例」**バッジの付いた譜例は別物で、実際の作品——平均律クラヴィーア曲集、ゴルトベルク変奏曲、オルガン作品、無伴奏弦楽作品——からの引用です。引用されたすべての音は、掲載前に原典データと照合されています。合成例はルールの最小形を、実例はそのルールが実際の音楽で何を守っているかを見せてくれます。

<CounterpointStaff example="parallelFifths" locale="ja" />

::: info 楽譜に慣れていなくても
譜例は「図」として読めば十分です。**声部**は独立した一本の線で、並行処理のストリームのようなものです。上段が高い線、下段が低い線です。色付きのラベル、リング、枠、矢印は検証器が見ている場所を示す分析用オーバーレイで、追加の音符ではありません。
:::

譜例を見る順番:

1. **タイトル**と**ルールチップ**（赤い等幅のタグが検証器のルール ID）を読む。
2. ヘッダの**再生ボタン**で音を聴く——再生中は鳴っている音符が譜面上でハイライトされ、目と耳が同期します。禁則はたいてい耳で分かります。並行8度は本当に一つの声部に聞こえます。
3. 色付きのオーバーレイを探す。赤は違反、琥珀色は条件付きで許される響き、緑は正しい解決です。
4. 運動のルールでは直前の音の組と今の組を比べる。不協和のルールでは、印の付いた音が和音に属するか、順次進行で解決しているかを見る。
5. 比較用の譜例にはヘッダに*「声部を順に再生」*とあります。二つの段が同時にではなく順番に鳴ります（主題とその反行形、悪い版と直した版など）。また、一部の譜例にはピル型のボタン列が付いています。同じ図の別の抜粋——たとえば同じ低音主題の上の別の変奏——で、切り替えると譜面が描き直されます。

## エンジンはこれらの規則をどう適用するか

公開されている生成経路は `bach_generate_from_json` です。設定 JSON を読み、形式と小節数を決め、形式ごとの固定データを作り、Composer を走らせ、検証し、（不変の固執低音・定旋律の声部を除いて）必要に応じて装飾を加え、楽器を割り当てて、MIDI とイベント JSON を出力します。対位法の検証は `../midi-sketch-bach/src/composer/validator.cpp`、素材宣言は `material.h` が基準です。

検証器は「その場の響き」と「音の出どころ」を区別します。

| 用語 | エンジン内での意味 |
|------|--------------------|
| Compose 音 | 候補探索が選んだ音。Composer が作り直せる対象です。 |
| Material 音 | 主題、応唱、固執低音、定旋律、変奏など、あらかじめ宣言された素材の音です。 |
| 不変キャリア | 固執低音、パッサカリアの低音主題、定旋律。構造線が聴き取れるよう、装飾処理から除外されます。 |
| 強拍 | 小節頭。実装はそのまま `start_tick % ticks_per_bar == 0` です。和音への帰属をより厳しく見ます（[入門](/ja/docs/music-primer#強拍と弱拍)）。 |
| 弱拍 | 小節頭以外の位置。準備と解決が明確なら、経過音や装飾音として不協和を扱えます。 |

ペアの**両方**が不変の Material 音である場合、いくつかの検査はスキップされます。固定された入力はコンポーザに書き換えられないからです。どちらか一方でも生成された Compose 音であれば、問題は修正可能とみなされてルールが発火し、Compose 側が指摘されます。

## 失敗の種類

報告される失敗には、どの層が壊れたかを示す `FailKind` が付きます。

| 種別 | 意味 | 使うルール |
|------|------|------------|
| `MusicalFail` | 対位法・和声の契約違反。ほぼすべてのルールの既定値。 | 並行・不協和・旋律・重複・フーガ・フレーズ・テクスチュアの各ルール |
| `StructuralFail` | 形式の構造的な約束が破られた。 | `ground_bass_immutable`, `passacaglia_ground_immutable`, `cantus_firmus_immutable`。`cadence_voice_leading` も終止レイアウト自体が破綻している場合はこちら |
| `ConfigFail` | リクエスト自体が不正（作曲前に報告される）。 | 設定の検証。対位法ルールではない |

::: tip 実用的なメンタルモデル
フォームディレクタが「どんな音楽的オブジェクトを作るか」を宣言する。候補探索が編集可能なスパンを埋める。素材キャリアが固定スパンを再生する。検証器は宣言された音楽的契約を破った結果を拒否する。
:::

## 検証レポートの読み方

通常の生成で、検証器の失敗をユーザーが目にすることはありません。`FailedSpan` の報告は Composer をそのスパンの再生成へ送り返し、再試行もバックジャンプも尽きたときにだけ実行が `FailedSeed` として中止されます——代わりの音が黙って置かれることはありません。したがってレポートがあなたに届く形は二つです。実行が中止されたときのハード失敗メッセージと、成功したすべての曲に付いてくる音符ごとの監査記録です。

**1. 失敗の行。** ハード失敗では、ネイティブ CLI が違反1件につき1行を出力します（終了コード 1）。

```
Composer validation failed: 2 rule violations
  - parallel_fifth (span 17)
  - strong_beat_dissonance (span 17)
```

各行は、このコースが教えてきたルール ID（[検証器ルール一覧](/ja/docs/validator-rules)に索引があります）と、それが発火したスパンです。

**2. スパンとは何か。** スパンは「一つの声部 × 一つの時間領域」の切片です。スパンの境界は和声プランに従います。終止のアンカー、主題の入り、フレーズの継ぎ目は、すべて新しいスパンの始まりです。つまり「span 17」は抽象的な連番ではなく、*この声部のこの数小節*を名指ししています。

**3. スパンから小節へ。** `--generated-json` 付きで生成すると、インデックスが対応した2つのファイルが書き出されます。`<名前>.json`（`generated.v1`——音符ごとの tick・音高・声部・ベロシティ）と `<名前>.provenance.json`（`provenance.v1`——音符ごとのスパン・出自・スコア）です。この2つを往復します。

```bash
# span 17 に属する音符の index は?
jq '[.notes[] | select(.span_id == 17) | .index]' piece.provenance.json

# 音符 42 はタイムラインのどこ?
jq '.notes[42] | {start_tick, pitch, voice}' piece.json
```

4分音符 480 tick（ファイルの `ticks_per_beat` フィールド）、1小節4拍なら、`start_tick / 1920` が0始まりの小節番号です。tick 26880 の音は第15小節の頭に乗っています——そして `26880 % 1920 == 0` なので強拍。まさに `strong_beat_dissonance`（第3章）が見る場所です。

**4. 鎖を逆向きに読む。** ここから先はコースがデコーダになります。`parallel_fifth`（第2章）なら、印の付いた音の組を*直前の*組と比べます——両声部が動き、縦の音程がどちらも完全5度だったはずです——そして免除を確認します（斜行では?終止セルでは?両方 Material では?）。`strong_beat_dissonance`（第3章）なら、強拍の音は宣言された和声の和音構成音か?各章末に同じ形で置いてある表——ルール・FailKind・免除——は、まさにこの逆引きのためにあります。

**5. 成功時の監査記録。** 何も失敗しなくても、すべての音符の provenance 行には、その音がどう勝ち残ったかが記録されています。`source`（Material / Compose / Ornament）、`candidate_score`、`rejected_alternatives`（この音に決まるまでに探索が捨てた候補の数）、そして選ばれた音が満たしたルールのビットマスクである `satisfied_rules`。第2章の免除「両方の音が Material ならスキップ」はここで目に見える形になります。`"source": "Material"` の行が隣り合って二つ並んでいれば、それが、その組をどの並行ルールも指摘しない理由の説明です。

::: info ウェブデモと完全な記録
このサイトのデモは同じエンジンを WASM にコンパイルしたものですが、API が返すのはイベント JSON（`getEvents`）だけです。失敗の行と `provenance.v1` は `../midi-sketch-bach` のネイティブ CLI ビルドから得られます。
:::

[第1章 音程と協和](/ja/docs/counterpoint/intervals)へ進んでください。
