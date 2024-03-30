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
import { onMounted, ref } from 'vue'
import { Editor } from '../notebook/components'
import useMarkdown from './markdown'
import velocity from 'velocity-animate'

defineOptions({
  name: 'PreviewPage',
})

const { md } = useMarkdown()

const noteTitle = ref()
const noteContent = ref()
const previewContent = ref()
let scrollMap = null

function handleSyncTitle(title) {
  noteTitle.value = title
}

function handleSyncContent(content) {
  noteContent.value = content
  previewContent.value = md.render(content)
  scrollMap = null
}

const editorRef = ref()
const previewerRef = ref()
const syncScrollStatus = ref(true)

function handleToggleSyncScroll(status) {
  if (status) {
    syncScrollInit
  } else {
    destroySyncScroll()
  }
}

onMounted(() => {
  if (syncScrollStatus.value) {
    syncScrollInit()
  }
  // TODO: 图片懒加载
})

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
  clearTimeout(editorTimeoutId)

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
  }, 50)
}

let previewerTimeoutId
function syncPreviewerScroll() {
  clearTimeout(previewerTimeoutId)

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
  }, 50)
}

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

  if (import.meta.env.DEV) {
    // console.timeEnd('build-scroll-map')
  }

  return scrollMap
}

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
