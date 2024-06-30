<template>
  <div class="editor-wrapper" v-if="noteId" v-loading="noteLoading">
    <div class="title-wrapper">
      <div className="save-status">
        {{ saveLoading ? (saveError ? '保存出错' : '保存中...') : '已保存' }}
      </div>
      <input
        ref="titleRef"
        v-model="note.note_title"
        maxlength="50"
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
        <template v-if="!saveLoading">
          <span v-if="published">
            <span v-if="publishLoading">
              <span class="publish-text">取消中...</span>
            </span>
            <span v-else>
              <template v-if="publishError">
                <span class="publish-text" style="color: red">点击重试</span>
              </template>
              <template v-else>
                <svg-icon :name="publishCancel ? 'error' : 'success'"></svg-icon>
                <span class="publish-text">{{ publishCancel ? '取消发布' : '已发布' }}</span>
              </template>
            </span>
          </span>
          <span v-else>
            <span v-if="publishLoading">
              <span class="publish-text">发布中...</span>
            </span>
            <span v-else>
              <template v-if="publishError">
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
          <span class="publish-text" v-if="!saveError">保存中...</span>
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
        <li
          class="tool"
          @click="handleUndo"
          :style="{ color: store.undoStack.length < 2 ? '#999' : '' }"
        >
          <svg-icon name="revoke"></svg-icon>
        </li>
      </el-tooltip>
      <el-tooltip effect="dark" content="重做" placement="top" :hide-after="0">
        <li
          class="tool"
          @click="handleRedo"
          :style="{ color: store.redoStack.length < 1 ? '#999' : '' }"
        >
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
      @keydown.tab.exact="handleKeyTab"
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
import { getNoteContent, publishNote, saveNote } from '@/api/notebook/note'
import { ElMessage } from 'element-plus'
import FileMarkdown from './components/FileMarkdown.vue'
import { uploadFile } from '@/api/upload'
import { useNoteStore } from '@/stores/note'

defineOptions({
  name: 'EditorComponent',
})

const store = useNoteStore()
let abortController

const props = defineProps({
  isPreviewMode: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['sync-title', 'sync-content', 'sync-status'])

const route = useRoute()
const router = useRouter()

const saveLoading = ref(false)
const saveError = ref(false)

const publishLoading = ref(false)
const publishError = ref(false)

function resetStatus() {
  saveLoading.value = false
  saveError.value = false
  publishLoading.value = false
  publishError.value = false
}

const noteId = ref()
const noteLoading = ref(false)
const note = ref({})

watch(
  () => route.params.noteId,
  (val) => {
    noteId.value = Number(val) || undefined
    if (noteId.value) {
      handleGetNoteContent().then(() => {
        resetStatus()
        initStateStack()

        if (props.isPreviewMode) {
          emits('sync-title', note.value.note_title)
          emits('sync-content', note.value.note_content)
        }
      })
    }
  },
  {
    immediate: true,
  }
)

function initStateStack() {
  store.resetStateStack()
  store.recordFirstState({
    note_title: note.value.note_title,
    note_content: note.value.note_content,
  })
}

const titleRef = ref()
const sourceRef = ref()
const titleFocus = defineModel('titleFocus')

function handleGetNoteContent() {
  if (store.noteContentMap.has(noteId.value)) {
    note.value = store.noteContentMap.get(noteId.value)
    return Promise.resolve()
  }

  if (abortController) {
    abortController.abort()
  }

  abortController = new AbortController()
  const signal = abortController.signal

  noteLoading.value = true
  return getNoteContent({ note_id: noteId.value }, signal)
    .then((res) => {
      note.value = res.data
      if (!note.value.note_content) {
        note.value.note_content = ''
      }
      store.noteContentMap.set(noteId.value, note.value)
      noteLoading.value = false

      nextTick(() => {
        if (titleFocus.value) {
          titleRef.value.select()
          titleFocus.value = false
        }
      })
    })
    .catch((err) => {
      // 主动取消请求则保持内容的加载中状态
      if (err.code === 'ERR_CANCELED') {
        return Promise.reject()
      }

      noteLoading.value = false

      // 如果后端报错比如记录不存在则重置路由地址达到隐藏笔记内容的目的
      router.replace(`/category/${route.params.categoryId}`)
      return Promise.reject()
    })
}

const publishCancel = ref(false)
const publishUpdate = computed(() => {
  return note.value.status === 2
})
const published = computed(() => {
  return note.value.status === 1
})

let timeoutId
function handleNoteChange() {
  clearTimeout(timeoutId)
  const data = Object.assign({}, note.value)

  timeoutId = setTimeout(() => {
    handleSaveNote(false, true, data)
  }, 1000)
}

function handleSaveNote(withMessage = false, recordState = true, data = null) {
  saveLoading.value = true
  saveError.value = false
  if (!data) data = Object.assign({}, note.value)
  saveNote(data)
    .then(() => {
      if (data.status === 1) data.status = 2
      if (data.status === 1 && data.note_id === note.value.note_id) note.value.status = 2
      if (props.isPreviewMode) {
        emits('sync-title', data.note_title)
        emits('sync-content', data.note_content)
      } else {
        emits('sync-status', { noteId: data.note_id, status: data.status })
        emits('sync-title', { noteId: data.note_id, noteTitle: data.note_title })
      }

      saveLoading.value = false

      if (recordState) {
        store.recordState({
          note_title: data.note_title,
          note_content: data.note_content,
        })
      }

      if (withMessage) {
        ElMessage.success('保存成功')
      }
    })
    .catch(() => {
      saveError.value = true
      if (withMessage) {
        ElMessage.error('保存失败')
      }
    })
}

function handleUndo() {
  const state = store.undo()
  state && applyState(state)
}

function handleRedo() {
  const state = store.redo()
  state && applyState(state)
}

function applyState(state) {
  note.value.note_title = state.note_title
  note.value.note_content = state.note_content
  handleSaveNote(false, false)
}

function hanldePublish(status) {
  if (publishLoading.value || saveLoading.value) return

  const data = {
    note_id: note.value.note_id,
    status,
  }

  publishLoading.value = true
  publishError.value = false

  const delay = 200
  publishNote(data)
    .then(() => {
      setTimeout(() => {
        note.value.status = status
        publishLoading.value = false
      }, delay)

      if (!props.isPreviewMode) {
        emits('sync-status', status)
      }

      if (status) {
        ElMessage.success('发布成功')
      } else {
        ElMessage.warning('已取消发布')
      }
    })
    .catch(() => {
      setTimeout(() => {
        publishError.value = true
        publishLoading.value = false
      }, delay)
    })
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
    const tmpStr = `[图片正在上传...(${e.target.files[i].name}-${+new Date()})]\n`
    uploadingStr += tmpStr
    handleUploadImg(e.target.files[i], tmpStr, filePromiseArr)
  }

  const content = note.value.note_content
  note.value.note_content = content.slice(0, start) + uploadingStr + content.slice(end)

  Promise.allSettled(filePromiseArr).then(() => {
    imgFileInputRef.value.value = ''
    handleSaveNote()
  })
}

function handleUploadImg(file, uploadingStr, filePromiseArr) {
  const fileNameArr = file.name.split('.')
  const newFileName = +new Date() + '-' + md5(file.name) + '.' + fileNameArr[fileNameArr.length - 1]

  const data = new FormData()
  data.append('key', `images/${newFileName}`)
  data.append('file', file)

  const filePromise = uploadFile(data)
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

  filePromiseArr.push(filePromise)
}

function handleKeyTab(e) {
  e.preventDefault()
  const start = sourceRef.value.selectionStart
  const end = sourceRef.value.selectionEnd
  const content = note.value.note_content
  const tab = '  '

  note.value.note_content = content.slice(0, start) + tab + content.slice(end)
  nextTick(() => {
    sourceRef.value.setSelectionRange(start + tab.length, start + tab.length)
  })
}

function handleKeyCtrl(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSaveNote(true)
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    handleUndo()
  }
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
  router.push(route.fullPath + '/history/0')
}

const fileMarkdownRef = ref()

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
