import { fileURLToPath, URL } from 'node:url'
import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
import { defineConfig } from 'vitepress'
import wasmMeta from '../src/wasm/meta.json'
import { inlineSvgPlugin } from './inlineSvg'
import { generateLlmsTxt, type LlmsLocale, llmsDevPlugin, type NavNode } from './llms'

const siteUrl = 'https://bach.midi-sketch.libraz.net'
const githubUrl = 'https://github.com/libraz/midi-sketch-bach'

/** Prose for the per-locale llms.txt indexes; the page lists come from the nav/sidebar. */
const LLMS_LOCALES: LlmsLocale[] = [
  {
    key: 'root',
    prefix: '',
    title: 'MIDI Sketch Bach',
    summary:
      'Algorithmic Bach instrumental MIDI generator: rule-based Baroque counterpoint produces deterministic, editable MIDI — fugues, chorale preludes, passacaglias, and other forms — for any DAW. Dual-licensed AGPL-3.0 / commercial.',
    intro:
      'Every note comes from explicit counterpoint rules rather than a trained model, so the\nsame seed and settings always produce the same score. The output is MIDI, not rendered\naudio, and stays fully editable in a DAW. The links below point to the canonical HTML\ndocumentation.',
    overviewHeading: 'Key pages',
    homeText: 'MIDI Sketch Bach home',
    alternate: {
      heading: 'Japanese (日本語)',
      items: [
        {
          text: '日本語版インデックス',
          link: '/ja/llms.txt',
          description: 'The same index in Japanese, covering the /ja/ documentation.',
        },
      ],
    },
  },
  {
    key: 'ja',
    prefix: '/ja',
    title: 'MIDI Sketch Bach',
    summary:
      'バロック対位法の規則にもとづくアルゴリズム作曲で、バッハ風の器楽曲 MIDI を生成する。フーガ、コラール前奏曲、パッサカリアなどを、DAW で編集できる決定的な MIDI として出力。AGPL-3.0 / 商用のデュアルライセンス。',
    intro:
      'すべての音は学習済みモデルではなく明示的な対位法の規則から導かれるため、同じシードと\n設定なら常に同じ譜面になる。出力は書き出し済みの音声ではなく MIDI で、DAW でそのまま\n編集できる。以下は日本語ドキュメントへのリンク一覧。',
    overviewHeading: '主要ページ',
    homeText: 'MIDI Sketch Bach トップ',
    alternate: {
      heading: 'English',
      items: [
        {
          text: 'English index',
          link: '/llms.txt',
          description: '英語ドキュメントを対象とした同じ構成のインデックス。',
        },
      ],
    },
  },
]

// English docs sidebar, mirrored by the Japanese tree under `/ja/docs/`.
const enDocsSidebar: NavNode[] = [
  {
    text: 'Guide',
    items: [
      { text: 'Features', link: '/docs/features' },
      { text: 'Getting Started', link: '/docs/getting-started' },
      { text: 'Installation', link: '/docs/installation' },
    ],
  },
  {
    text: 'Counterpoint Course',
    items: [
      { text: 'Course Overview', link: '/docs/counterpoint' },
      { text: '0. Music Primer for Engineers', link: '/docs/music-primer' },
      { text: '1. Intervals & Consonance', link: '/docs/counterpoint/intervals' },
      { text: '2. Motion & Forbidden Parallels', link: '/docs/counterpoint/motion' },
      { text: '3. Dissonance Treatment', link: '/docs/counterpoint/dissonance' },
      { text: '4. Melodic Writing', link: '/docs/counterpoint/melody' },
      { text: '5. Tonal Grammar', link: '/docs/counterpoint/tonality' },
      { text: '6. Fugal Devices', link: '/docs/counterpoint/fugue' },
      { text: '7. Form-Specific Constraints', link: '/docs/counterpoint/form-constraints' },
      { text: 'Validator Rule Reference', link: '/docs/validator-rules' },
    ],
  },
  {
    text: 'Technical',
    items: [
      { text: 'Architecture', link: '/docs/architecture' },
      { text: 'Generation Pipeline', link: '/docs/generation-pipeline' },
      { text: 'Voice Architecture', link: '/docs/voice-architecture' },
      { text: 'Instruments', link: '/docs/physical-models' },
      { text: 'Forms', link: '/docs/forms' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'JavaScript API', link: '/docs/api-js' },
      { text: 'CLI Reference', link: '/docs/cli' },
      { text: 'Presets Reference', link: '/docs/presets' },
      { text: 'Option Relationships', link: '/docs/option-relationships' },
    ],
  },
]

/** Per-locale structured data and social-card copy. */
type Locale = 'en' | 'ja'

const softwareApplicationJsonLd = (lang: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MIDI Sketch Bach',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any (Browser, Node.js)',
  inLanguage: lang,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    lang === 'ja'
      ? 'アルゴリズム作曲でバッハスタイルの器楽曲MIDIを生成します。バロックの音楽理論と作曲技法に基づき、フーガ・コラール前奏曲・パッサカリアなどを、DAWにインポートして編集できるMIDIデータとして出力します。'
      : 'Generate Bach-style instrumental MIDI using algorithmic composition. Based on music theory and Baroque compositional techniques, MIDI Sketch Bach outputs editable MIDI data featuring fugues, chorale preludes, passacaglias, and other Baroque forms that you can import into any DAW.',
  url: lang === 'ja' ? `${siteUrl}/ja/` : siteUrl,
  downloadUrl: githubUrl,
  softwareVersion: wasmMeta.engineVersion,
  author: {
    '@type': 'Person',
    name: 'libraz',
  },
  license: 'https://www.gnu.org/licenses/agpl-3.0.html',
  keywords:
    lang === 'ja'
      ? 'バッハ MIDI生成, アルゴリズム作曲, バロック MIDI, フーガ生成, インヴェンション生成, コラール生成, 対位法, 器楽曲MIDI'
      : 'Bach MIDI generator, algorithmic composition, Baroque MIDI, fugue generator, invention generator, chorale generator, counterpoint, instrumental MIDI',
})

const FAQ: Record<Locale, { q: string; a: string }[]> = {
  en: [
    {
      q: 'What is MIDI Sketch Bach?',
      a: 'MIDI Sketch Bach is an algorithmic composition tool that generates Bach-style instrumental MIDI. It uses Baroque music theory and counterpoint rules to create fugues, chorale preludes, passacaglias, and other classical forms as editable MIDI data you can import into any DAW.',
    },
    {
      q: 'How is MIDI Sketch Bach different from AI music generators?',
      a: 'AI music generators produce finished audio that cannot be edited. MIDI Sketch Bach generates MIDI data using rule-based algorithmic composition grounded in Baroque music theory and counterpoint. You get full control over every note, voice, and instrument in your DAW. The output is deterministic and reproducible.',
    },
    {
      q: 'What musical forms does MIDI Sketch Bach support?',
      a: 'MIDI Sketch Bach supports ten Baroque instrumental forms: fugue, prelude and fugue, trio sonata, chorale prelude, toccata and fugue, passacaglia, fantasia and fugue, cello prelude, chaconne, and Goldberg-style variations. Each form follows authentic compositional rules for voice leading, counterpoint, and harmonic progression.',
    },
    {
      q: 'Can I use MIDI Sketch Bach output commercially?',
      a: 'Yes. All generated MIDI files are yours to use freely, including for commercial music production, film scoring, game soundtracks, and educational purposes. The software itself is dual-licensed: AGPL-3.0 (free to use, modify, and redistribute — including commercially — under its copyleft terms), with a separate commercial license for embedding in closed-source products or proprietary SaaS offerings.',
    },
    {
      q: 'What instruments are supported in MIDI Sketch Bach?',
      a: 'MIDI Sketch Bach generates instrumental MIDI suitable for keyboard instruments (harpsichord, organ, piano), string ensembles, and other classical instruments. Since the output is standard MIDI, you can assign any instrument or sound in your DAW.',
    },
  ],
  ja: [
    {
      q: 'MIDI Sketch Bach とは何ですか？',
      a: 'MIDI Sketch Bach は、バッハスタイルの器楽曲MIDIを生成するアルゴリズム作曲ツールです。バロックの音楽理論と対位法の規則にもとづいて、フーガ・コラール前奏曲・パッサカリアなどの古典形式を、DAWにインポートして編集できるMIDIデータとして出力します。',
    },
    {
      q: 'AI音楽生成サービスと何が違いますか？',
      a: 'AI音楽生成は編集できない完成音源を出力します。MIDI Sketch Bach は、バロックの音楽理論と対位法にもとづくルールベースのアルゴリズム作曲でMIDIデータを生成します。DAW上で音符・声部・楽器のすべてを自分で制御でき、出力は決定的で再現可能です。',
    },
    {
      q: 'どの楽曲形式に対応していますか？',
      a: 'フーガ、前奏曲とフーガ、トリオソナタ、コラール前奏曲、トッカータとフーガ、パッサカリア、幻想曲とフーガ、チェロ前奏曲、シャコンヌ、ゴルトベルク風変奏曲の10形式に対応しています。いずれも声部進行・対位法・和声進行について、その形式本来の規則に従います。',
    },
    {
      q: '生成したMIDIを商用利用できますか？',
      a: 'できます。生成されたMIDIファイルは、商用音楽制作・映像音楽・ゲームサウンドトラック・教育用途を含めて自由に使えます。ソフトウェア本体はデュアルライセンスで、AGPL-3.0（コピーレフトの条件下で商用を含め自由に利用・改変・再配布可能）と、クローズドソース製品やプロプライエタリな SaaS への組み込み向けの商用ライセンスを用意しています。',
    },
    {
      q: 'どの楽器に対応していますか？',
      a: '鍵盤楽器（チェンバロ、オルガン、ピアノ）、弦楽合奏、その他のクラシック楽器に適した器楽曲MIDIを生成します。出力は標準MIDIなので、DAW側で任意の楽器や音色を割り当てられます。',
    },
  ],
}

const faqJsonLd = (lang: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: lang,
  mainEntity: FAQ[lang].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
})

const SEO: Record<Locale, { title: string; description: string; keywords: string }> = {
  en: {
    title: 'MIDI Sketch Bach - Algorithmic Bach Instrumental MIDI Generator',
    description:
      'Generate Bach-style instrumental MIDI using algorithmic composition. Create fugues, chorale preludes, and passacaglias as editable MIDI for your DAW. Full creative control.',
    keywords:
      'Bach MIDI generator, algorithmic composition, Baroque MIDI, fugue generator, invention generator, chorale generator, counterpoint MIDI, instrumental MIDI, classical music generator, music theory, Bach style, harpsichord MIDI, organ MIDI',
  },
  ja: {
    title: 'MIDI Sketch Bach - アルゴリズムによるバッハ器楽曲MIDI生成',
    description:
      'バロック音楽理論に基づいたアルゴリズム作曲でバッハスタイルの器楽曲MIDIを生成。フーガ、コラール前奏曲、パッサカリアなどを編集可能なMIDIデータとしてDAWにインポート。',
    keywords:
      'バッハ MIDI生成, アルゴリズム作曲, バロック音楽, フーガ生成, インヴェンション, コラール, 対位法, 器楽曲MIDI, クラシック音楽, 音楽理論, チェンバロ MIDI, オルガン MIDI, DTM',
  },
}

/** `ja/docs/foo.md` -> `/ja/docs/foo`, `index.md` -> `/` */
function routeOf(relativePath: string): string {
  const clean = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  return `/${clean}`.replace(/\/{2,}/g, '/')
}

const localeOf = (relativePath: string): Locale => (relativePath.startsWith('ja/') ? 'ja' : 'en')

/** The same page in the other language. */
function alternateRoute(relativePath: string): string {
  return relativePath.startsWith('ja/')
    ? routeOf(relativePath.slice(3))
    : routeOf(`ja/${relativePath}`)
}

export default defineConfig({
  srcDir: 'src',

  title: 'MIDI Sketch Bach - Algorithmic Bach Instrumental MIDI Generator',
  description:
    'Generate Bach-style instrumental MIDI using algorithmic composition based on Baroque music theory. Create fugues, chorale preludes, and passacaglias as editable MIDI data for your DAW.',

  // Sitemap
  sitemap: {
    hostname: siteUrl,
  },

  // Emit an llms.txt index (https://llmstxt.org) into the build output.
  buildEnd(siteConfig) {
    generateLlmsTxt({
      siteUrl,
      srcDir: siteConfig.srcDir,
      outDir: siteConfig.outDir,
      cleanUrls: siteConfig.cleanUrls,
      site: siteConfig.site,
      locales: LLMS_LOCALES,
    })
  },

  // Locale-independent only. Everything that differs per page or per language
  // (canonical, OGP, keywords, JSON-LD) is emitted from transformHead below.
  head: [
    ['meta', { name: 'theme-color', content: '#B8922E' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+JP:wght@400;500;600;700&family=Outfit:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap',
        rel: 'stylesheet',
      },
    ],

    // OGP — shared across pages and languages
    ['meta', { property: 'og:site_name', content: 'MIDI Sketch Bach' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: `${siteUrl}/og-image.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/og-image.png` }],
  ],

  transformHead({ pageData, description }) {
    const lang = localeOf(pageData.relativePath)
    const seo = SEO[lang]
    const url = `${siteUrl}${routeOf(pageData.relativePath)}`
    const altLang: Locale = lang === 'ja' ? 'en' : 'ja'
    const altUrl = `${siteUrl}${alternateRoute(pageData.relativePath)}`
    const title = pageData.frontmatter.title || seo.title
    const desc = description || seo.description

    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { name: 'keywords', content: seo.keywords }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: desc }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:locale', content: lang }],
      ['meta', { property: 'og:locale:alternate', content: altLang }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['link', { rel: 'alternate', hreflang: lang, href: url }],
      ['link', { rel: 'alternate', hreflang: altLang, href: altUrl }],
      [
        'link',
        {
          rel: 'alternate',
          hreflang: 'x-default',
          href: `${siteUrl}${routeOf(pageData.relativePath.replace(/^ja\//, ''))}`,
        },
      ],
      ['script', { type: 'application/ld+json' }, JSON.stringify(softwareApplicationJsonLd(lang))],
      ['script', { type: 'application/ld+json' }, JSON.stringify(faqJsonLd(lang))],
    ]
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/docs/getting-started' },
          { text: 'GitHub', link: githubUrl },
        ],
        sidebar: {
          '/docs/': enDocsSidebar,
        },
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      title: 'MIDI Sketch Bach - アルゴリズムによるバッハ器楽曲MIDI生成',
      description:
        'バロック音楽理論に基づいたアルゴリズム作曲でバッハスタイルの器楽曲MIDIを生成。フーガ、コラール前奏曲、パッサカリアなどを編集可能なMIDIデータとしてDAWにインポート。',
      themeConfig: {
        nav: [
          { text: 'ドキュメント', link: '/ja/docs/getting-started' },
          { text: 'GitHub', link: githubUrl },
        ],
        sidebar: {
          '/ja/docs/': [
            {
              text: 'ガイド',
              items: [
                { text: '特徴', link: '/ja/docs/features' },
                { text: 'はじめに', link: '/ja/docs/getting-started' },
                { text: 'インストール', link: '/ja/docs/installation' },
              ],
            },
            {
              text: '対位法コース',
              items: [
                { text: 'コース概要', link: '/ja/docs/counterpoint' },
                { text: '0. エンジニアのための音楽用語入門', link: '/ja/docs/music-primer' },
                { text: '1. 音程と協和', link: '/ja/docs/counterpoint/intervals' },
                { text: '2. 声部の運動と並行禁則', link: '/ja/docs/counterpoint/motion' },
                { text: '3. 不協和音の扱い', link: '/ja/docs/counterpoint/dissonance' },
                { text: '4. 旋律の書法', link: '/ja/docs/counterpoint/melody' },
                { text: '5. 調性の文法', link: '/ja/docs/counterpoint/tonality' },
                { text: '6. フーガの技法', link: '/ja/docs/counterpoint/fugue' },
                { text: '7. 形式固有の制約', link: '/ja/docs/counterpoint/form-constraints' },
                { text: '検証器ルール一覧', link: '/ja/docs/validator-rules' },
              ],
            },
            {
              text: '技術解説',
              items: [
                { text: 'アーキテクチャ', link: '/ja/docs/architecture' },
                { text: '生成パイプライン', link: '/ja/docs/generation-pipeline' },
                { text: '声部アーキテクチャ', link: '/ja/docs/voice-architecture' },
                { text: '楽器', link: '/ja/docs/physical-models' },
                { text: '楽曲形式', link: '/ja/docs/forms' },
              ],
            },
            {
              text: 'リファレンス',
              items: [
                { text: 'JavaScript API', link: '/ja/docs/api-js' },
                { text: 'CLI リファレンス', link: '/ja/docs/cli' },
                { text: 'プリセットリファレンス', link: '/ja/docs/presets' },
                { text: 'オプション関係', link: '/ja/docs/option-relationships' },
              ],
            },
          ],
        },
      },
    },
  },

  markdown: {
    config(md) {
      // Make `**bold**` parse correctly when adjacent to CJK punctuation
      // (e.g. `**P1（ユニゾン）**は`), which CommonMark otherwise rejects.
      md.use(markdownItCjkFriendly)
      // Inline the diagrams so they follow the site's theme toggle, not the OS setting.
      md.use(inlineSvgPlugin)
    },
  },

  themeConfig: {
    siteTitle: 'MIDI Sketch Bach',
    socialLinks: [{ icon: 'github', link: githubUrl }],
    footer: {
      message:
        'Dual-licensed: AGPL-3.0 · commercial licensing available. Generated MIDI is yours to use freely.',
      copyright: 'Copyright © 2024-present libraz',
    },
  },

  vite: {
    plugins: [llmsDevPlugin({ siteUrl, locales: LLMS_LOCALES })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../src', import.meta.url)),
        '@theme': fileURLToPath(new URL('./theme', import.meta.url)),
      },
    },
  },
})
