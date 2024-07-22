<template>
  <div class="preview-wrapper" v-show="noteTitle !== undefined">
    <Editor
      ref="editorRef"
      :is-preview-mode="true"
      @sync-title="handleSyncTitle"
      @sync-content="handleSyncContent"
      style="width: 50%"
    ></Editor>
    <div class="previewer" ref="previewerRef">
      <div class="title-wrapper">{{ noteTitle }}</div>
      <div class="sync-scroll-toggle">
        <span>同步滚动：</span>
        <el-switch
          size="small"
          v-model="syncScrollStatus"
          label="同步滚动："
          @change="handleToggleSyncScroll"
        />
      </div>
      <div class="md-result-wrapper" ref="mdResultRef" v-html="previewContent"></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, onMounted } from 'vue'
import { Editor } from '../notebook/components'
import useMarkdown from './useMarkdown'
import useImgLazyLoad from './img-lazy-load'
import velocity from 'velocity-animate'

defineOptions({
  name: 'PreviewPage',
})

const { md } = useMarkdown()

const noteTitle = ref()
const previewContent = ref()
let scrollMap = null

function handleSyncTitle(title) {
  noteTitle.value = title
}

function handleSyncContent(content) {
  if (previewContent.value === content) return

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.time('markdown-render')
  }

  previewContent.value = md.render(content || '')

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.timeEnd('markdown-render')
  }

  scrollMap = null

  nextTick(() => {
    handleImgLazyLoad()
  })
}

const editorRef = ref()
const previewerRef = ref()
let handleImgLazyLoad = null
const syncScrollStatus = ref(true)

onMounted(() => {
  const { loadImgFn } = useImgLazyLoad(previewerRef.value)
  handleImgLazyLoad = loadImgFn
  previewerRef.value.addEventListener('scroll', handleImgLazyLoad)

  if (editorRef.value.source) {
    if (syncScrollStatus.value) {
      syncScrollInit()
    }
  }
})

function handleToggleSyncScroll(status) {
  if (status) {
    syncScrollInit()
    handleMouseEnterInPreviewer()
  } else {
    destroySyncScroll()
  }
}

function syncScrollInit() {
  editorRef.value.source.addEventListener('mouseenter', handleMouseEnterInEditor)
  previewerRef.value.addEventListener('mouseenter', handleMouseEnterInPreviewer)
}

function handleMouseEnterInEditor() {
  editorRef.value.source.addEventListener('scroll', syncPreviewerScroll)
  previewerRef.value.removeEventListener('scroll', syncEditorScroll)
}

function handleMouseEnterInPreviewer() {
  editorRef.value.source.removeEventListener('scroll', syncPreviewerScroll)
  previewerRef.value.addEventListener('scroll', syncEditorScroll)
}

let editorTimeoutId
function syncEditorScroll() {
  if (editorTimeoutId) return

  editorTimeoutId = setTimeout(() => {
    const scrollTop = previewerRef.value.scrollTop
    const textarea = editorRef.value.source
    const textareaStyle = getComputedStyle(textarea)
    const lineHeight = parseFloat(textareaStyle.lineHeight)

    if (!scrollMap) {
      scrollMap = buildScrollMap()
    }

    const lines = Object.keys(scrollMap)

    if (lines < 1) return

    let line = lines[0]

    for (let i = 1; i < lines.length; i++) {
      if (scrollMap[lines[i]] < scrollTop) {
        line = lines[i]
        continue
      }

      break
    }

    velocity(textarea, 'stop', true)
    velocity(textarea, { scrollTop: lineHeight * line + 'px' }, { duration: 100, easing: 'linear' })

    editorTimeoutId = undefined
  }, 50)
}

let previewerTimeoutId
function syncPreviewerScroll() {
  if (previewerTimeoutId) return

  previewerTimeoutId = setTimeout(() => {
    const textarea = editorRef.value.source
    const textareaStyle = getComputedStyle(textarea)
    const lineHeight = parseFloat(textareaStyle.lineHeight)

    const lineNo = Math.floor(textarea.scrollTop / lineHeight)

    if (!scrollMap) {
      scrollMap = buildScrollMap()
    }

    const posTo = scrollMap[lineNo]
    velocity(previewerRef.value, 'stop', true)
    velocity(previewerRef.value, { scrollTop: posTo + 'px' }, { duration: 100, easing: 'linear' })

    previewerTimeoutId = undefined
  }, 50)
}

let textValueArrCache = []
let lineHeightMapCache = []
let scrollMapCache = []

function buildScrollMap() {
  if (import.meta.env.DEV) {
    // console.time('build-scroll-map')
  }

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
  // 标记当前缓存命中的位置
  // 认为从这行（包括这行）开始都与缓存不一致需要重新计算
  let enableCacheAcc = -1
  textValueArr.forEach((str, index) => {
    // lineHeightMap: [不自动换行行数: 自动换行实际行数]
    lineHeightMap.push(acc)

    if (str === textValueArrCache[index] && enableCacheAcc === -1) {
      acc = lineHeightMapCache[index + 1]
      return
    } else {
      if (enableCacheAcc === -1) {
        enableCacheAcc = acc
      }
    }

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

  textValueArrCache = textValueArr
  lineHeightMapCache = lineHeightMap

  const linesCount = acc
  const _scrollMap = new Array(linesCount).fill(-1)
  _scrollMap[0] = 0
  const nonEmptyList = []
  nonEmptyList.push(0)

  const offset = 0
  const lineEle = previewerRef.value.getElementsByClassName('line')
  for (let n = 0; n < lineEle.length; n++) {
    const el = lineEle[n]
    // 获取元素行数
    let t = el.dataset.line
    if (t === '') return
    // 校正为实际行数
    t = lineHeightMap[t]
    // nonEmptyList: 收集实际行数
    if (t !== 0) nonEmptyList.push(t)
    if (t < enableCacheAcc) {
      _scrollMap[t] = scrollMapCache[t]
      continue
    }
    // _scrollMap: [文本输入区实际行数: 预览区应滚动到的高度]
    _scrollMap[t] = Math.round(el.offsetTop + offset)
  }

  nonEmptyList.push(linesCount)
  _scrollMap[linesCount] = previewerRef.value.scrollHeight

  let pos = 0
  // 为文本区其他行添加对应预览区的滚动高度
  for (let j = 1; j < linesCount; j++) {
    if (_scrollMap[j] !== -1) {
      pos++
      continue
    }
    if (j < enableCacheAcc) {
      _scrollMap[j] = scrollMapCache[j]
      continue
    }
    // 有效行开始
    const a = nonEmptyList[pos]
    // 有效行结束
    const b = nonEmptyList[pos + 1]
    // 计算高度：越靠前的行将大比例乘有效行开始的高度，越靠后的行将大比例乘有效行结束的高度
    _scrollMap[j] = Math.round((_scrollMap[b] * (j - a) + _scrollMap[a] * (b - j)) / (b - a))
  }

  scrollMapCache = _scrollMap

  if (import.meta.env.DEV) {
    // console.timeEnd('build-scroll-map')
  }

  return _scrollMap
}

function destroySyncScroll() {
  scrollMap = null
  editorRef.value.source.removeEventListener('scroll', syncPreviewerScroll)
  previewerRef.value.removeEventListener('scroll', syncEditorScroll)
  editorRef.value.source.removeEventListener('mouseenter', handleMouseEnterInEditor)
  previewerRef.value.removeEventListener('mouseenter', handleMouseEnterInPreviewer)
}
</script>

<style scoped lang="scss">
.preview-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  background: #fcfaf2;

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
      right: 10px;
      font-size: 13px;
      line-height: 30px;
      color: #6d6d6d;
    }
  }
}
</style>
