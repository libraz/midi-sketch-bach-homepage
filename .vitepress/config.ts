import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { fileURLToPath, URL } from 'node:url'

const siteUrl = 'https://bach.midi-sketch.libraz.net'
const githubUrl = 'https://github.com/libraz/midi-sketch-bach'

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
  description: 'Generate Bach-style instrumental MIDI using algorithmic composition. Based on music theory and Baroque compositional techniques, MIDI Sketch Bach outputs editable MIDI data featuring inventions, fugues, and chorales that you can import into any DAW.',
  url: siteUrl,
  downloadUrl: githubUrl,
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Person',
    name: 'libraz'
  },
  license: 'https://opensource.org/licenses/Apache-2.0',
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
        text: 'MIDI Sketch Bach is an algorithmic composition tool that generates Bach-style instrumental MIDI. It uses Baroque music theory and counterpoint rules to create inventions, fugues, chorales, and other classical forms as editable MIDI data you can import into any DAW.'
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
        text: 'MIDI Sketch Bach supports key Baroque instrumental forms including two-part inventions, three-part sinfonias, fugues (3 and 4 voices), chorales, and preludes. Each form follows authentic compositional rules for voice leading, counterpoint, and harmonic progression.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I use MIDI Sketch Bach output commercially?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, MIDI Sketch Bach is licensed under Apache-2.0. All generated MIDI files are yours to use freely, including for commercial music production, film scoring, game soundtracks, and educational purposes.'
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
  description: 'Generate Bach-style instrumental MIDI using algorithmic composition based on Baroque music theory. Create inventions, fugues, and chorales as editable MIDI data for your DAW.',

  // Sitemap
  sitemap: {
    hostname: siteUrl
  },

  head: [
    ['meta', { name: 'theme-color', content: '#8B5CF6' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],

    // JSON-LD structured data
    ['script', { type: 'application/ld+json' }, JSON.stringify(softwareApplicationJsonLd)],
    ['script', { type: 'application/ld+json' }, JSON.stringify(faqJsonLd)],

    // SEO - Keywords
    ['meta', { name: 'keywords', content: 'Bach MIDI generator, algorithmic composition, Baroque MIDI, fugue generator, invention generator, chorale generator, counterpoint MIDI, instrumental MIDI, classical music generator, music theory, Bach style, harpsichord MIDI, organ MIDI, バッハ MIDI生成, アルゴリズム作曲, バロック音楽, フーガ生成, インヴェンション, コラール, 対位法, 器楽曲MIDI, クラシック音楽, DTM' }],
    ['link', { rel: 'canonical', href: siteUrl }],

    // OGP
    ['meta', { property: 'og:site_name', content: 'MIDI Sketch Bach' }],
    ['meta', { property: 'og:title', content: 'MIDI Sketch Bach - Algorithmic Bach Instrumental MIDI Generator' }],
    ['meta', { property: 'og:description', content: 'Generate Bach-style instrumental MIDI using algorithmic composition. Create inventions, fugues, and chorales as editable MIDI for your DAW. Full creative control.' }],
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
          '/docs/': [
            {
              text: 'Guide',
              items: [
                { text: 'Features', link: '/docs/features' },
                { text: 'Getting Started', link: '/docs/getting-started' },
                { text: 'Installation', link: '/docs/installation' },
              ]
            },
            {
              text: 'Technical',
              items: [
                { text: 'Architecture', link: '/docs/architecture' },
                { text: 'Generation Pipeline', link: '/docs/generation-pipeline' },
                { text: 'Counterpoint & Voice Leading', link: '/docs/counterpoint' },
                { text: 'Voice Architecture', link: '/docs/voice-architecture' },
                { text: 'Physical Instrument Models', link: '/docs/physical-models' },
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
        }
      }
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      title: 'MIDI Sketch Bach - アルゴリズムによるバッハ器楽曲MIDI生成',
      description: 'バロック音楽理論に基づいたアルゴリズム作曲でバッハスタイルの器楽曲MIDIを生成。インヴェンション、フーガ、コラールなどを編集可能なMIDIデータとしてDAWにインポート。',
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
              text: '技術解説',
              items: [
                { text: 'アーキテクチャ', link: '/ja/docs/architecture' },
                { text: '生成パイプライン', link: '/ja/docs/generation-pipeline' },
                { text: '対位法と声部進行', link: '/ja/docs/counterpoint' },
                { text: '声部アーキテクチャ', link: '/ja/docs/voice-architecture' },
                { text: '物理楽器モデル', link: '/ja/docs/physical-models' },
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

  themeConfig: {
    siteTitle: 'MIDI Sketch Bach',
    socialLinks: [
      { icon: 'github', link: githubUrl }
    ],
    footer: {
      message: 'Released under the Apache-2.0 License.',
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
