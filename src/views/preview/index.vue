<template>
  <div class="preview-wrapper">
    <Editor
      ref="editorRef"
      :isPreviewMode="true"
      @sync-title="handleSyncTitle"
      @sync-content="handleSyncContent"
      style="width: 50%"
    ></Editor>
    <div class="previewer">
      <div class="title-wrapper">{{ noteTitle }}</div>
      <div class="sync-scroll-toggle">
        <span>同步滚动：</span>
        <el-switch v-model="syncScrollStatus" label="同步滚动：" @change="handleToggleSyncScroll" />
      </div>
      <div class="md-content-wrapper" ref="contentRef" v-html="previewContent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import markdownit from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import * as mk from '@xtthaop/markdown-it-katex'
import { Editor } from '../notebook/components'

defineOptions({
  name: 'PreviewPage',
})

const editorRef = ref()
const contentRef = ref()

const noteTitle = ref()
const noteContent = ref()
const previewContent = ref()
let md

function handleInitMarkdown() {
  // https://github.com/markdown-it/markdown-it?tab=readme-ov-file#usage-examples
  md = markdownit({
    html: true,
    breaks: true,
    highlight: function (str, lang) {
      // https://github.com/highlightjs/highlight.js
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          }</code></pre>`
        } catch (__) {
          // continue regardless of error
        }
      }

      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    },
  })

  handleLinkRenderer()
  handleParagraphOpen()
  handleImgRenderer()

  // https://github.com/waylonflinn/markdown-it-katex
  md.use(mk)
}

function handleLinkRenderer() {
  // add target="_blank" to all links
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are sure other plugins can't add `target` - drop check below
    const aIndex = tokens[idx].attrIndex('target')

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank']) // add new attribute
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank' // replace value of existing attr
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}

function handleParagraphOpen() {
  const defaultRender =
    md.renderer.rules.paragraph_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
    if (
      tokens[idx + 1].type === 'inline' &&
      tokens[idx + 1].children.some((child) => child.type === 'image')
    ) {
      tokens[idx].attrPush(['class', 'image-container'])
    }

    return defaultRender(tokens, idx, options, env, self)
  }
}

function handleImgRenderer() {
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    token.attrs[token.attrIndex('alt')][1] = self.renderInlineAsText(token.children, options, env)
    const imgSrcArr = token.attrs[token.attrIndex('src')][1].split('?')
    const imgParams = imgSrcArr.length > 1 && imgSrcArr[1].split('/')

    const imageAlt = (token.attrIndex('alt') > -1 && token.attrs[token.attrIndex('alt')][1]) || ''
    const imageTitle =
      (token.attrIndex('title') > -1 && token.attrs[token.attrIndex('title')][1]) || ''

    const imgRealSrc = imgSrcArr[0]
    const imgSuffix = '.' + imgRealSrc.split('.')[1]
    const imgPlaceholderSrc =
      imgRealSrc.replace(new RegExp(`${imgSuffix}$`), '') + '_low_ratio' + imgSuffix
    const imgWidth = (imgParams && imgParams[1]) || '100%'

    // TODO: 图片懒加载
    return `<img
              data-src="${imgRealSrc}"
              src="${imgPlaceholderSrc}"
              width="${imgWidth}"
              alt="${imageAlt}"
              title="${imageTitle}"
            />`
  }
}

function handleSyncTitle(title) {
  noteTitle.value = title
}

function handleSyncContent(content) {
  noteContent.value = content
  previewContent.value = md.render(content)
}

handleInitMarkdown()

const syncScrollStatus = ref(true)
function handleToggleSyncScroll(status) {
  if (status) {
    handlePreviewMouseEnter()
    startSyncScroll()
  } else {
    destroySyncScroll()
  }
}

function handlePreviewMouseEnter() {}
// function handleEditorMouseEnter() {}
function startSyncScroll() {}
function destroySyncScroll() {}
</script>

<style scoped lang="scss">
.preview-wrapper {
  display: flex;
  width: 100%;
  height: 100%;

  .previewer {
    position: relative;
    width: 50%;
    height: 100%;
    padding: 30px;
    background: #fcfaf2;
    overflow-y: scroll;

    .title-wrapper {
      line-height: 1.8;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 30px;
      font-weight: 600;
    }

    .sync-scroll-toggle {
      display: flex;
      align-items: center;
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 13px;
      color: #6d6d6d;
    }
  }
}
</style>
