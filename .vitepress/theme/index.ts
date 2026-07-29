import type { Theme } from 'vitepress'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import CounterpointStaff from '../../src/components/CounterpointStaff.vue'
import DemoLayout from './DemoLayout.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CounterpointStaff', CounterpointStaff)
  },
  Layout: () => {
    const { frontmatter } = useData()
    if (frontmatter.value.layout === 'demo') {
      return h(DemoLayout)
    }
    return h(DefaultTheme.Layout, null, {})
  },
} satisfies Theme
