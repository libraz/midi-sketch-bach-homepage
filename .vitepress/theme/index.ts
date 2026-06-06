import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import { useData } from 'vitepress'
import './custom.css'
import DemoLayout from './DemoLayout.vue'
import CounterpointStaff from '../../src/components/CounterpointStaff.vue'

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
  }
} satisfies Theme
