<template>
  <div class="preview-wrapper">
    <Editor
      ref="editorRef"
      :isPreviewMode="true"
      @sync-title="handleSyncTitle"
      @sync-content="handleSyncContent"
      style="width: 50%"
    ></Editor>
    <div class="previewer" ref="previewerRef">
      <div class="title-wrapper">{{ noteTitle }}</div>
      <div class="sync-scroll-toggle">
        <span>同步滚动：</span>
        <el-switch v-model="syncScrollStatus" label="同步滚动：" @change="handleToggleSyncScroll" />
      </div>
      <div class="md-result-wrapper" ref="mdResultRef" v-html="previewContent"></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import markdownit from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import * as mk from '@xtthaop/markdown-it-katex'
import { Editor } from '../notebook/components'

defineOptions({
  name: 'PreviewPage',
})

const noteTitle = ref()
const noteContent = ref()
const previewContent = ref()
let md

handleInitMarkdown()

function handleInitMarkdown() {
  // https://github.com/markdown-it/markdown-it?tab=readme-ov-file#usage-examples
  md = markdownit({
    html: false,
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
  handleHeadingOpen()
  handleImgRenderer()

  // https://github.com/xtthaop/markdown-it-katex
  md.use(mk)
}

function handleLinkRenderer() {
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target')

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank'])
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank'
    }

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
      tokens[idx].attrJoin('class', 'image-container')
    }

    injectLineNumbers(tokens, idx)

    return defaultRender(tokens, idx, options, env, self)
  }
}

function injectLineNumbers(tokens, idx) {
  if (tokens[idx].map && tokens[idx].level === 0) {
    const line = tokens[idx].map[0]
    tokens[idx].attrJoin('class', 'line')
    tokens[idx].attrSet('data-line', String(line))
  }
}

function handleHeadingOpen() {
  md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
    injectLineNumbers(tokens, idx)
    return self.renderToken(tokens, idx, options, env, self)
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
  nextTick(() => {
    buildScrollMap()
  })
}

const editorRef = ref()
const previewerRef = ref()
const mdResultRef = ref()

function buildScrollMap() {
  const textarea = editorRef.value.source
  const textareaStyle = getComputedStyle(textarea)
  const sourceLikeDiv = document.createElement('div')
  sourceLikeDiv.style.cssText = `
    position: absolute;
    visibility: hidden;
    height: auto;
    width: ${textarea.clientWidth}px;
    padding-left: ${textareaStyle.paddingLeft};
    padding-right: ${textareaStyle.paddingRight};
    font-size: ${textareaStyle.fontSize};
    font-family: ${textareaStyle.fontFamily};
    line-height: ${textareaStyle.lineHeight};
    white-space: ${textareaStyle.whiteSpace};
    overflow-wrap: ${textareaStyle.overflowWrap};
  `

  document.body.append(sourceLikeDiv)

  const lineHeightMap = []
  const textValueArr = textarea.value.split('\n')

  let acc = 0
  textValueArr.forEach((str) => {
    // lineHeightMap: [不自动换行行数: 自动换行实际行数]
    lineHeightMap.push(acc)

    if (str.length === 0) {
      acc++
      return
    }

    sourceLikeDiv.innerText = str
    const sourceLikeDivStyle = getComputedStyle(sourceLikeDiv)
    const h = parseFloat(sourceLikeDivStyle.height)
    const lh = parseFloat(sourceLikeDivStyle.lineHeight)
    acc += Math.round(h / lh)
  })
  document.body.removeChild(sourceLikeDiv)
  lineHeightMap.push(acc)
  const linesCount = acc

  const scrollMap = []
  for (let i = 0; i < linesCount; i++) {
    scrollMap.push(-1)
  }
  scrollMap[0] = 0
  const nonEmptyList = []
  nonEmptyList.push(0)

  const offset = 0

  const lineEle = mdResultRef.value.getElementsByClassName('line')
  for (let n = 0; n < lineEle.length; n++) {
    const el = lineEle[n]
    // 获取元素行数
    let t = el.dataset.line
    if (t === '') return
    // 校正为实际行数
    t = lineHeightMap[t]
    // nonEmptyList: 收集实际行数
    if (t !== 0) nonEmptyList.push(t)
    // scrollMap: [文本输入区实际行数: 预览区应滚动到的高度]
    scrollMap[t] = Math.round(el.offsetTop + offset)
  }

  nonEmptyList.push(linesCount)
  scrollMap[linesCount] = previewerRef.value.scrollHeight

  let pos = 0
  // 为文本区其他行添加对应预览区的滚动高度
  for (let j = 1; j < linesCount; j++) {
    if (scrollMap[j] !== -1) {
      pos++
      continue
    }

    // 有效行开始
    const a = nonEmptyList[pos]
    // 有效行结束
    const b = nonEmptyList[pos + 1]
    // 计算高度：越靠前的行将大比例乘有效行开始的高度，越靠后的行将大比例乘有效行结束的高度
    scrollMap[j] = Math.round((scrollMap[b] * (j - a) + scrollMap[a] * (b - j)) / (b - a))
  }

  return scrollMap
}

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
      top: 0px;
      right: 20px;
      font-size: 13px;
      color: #6d6d6d;
    }
  }
}
</style>
