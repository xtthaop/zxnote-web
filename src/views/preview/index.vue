<template>
  <div class="preview-wrapper">
    <Editor
      ref="editorRef"
      :is-preview-mode="true"
      @sync-title="handleSyncTitle"
      @sync-content="handleSyncContent"
      style="width: 50%"
    ></Editor>
    <div class="previewer" ref="previewerRef" v-if="previewContent !== undefined">
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
import { nextTick, ref } from 'vue'
import { Editor } from '../notebook/components'
import useMarkdown from './markdown'
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

let initialized = false
function handleSyncContent(content) {
  if (previewContent.value === content) return

  if (import.meta.env.DEV) {
    // console.time('markdown-render')
  }

  previewContent.value = md.render(content)

  if (import.meta.env.DEV) {
    // console.timeEnd('markdown-render')
  }

  scrollMap = null

  nextTick(() => {
    if (!initialized) {
      initialized = true
      if (syncScrollStatus.value) {
        syncScrollInit()
      }
      previewerRef.value.addEventListener('scroll', handleImgLazyLoad)
    }

    handleImgLazyLoad()
  })
}

const editorRef = ref()
const previewerRef = ref()
const syncScrollStatus = ref(true)

function handleToggleSyncScroll(status) {
  if (status) {
    syncScrollInit()
    handleMouseEnterInPreviewer()
  } else {
    destroySyncScroll()
  }
}

let imgTimeoutId
const imgsCacheMap = new Map()
function handleImgLazyLoad() {
  if (imgTimeoutId) return

  imgTimeoutId = setTimeout(() => {
    const previewerRect = previewerRef.value.getBoundingClientRect()
    const imgs = previewerRef.value.getElementsByTagName('img')

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i]
      const imgRect = img.getBoundingClientRect()

      const distance1 = previewerRect.height - imgRect.top
      const distance2 = imgRect.top + imgRect.height
      const inView = distance1 >= 0 && distance2 >= 0

      const imgSrc = img.getAttribute('data-src')

      // 判断缓存中是否有当前图片
      if (imgsCacheMap.has(imgSrc)) {
        // 是则判断图片是否已加载成功
        if (imgsCacheMap.get(imgSrc).status === 'loaded') {
          // 已加载成功则判断当前图片是否需要更新链接
          // 是则更新链接
          if (img.getAttribute('src') !== imgSrc) img.src = imgSrc
        } else {
          // 未加载成功则将当前图片添加到待更新链接图片集合中
          imgsCacheMap.get(imgSrc).needUpdateImgs.add(img)
        }
      } else {
        // 否则新建图片加载器
        const loader = new Image()
        // 缓存图片对应的加载器、加载状态、在视口内的图片集合、需要更新链接的图片集合
        imgsCacheMap.set(imgSrc, {
          loader,
          status: 'start',
          someInView: new Set(),
          needUpdateImgs: new Set([img]),
        })
      }

      // 判断当前图片是否在视口内
      if (inView) {
        // 是则将当前图片添加到在视口内的图片集合中
        imgsCacheMap.get(imgSrc).someInView.add(img)

        // 判断当前图片是否正在加载或已加载成功
        // 是则跳过加载操作
        // 图片加载失败后滑动页面待图片重新出现在视口内会重新发起加载请求
        if (
          imgsCacheMap.get(imgSrc).status === 'loading' ||
          imgsCacheMap.get(imgSrc).status === 'loaded'
        ) {
          continue
        }

        imgsCacheMap.get(imgSrc).loader.src = imgSrc
        imgsCacheMap.get(imgSrc).status = 'loading'
        imgsCacheMap.get(imgSrc).loader.onload = () => {
          // 图片加载成功后更新所有需要更新链接的图片然后立即从集合中删除该图片
          for (let img of imgsCacheMap.get(imgSrc).needUpdateImgs.values()) {
            img.src = imgSrc
            imgsCacheMap.get(imgSrc).needUpdateImgs.delete(img)
          }
          // 将图片状态更新为加载成功
          imgsCacheMap.get(imgSrc).status = 'loaded'
        }
        imgsCacheMap.get(imgSrc).loader.onerror = () => {
          // 图片加载失败则将图片状态更新为加载失败
          imgsCacheMap.get(imgSrc).status = 'error'
        }
      } else {
        // 当前图片不在视口内则将其从在视口内的图片集合中删除
        imgsCacheMap.get(imgSrc).someInView.delete(img)

        // 判断图片加载状态是否为加载中
        // 及在视口内的图片集合是否为空
        if (
          imgsCacheMap.get(imgSrc).status === 'loading' &&
          imgsCacheMap.get(imgSrc).someInView.size === 0
        ) {
          // 是则将图片的加载器请求链接置为空
          // 目的是取消图片加载从而加快后续进入视口图片的加载速度
          // 此时图片的加载状态会变为加载失败
          // 待图片回到视口内会重新加载
          imgsCacheMap.get(imgSrc).loader.src = ''
        }
      }
    }

    imgTimeoutId = undefined
  }, 200)
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
