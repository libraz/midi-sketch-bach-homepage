import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
import { fileURLToPath, URL } from 'node:url'
import { generateLlmsTxt, type NavNode } from './llms'

const siteUrl = 'https://bach.midi-sketch.libraz.net'
const githubUrl = 'https://github.com/libraz/midi-sketch-bach'

// English docs sidebar — shared between the `/docs/` sidebar and the llms.txt index.
const enDocsSidebar: NavNode[] = [
  {
    text: 'Guide',
    items: [
      { text: 'Features', link: '/docs/features' },
      { text: 'Getting Started', link: '/docs/getting-started' },
      { text: 'Installation', link: '/docs/installation' },
    ]
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
    ]
  },
  {
    text: 'Technical',
    items: [
      { text: 'Architecture', link: '/docs/architecture' },
      { text: 'Generation Pipeline', link: '/docs/generation-pipeline' },
      { text: 'Voice Architecture', link: '/docs/voice-architecture' },
      { text: 'Instruments', link: '/docs/physical-models' },
      { text: 'Forms', link: '/docs/forms' },
    ]
  },
  {
    text: 'Reference',
    items: [
      { text: 'JavaScript API', link: '/docs/api-js' },
      { text: 'CLI Reference', link: '/docs/cli' },
      { text: 'Presets Reference', link: '/docs/presets' },
      { text: 'Option Relationships', link: '/docs/option-relationships' },
    ]
  }
]

// JSON-LD: SoftwareApplication schema
const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MIDI Sketch Bach',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any (Browser, Node.js)',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  description: 'Generate Bach-style instrumental MIDI using algorithmic composition. Based on music theory and Baroque compositional techniques, MIDI Sketch Bach outputs editable MIDI data featuring fugues, chorale preludes, passacaglias, and other Baroque forms that you can import into any DAW.',
  url: siteUrl,
  downloadUrl: githubUrl,
  softwareVersion: '0.1.0',
  author: {
    '@type': 'Person',
    name: 'libraz'
  },
  license: 'https://www.gnu.org/licenses/agpl-3.0.html',
  keywords: 'Bach MIDI generator, algorithmic composition, Baroque MIDI, fugue generator, invention generator, chorale generator, counterpoint, instrumental MIDI, バッハ MIDI生成, アルゴリズム作曲, 対位法'
}

// JSON-LD: FAQ schema (for AI search)
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is MIDI Sketch Bach?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MIDI Sketch Bach is an algorithmic composition tool that generates Bach-style instrumental MIDI. It uses Baroque music theory and counterpoint rules to create fugues, chorale preludes, passacaglias, and other classical forms as editable MIDI data you can import into any DAW.'
      }
    },
    {
      '@type': 'Question',
      name: 'How is MIDI Sketch Bach different from AI music generators?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI music generators produce finished audio that cannot be edited. MIDI Sketch Bach generates MIDI data using rule-based algorithmic composition grounded in Baroque music theory and counterpoint. You get full control over every note, voice, and instrument in your DAW. The output is deterministic and reproducible.'
      }
    },
    {
      '@type': 'Question',
      name: 'What musical forms does MIDI Sketch Bach support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MIDI Sketch Bach supports ten Baroque instrumental forms: fugue, prelude and fugue, trio sonata, chorale prelude, toccata and fugue, passacaglia, fantasia and fugue, cello prelude, chaconne, and Goldberg-style variations. Each form follows authentic compositional rules for voice leading, counterpoint, and harmonic progression.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I use MIDI Sketch Bach output commercially?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All generated MIDI files are yours to use freely, including for commercial music production, film scoring, game soundtracks, and educational purposes. The software itself is dual-licensed: AGPL-3.0 (free to use, modify, and redistribute — including commercially — under its copyleft terms), with a separate commercial license for embedding in closed-source products or proprietary SaaS offerings.'
      }
    },
    {
      '@type': 'Question',
      name: 'What instruments are supported in MIDI Sketch Bach?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MIDI Sketch Bach generates instrumental MIDI suitable for keyboard instruments (harpsichord, organ, piano), string ensembles, and other classical instruments. Since the output is standard MIDI, you can assign any instrument or sound in your DAW.'
      }
    }
  ]
}

export default withMermaid(defineConfig({
  srcDir: 'src',

  title: 'MIDI Sketch Bach - Algorithmic Bach Instrumental MIDI Generator',
  description: 'Generate Bach-style instrumental MIDI using algorithmic composition based on Baroque music theory. Create fugues, chorale preludes, and passacaglias as editable MIDI data for your DAW.',

  // Sitemap
  sitemap: {
    hostname: siteUrl
  },

  // Emit an llms.txt index (https://llmstxt.org) into the build output.
  buildEnd(siteConfig) {
    generateLlmsTxt({
      siteUrl,
      srcDir: siteConfig.srcDir,
      outDir: siteConfig.outDir,
      summary:
        'Algorithmic Bach instrumental MIDI generator: rule-based Baroque counterpoint produces deterministic, editable MIDI — fugues, chorale preludes, passacaglias, and other forms — for any DAW. Dual-licensed AGPL-3.0 / commercial.',
      docsSidebar: enDocsSidebar,
    })
  },

  head: [
    ['meta', { name: 'theme-color', content: '#B8922E' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+JP:wght@400;500;600;700&family=Outfit:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],

    // JSON-LD structured data
    ['script', { type: 'application/ld+json' }, JSON.stringify(softwareApplicationJsonLd)],
    ['script', { type: 'application/ld+json' }, JSON.stringify(faqJsonLd)],

    // SEO - Keywords
    ['meta', { name: 'keywords', content: 'Bach MIDI generator, algorithmic composition, Baroque MIDI, fugue generator, invention generator, chorale generator, counterpoint MIDI, instrumental MIDI, classical music generator, music theory, Bach style, harpsichord MIDI, organ MIDI, バッハ MIDI生成, アルゴリズム作曲, バロック音楽, フーガ生成, インヴェンション, コラール, 対位法, 器楽曲MIDI, クラシック音楽, DTM' }],
    ['link', { rel: 'canonical', href: siteUrl }],

    // OGP
    ['meta', { property: 'og:site_name', content: 'MIDI Sketch Bach' }],
    ['meta', { property: 'og:title', content: 'MIDI Sketch Bach - Algorithmic Bach Instrumental MIDI Generator' }],
    ['meta', { property: 'og:description', content: 'Generate Bach-style instrumental MIDI using algorithmic composition. Create fugues, chorale preludes, and passacaglias as editable MIDI for your DAW. Full creative control.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:image', content: `${siteUrl}/og-image.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:locale:alternate', content: 'ja' }],

    // Twitter
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'MIDI Sketch Bach - Algorithmic Bach Instrumental MIDI Generator' }],
    ['meta', { name: 'twitter:description', content: 'Generate Bach-style instrumental MIDI using algorithmic composition. Editable MIDI data for your DAW, not finished audio.' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/og-image.png` }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/docs/getting-started' },
          { text: 'GitHub', link: githubUrl }
        ],
        sidebar: {
          '/docs/': enDocsSidebar
        }
      }
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      title: 'MIDI Sketch Bach - アルゴリズムによるバッハ器楽曲MIDI生成',
      description: 'バロック音楽理論に基づいたアルゴリズム作曲でバッハスタイルの器楽曲MIDIを生成。フーガ、コラール前奏曲、パッサカリアなどを編集可能なMIDIデータとしてDAWにインポート。',
      themeConfig: {
        nav: [
          { text: 'ドキュメント', link: '/ja/docs/getting-started' },
          { text: 'GitHub', link: githubUrl }
        ],
        sidebar: {
          '/ja/docs/': [
            {
              text: 'ガイド',
              items: [
                { text: '特徴', link: '/ja/docs/features' },
                { text: 'はじめに', link: '/ja/docs/getting-started' },
                { text: 'インストール', link: '/ja/docs/installation' },
              ]
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
              ]
            },
            {
              text: '技術解説',
              items: [
                { text: 'アーキテクチャ', link: '/ja/docs/architecture' },
                { text: '生成パイプライン', link: '/ja/docs/generation-pipeline' },
                { text: '声部アーキテクチャ', link: '/ja/docs/voice-architecture' },
                { text: '楽器', link: '/ja/docs/physical-models' },
                { text: '楽曲形式', link: '/ja/docs/forms' },
              ]
            },
            {
              text: 'リファレンス',
              items: [
                { text: 'JavaScript API', link: '/ja/docs/api-js' },
                { text: 'CLI リファレンス', link: '/ja/docs/cli' },
                { text: 'プリセットリファレンス', link: '/ja/docs/presets' },
                { text: 'オプション関係', link: '/ja/docs/option-relationships' },
              ]
            }
          ]
        }
      }
    }
  },

  markdown: {
    config(md) {
      // Make `**bold**` parse correctly when adjacent to CJK punctuation
      // (e.g. `**P1（ユニゾン）**は`), which CommonMark otherwise rejects.
      md.use(markdownItCjkFriendly)
    }
  },

  themeConfig: {
    siteTitle: 'MIDI Sketch Bach',
    socialLinks: [
      { icon: 'github', link: githubUrl }
    ],
    footer: {
      message: 'Dual-licensed: AGPL-3.0 · commercial licensing available. Generated MIDI is yours to use freely.',
      copyright: 'Copyright © 2024-present libraz'
    }
  },

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../src', import.meta.url)),
        '@theme': fileURLToPath(new URL('./theme', import.meta.url))
      }
    }
  }
}))
