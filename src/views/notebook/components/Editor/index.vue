<template>
  <div class="editor-wrapper" v-show="noteId" v-loading="noteLoading">
    <div class="title-wrapper">
      <div className="save-status">
        {{ note.saveLoading ? (note.saveError ? '保存出错' : '保存中...') : '已保存' }}
      </div>
      <input
        ref="titleRef"
        v-model="note.note_title"
        maxlength="280"
        className="custom-input"
        placeholder="请输入标题"
        @keydown="handleKeyCtrl"
        @input="handleNoteChange"
      />
    </div>
    <ul class="tool-bar-wrapper">
      <li
        class="tool right publish"
        @mouseenter="publishCancel = true"
        @mouseleave="publishCancel = false"
        @click="hanldePublish(published ? 0 : 1)"
      >
        <template v-if="!note.saveLoading">
          <span v-if="published">
            <span v-if="note.publishLoading">
              <span class="publish-text">取消中...</span>
            </span>
            <span v-else>
              <template v-if="note.publishError">
                <span class="publish-text" style="color: red">点击重试</span>
              </template>
              <template v-else>
                <svg-icon :name="publishCancel ? 'error' : 'success'"></svg-icon>
                <span class="publish-text">{{ publishCancel ? '取消发布' : '已发布' }}</span>
              </template>
            </span>
          </span>
          <span v-else>
            <span v-if="note.publishLoading">
              <span class="publish-text">发布中...</span>
            </span>
            <span v-else>
              <template v-if="note.publishError">
                <span class="publish-text" style="color: red">点击重试</span>
              </template>
              <template v-else>
                <svg-icon :name="publishUpdate ? 'update' : 'publish'"></svg-icon>
                <span class="publish-text">{{ publishUpdate ? '发布更新' : '发布笔记' }}</span>
              </template>
            </span>
          </span>
        </template>
        <template v-else>
          <span class="publish-text" v-if="!note.saveError">保存中...</span>
          <span class="publish-text" v-else>保存出错</span>
        </template>
      </li>
      <el-tooltip effect="dark" content="插入图片" placement="top" :hide-after="0">
        <li class="tool" @click="handleImgInput">
          <input
            ref="imgFileInputRef"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            multiple="multiple"
            @change="handleImgFileChange"
          />
          <svg-icon name="pic"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip effect="dark" content="撤销" placement="top" :hide-after="0">
        <li class="tool" @click="handleUndo" :style="{ color: undoStack.length < 2 ? '#999' : '' }">
          <svg-icon name="revoke"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip effect="dark" content="重做" placement="top" :hide-after="0">
        <li class="tool" @click="handleRedo" :style="{ color: redoStack.length < 1 ? '#999' : '' }">
          <svg-icon name="redo"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip effect="dark" content="历史版本" placement="top" :hide-after="0">
        <li class="tool" @click="handleViewHistory">
          <svg-icon name="time-history"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip effect="dark" content="Markdown语法参考" placement="top" :hide-after="0">
        <li class="tool" @click="fileMarkdownRef.open">
          <svg-icon name="file-markdown"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip effect="dark" content="保存" placement="top" :hide-after="0">
        <li class="tool right" @click="handleSaveNote(true)">
          <svg-icon name="save"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip
        effect="dark"
        :content="props.isPreviewMode ? '返回' : '预览模式'"
        placement="top"
        :hide-after="0"
      >
        <li class="tool right" @click="handlePreview">
          <svg-icon name="square-split"></svg-icon>
        </li>
      </el-tooltip>
    </ul>
    <textarea
      ref="sourceRef"
      class="source-wrapper"
      placeholder="请输入内容"
      spellcheck="false"
      v-model="note.note_content"
      @keydown.tab="handleKeyTab"
      @keydown="handleKeyCtrl"
      @input="handleNoteChange"
    ></textarea>

    <FileMarkdown ref="fileMarkdownRef"></FileMarkdown>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import md5 from 'js-md5'
import { getNote, publishNote, saveNote } from '@/api/notebook/note'
import { ElMessage } from 'element-plus'
import FileMarkdown from './components/FileMarkdown.vue'
import { uploadFile } from '@/api/upload'
import { useNoteStore } from '@/stores/note'
import useHistoryStack from './useHistoryStack'

defineOptions({
  name: 'EditorComponent',
})

const store = useNoteStore()
const { undoStack, redoStack, recordFirstState, recordState, undo, redo } = useHistoryStack()
const fileMarkdownRef = ref()
let abortController

const props = defineProps({
  isPreviewMode: {
    type: Boolean,
    default: false,
  },
  activeNoteIndex: {
    type: Number,
    default: -1,
  },
})

const emits = defineEmits(['sync-title', 'sync-content', 'sync-status'])

const route = useRoute()
const router = useRouter()

const categoryId = computed(() => Number(route.params.categoryId))
const noteId = ref()
const noteLoading = ref(false)
const note = ref({})

function syncToStoreNoteList(type, val, noteIndex) {
  const noteList = store.categoryNoteMap.get(categoryId.value)
  if (noteIndex > -1) {
    if (type === 'title') {
      noteList[noteIndex].note_title = val
    } else if (type === 'status') {
      noteList[noteIndex].status = val
    }
  }
}

watch(
  () => route.params.noteId,
  (val) => {
    noteId.value = Number(val) || undefined
    if (noteId.value && categoryId.value) {
      handleGetNote()
        .then(() => {
          initStateStack()

          if (props.isPreviewMode) {
            emits('sync-title', note.value.note_title)
            emits('sync-content', note.value.note_content)
          }
        })
        .catch((err) => {
          if (err === 'canceled') return
          if (props.isPreviewMode) {
            // 预览时如果后端报错比如记录不存在则重置笔记内容达到隐藏笔记的目的
            emits('sync-title', undefined)
            emits('sync-content', '')
          } else {
            // 非预览时如果后端报错比如记录不存在则重置路由地址达到隐藏笔记内容的目的
            if (categoryId.value) {
              router.replace(`/category/${categoryId.value}`)
            }
          }
        })
    } else {
      if (props.isPreviewMode) {
        ElMessage.error('记录不存在')
      }
    }
  },
  {
    immediate: true,
  }
)

const titleRef = ref()
const sourceRef = ref()
const titleFocus = defineModel('titleFocus')

function handleGetNote() {
  if (abortController) {
    abortController.abort()
  }

  if (store.noteContentMap.has(noteId.value)) {
    noteLoading.value = false
    note.value = store.noteContentMap.get(noteId.value)
    return Promise.resolve()
  }

  abortController = new AbortController()
  const signal = abortController.signal

  noteLoading.value = true
  return getNote({ note_id: noteId.value }, signal)
    .then((res) => {
      noteLoading.value = false
      note.value = res.data

      if (note.value.category_id !== categoryId.value) {
        ElMessage.error('记录不存在')
        return Promise.reject()
      }

      if (!note.value.note_content) note.value.note_content = ''
      store.noteContentMap.set(noteId.value, note.value)

      nextTick(() => {
        if (titleFocus.value) {
          titleRef.value.select()
          titleFocus.value = false
        }
      })
    })
    .catch((err) => {
      // 主动取消请求保持内容的加载中状态
      if (err.code === 'ERR_CANCELED') return Promise.reject('canceled')
      noteLoading.value = false
      return Promise.reject()
    })
}

function initStateStack() {
  const { note_title, note_content } = note.value
  recordFirstState({
    note_title,
    note_content,
  })
}

let timeoutId
function handleNoteChange() {
  clearTimeout(timeoutId)
  const { note_id, note_title, note_content, status } = note.value
  const data = { note_id, note_title, note_content, status, index: props.activeNoteIndex }

  timeoutId = setTimeout(() => {
    handleSaveNote(false, true, data)
  }, 800)
}

function handleSaveNote(withMessage = false, enableRecordState = true, data = null) {
  if (!data) {
    const { note_id, note_title, note_content, status } = note.value
    data = { note_id, note_title, note_content, status, index: props.activeNoteIndex }
  }

  const storeNote = store.noteContentMap.get(data.note_id)
  storeNote.saveLoading = true
  storeNote.saveError = false

  saveNote({ note_id: data.note_id, note_title: data.note_title, note_content: data.note_content })
    .then(() => {
      if (data.note_id === noteId.value && note.value.status === 1) note.value.status = 2

      syncToStoreNoteList('title', data.note_title, data.index)
      if (data.status === 1) {
        storeNote.status = 2
        syncToStoreNoteList('status', 2, data.index)
      }

      if (props.isPreviewMode) {
        emits('sync-title', data.note_title)
        emits('sync-content', data.note_content)
      }

      storeNote.saveLoading = false

      if (enableRecordState) {
        recordState({
          note_title: data.note_title,
          note_content: data.note_content,
        })
      }

      if (withMessage) {
        ElMessage.success('保存成功')
      }
    })
    .catch(() => {
      storeNote.saveError = true
      if (withMessage) {
        ElMessage.error('保存失败')
      }
    })
}

function handleUndo() {
  const state = undo()
  state && applyState(state)
}

function handleRedo() {
  const state = redo()
  state && applyState(state)
}

function applyState(state) {
  note.value.note_title = state.note_title
  note.value.note_content = state.note_content
  handleSaveNote(false, false)
}

function handleKeyCtrl(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSaveNote(true)
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
    e.preventDefault()
    handleRedo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    handleUndo()
  }
}

const imgFileInputRef = ref()
function handleImgInput() {
  imgFileInputRef.value.click()
}

function handleImgFileChange(e) {
  const start = sourceRef.value.selectionStart
  const end = sourceRef.value.selectionEnd
  let uploadingStr = ''
  const filePromiseArr = []

  for (let i = 0; i < e.target.files.length; i++) {
    const timestamp = +new Date()
    const tmpStr = `[图片正在上传...(${e.target.files[i].name}-${timestamp})]\n`
    uploadingStr += tmpStr
    filePromiseArr.push(handleUploadImg(e.target.files[i], tmpStr, timestamp))
  }

  const content = note.value.note_content
  note.value.note_content = content.slice(0, start) + uploadingStr + content.slice(end)

  Promise.allSettled(filePromiseArr).then(() => {
    imgFileInputRef.value.value = ''
    handleSaveNote()
  })
}

function handleUploadImg(file, uploadingStr, timestamp) {
  const fileNameArr = file.name.split('.')
  const suffix = fileNameArr[fileNameArr.length - 1]
  const newFileName = timestamp + '-' + md5(file.name) + '.' + suffix

  const data = new FormData()
  data.append('key', `images/${newFileName}`)
  data.append('file', file)

  return uploadFile(data)
    .then((res) => {
      const imgUrl = res.data.url
      const content = note.value.note_content
      const start = content.indexOf(uploadingStr)
      const end = start + uploadingStr.length
      note.value.note_content =
        content.slice(0, start) + `![${file.name}](${imgUrl})\n` + content.slice(end)
    })
    .catch(() => {
      const content = note.value.note_content
      const start = content.indexOf(uploadingStr)
      const end = start + uploadingStr.length
      note.value.note_content = content.slice(0, start) + '' + content.slice(end)
    })
}

function handleKeyTab(e) {
  e.preventDefault()

  const tab = '  '
  const start = sourceRef.value.selectionStart
  const end = sourceRef.value.selectionEnd
  const content = note.value.note_content

  const textBeforeCursor = content.substring(0, start)
  const selectedText = content.substring(start, end)

  if (selectedText.split('\n').length === 1 && !e.shiftKey) {
    note.value.note_content = content.slice(0, start) + tab + content.slice(end)
    nextTick(() => {
      sourceRef.value.setSelectionRange(start + tab.length, start + tab.length)
    })
  } else {
    const startLine = textBeforeCursor.split('\n').length - 1
    const endLine = startLine + selectedText.split('\n').length

    let firstCursorChangedNum = 0
    let endCursorChangedNum = 0

    const newText = content
      .split('\n')
      .map((line, index) => {
        if (index >= startLine && index < endLine) {
          const leadingSpaces = line.match(/^\s*/)[0]
          const remainder = leadingSpaces.length % tab.length
          const num = leadingSpaces.length === 0 && e.shiftKey ? 0 : tab.length - remainder

          if (index === startLine) firstCursorChangedNum = num
          endCursorChangedNum += num

          if (e.shiftKey) {
            return leadingSpaces.slice(0, -num) + line.substring(leadingSpaces.length)
          } else {
            return leadingSpaces + ' '.repeat(num) + line.substring(leadingSpaces.length)
          }
        } else {
          return line
        }
      })
      .join('\n')

    note.value.note_content = newText

    nextTick(() => {
      if (e.shiftKey) {
        firstCursorChangedNum = -firstCursorChangedNum
        endCursorChangedNum = -endCursorChangedNum
      }
      sourceRef.value.setSelectionRange(start + firstCursorChangedNum, end + endCursorChangedNum)
    })
  }

  handleNoteChange()
}

const publishCancel = ref(false)
const publishUpdate = computed(() => {
  return note.value.status === 2
})
const published = computed(() => {
  return note.value.status === 1
})

function hanldePublish(status) {
  if (note.value.publishLoading || note.value.saveLoading) return

  const data = {
    note_id: noteId.value,
    status,
  }
  const index = props.activeNoteIndex

  const storeNote = store.noteContentMap.get(data.note_id)
  storeNote.publishLoading = true
  storeNote.publishError = false

  const delay = 200
  publishNote(data)
    .then(() => {
      setTimeout(() => {
        if (data.note_id === note.value.note_id) note.value.status = status
        storeNote.status = status
        storeNote.publishLoading = false
      }, delay)

      syncToStoreNoteList('status', status, index)

      if (status) {
        ElMessage.success('发布成功')
      } else {
        ElMessage.warning('已取消发布')
      }
    })
    .catch(() => {
      setTimeout(() => {
        storeNote.publishError = true
        storeNote.publishLoading = false
      }, delay)
    })
}

function handlePreview() {
  if (props.isPreviewMode) {
    const { noteId, categoryId } = route.params
    router.push(`/category/${categoryId}/note/${noteId}`)
  } else {
    router.push(route.fullPath + '/preview')
  }
}

function handleViewHistory() {
  router.push(`/category/${categoryId.value}/note/${noteId.value}/history/0`)
}

defineExpose({
  source: sourceRef,
})
</script>

<style lang="scss" scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  /* sidebar: 15% notelist: 25% */
  width: 60%;
  height: 100%;
  background: #fffff9;

  .title-wrapper {
    width: 100%;
    height: 70px;

    .save-status {
      height: 20px;
      line-height: 20px;
      font-size: 12px;
      padding-right: 5px;
      color: #ccc;
      text-align: right;
    }

    .custom-input {
      width: 100%;
      height: calc(100% - 20px);
      border: none;
      background: transparent;
      padding: 0 30px 15px;
      font-size: 30px;
      outline: none;
      margin: 0;
    }
  }

  .tool-bar-wrapper {
    width: 100%;
    background: #ccc;
    padding-right: 5px;

    &:after,
    &:before {
      content: '';
      display: table;
      clear: both;
    }

    li.tool {
      display: inline-block;
      color: #555;
      font-size: 16px;
      padding: 8px 10px;
      vertical-align: top;
      cursor: pointer;

      input {
        width: 0;
        height: 0;
        display: none;
      }

      &:hover {
        background: #555;
        color: #efefef;
      }

      &.right {
        float: right;
      }

      &.publish {
        width: 93px;
        text-align: center;
      }

      .publish-text {
        display: inline-block;
        font-size: 13px;
        vertical-align: 1px;
        margin-left: 5px;
      }
    }
  }

  .source-wrapper {
    flex: 1;
    width: 100%;
    border: none;
    outline: none;
    padding: 30px;
    font-weight: 400;
    line-height: 30px;
    background: #fffff9;
    resize: none;
    font-size: 18px;
  }
}
</style>
