<template>
  <div class="note-container">
    <div class="handle-wrapper" v-if="currentNote.note_title !== undefined">
      <el-button type="primary" @click="handleRestoreNote">恢复笔记</el-button>
      <el-button type="danger" @click="handleDeleteNote">彻底删除</el-button>
    </div>
    <div class="sidebar-wrapper" v-loading="listLoading">
      <header>
        <span>共</span>
        <span class="num">&nbsp;{{ noteList.length }}&nbsp;</span>
        <span>条笔记</span>
      </header>
      <ul class="note-list">
        <li
          class="note-item"
          v-for="(item, index) in noteList"
          :key="item.note_id"
          :class="[activeId === item.note_id ? 'active' : '']"
          @click="handleItemClick(item.note_id, index)"
        >
          <span>{{ item.note_title }}</span>
        </li>
      </ul>
    </div>

    <div class="note-wrapper" ref="previewerRef" v-loading="noteLoading" v-show="activeId">
      <div class="note">
        <div class="title">{{ currentNote.note_title }}</div>
        <div class="info">{{ currentNote.create_time }}</div>
        <div class="md-result-wrapper" v-html="md.render(currentNote.note_content || '')"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import {
  getDeletedNoteList,
  getDeletedNoteContent,
  restoreNote,
  completelyDeleteNote,
} from '@/api/notebook/note'
import { useRoute, useRouter } from 'vue-router'
import useMarkdown from '../preview/useMarkdown'
import useImgLazyLoad from '../preview/useImgLazyLoad'
import { useNoteStore } from '@/stores/note'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

defineOptions({
  name: 'NoteRecycleBin',
})

const store = useNoteStore()
const { md } = useMarkdown()
let abortController

const route = useRoute()
const router = useRouter()

const noteList = ref([])
const listLoading = ref(false)

const activeId = ref()
let activeIndex = -1

const currentNote = ref({})
const noteLoading = ref(false)

handleGetDeletedNoteList()

function handleGetDeletedNoteList() {
  listLoading.value = true
  const noteId = Number(route.query.noteId) || undefined
  getDeletedNoteList()
    .then((res) => {
      noteList.value = res.data.note_list
      if (noteId) {
        activeId.value = noteId
        activeIndex = noteList.value.findIndex((item) => item.note_id === noteId)
      } else {
        toFirstNote()
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}

function reset() {
  currentNote.value = {}
  router.replace({ name: 'NoteRecycleBin' })
}

function toFirstNote() {
  activeId.value = noteList.value[0]?.note_id
  activeIndex = activeId.value ? 0 : -1
}

const previewerRef = ref()
const { loadImgFn: handleImgLazyLoad } = useImgLazyLoad(previewerRef)

watch(activeId, (val) => {
  if (val) {
    handleGetDeletedNote(val).then(() => {
      nextTick(() => {
        handleImgLazyLoad()
        previewerRef.value.scrollTop = 0
      })
      router.replace({ name: 'NoteRecycleBin', query: { noteId: val } })
    })
  } else {
    reset()
  }
})

function handleGetDeletedNote(id) {
  if (abortController) {
    abortController.abort()
  }

  if (store.noteContentMap.has(id)) {
    noteLoading.value = false
    currentNote.value = store.noteContentMap.get(id)
    return Promise.resolve()
  }

  abortController = new AbortController()
  const signal = abortController.signal

  noteLoading.value = true
  return getDeletedNoteContent({ note_id: id }, signal)
    .then((res) => {
      noteLoading.value = false
      currentNote.value = res.data
      store.noteContentMap.set(id, currentNote.value)
    })
    .catch((err) => {
      if (err.code === 'ERR_CANCELED') return Promise.reject('canceled')
      noteLoading.value = false
      reset()
      return Promise.reject()
    })
}

function handleItemClick(id, index) {
  activeId.value = id
  activeIndex = index
}

function handleRestoreNote() {
  const restoreLoading = ElLoading.service({
    lock: true,
    text: '恢复中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  restoreNote({ note_id: activeId.value })
    .then((res) => {
      const noteItem = noteList.value[activeIndex]
      if (store.categoryNoteMap.has(noteItem.category_id)) {
        store.categoryNoteMap.get(noteItem.category_id).unshift(noteItem)
      }
      if (res.data.restore_category && store.categoryList) {
        store.categoryList.unshift(res.data.restore_category)
      }
      currentNote.value.publishLoading = false
      currentNote.value.publishError = false
      currentNote.value.saveLoading = false
      currentNote.value.saveError = false
      currentNote.value.status = 0
      router.push(`/category/${noteItem.category_id}/note/${activeId.value}`)
    })
    .finally(() => {
      restoreLoading.close()
    })
}

function handleDeleteNote() {
  ElMessageBox.confirm('确认彻底删除笔记？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    closeOnHashChange: false,
    draggable: true,
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.cancelButtonClass = 'is-disabled'
        instance.confirmButtonLoading = true
        completelyDeleteNote({ note_id: activeId.value })
          .then(() => {
            noteList.value.splice(activeIndex, 1)
            store.noteContentMap.delete(activeId.value)
            toFirstNote()
            done()
          })
          .finally(() => {
            instance.cancelButtonClass = ''
            instance.confirmButtonLoading = false
          })
      } else {
        if (instance.confirmButtonLoading === true) return
        done()
      }
    },
  }).then(() => {
    ElMessage({
      message: '笔记已彻底删除',
      type: 'success',
    })
  })
}
</script>

<style scoped lang="scss">
.note-container {
  display: flex;
  position: relative;
  width: 100%;
  height: calc(100% - 50px);

  .handle-wrapper {
    position: absolute;
    right: 20px;
    top: 10px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    z-index: 10;
  }

  .sidebar-wrapper {
    width: 230px;
    height: 100%;
    background: #fff;
    border-right: 1px solid #ccc;

    header {
      width: 100%;
      padding: 10px;
      font-size: 14px;
      line-height: 19px;
      color: #555;
      border-bottom: 1px solid #d9d9d9;

      .num {
        color: var(--base-primary-color);
      }
    }

    .note-list {
      width: 100%;
      height: calc(100% - 40px);
      overflow-y: auto;

      .note-item {
        padding: 10px;
        border-bottom: 1px solid #d9d9d9;
        font-size: 12px;
        line-height: 19px;
        color: #555;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        &.active {
          color: var(--base-primary-color);
        }
      }
    }
  }

  .note-wrapper {
    width: calc(100% - 230px);
    height: 100%;
    overflow-y: auto;
    background: #fffff9;
    padding: 20px;

    .note {
      max-width: 720px;
      margin: 0 auto;

      .title {
        line-height: 1.8;
        font-size: 30px;
        font-weight: 600;
        margin-top: 20px;
      }

      .info {
        font-size: 14px;
        color: #555;
        margin-bottom: 30px;
      }
    }
  }
}
</style>
