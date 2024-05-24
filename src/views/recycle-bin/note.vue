<template>
  <div class="note-container">
    <div class="handle-wrapper" v-if="currentNote.note_content !== undefined">
      <el-button type="primary" @click="handleRestoreNote" :disabled="deleteLoading">
        恢复笔记
      </el-button>
      <el-button type="danger" @click="handleDeleteNote" :loading="deleteLoading">
        彻底删除
      </el-button>
    </div>
    <div class="sidebar-wrapper" v-loading="listLoading">
      <header>
        <span>共</span>
        <span class="num">&nbsp;{{ noteList.length }}&nbsp;</span>
        <span>条</span>
      </header>
      <ul class="note-list" v-loading="listLoading">
        <li
          class="note-item"
          v-for="item in noteList"
          :key="item.note_id"
          :class="[activeId === item.note_id ? 'active' : '']"
          @click="handleItemClick(item.note_id)"
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
import { ref, watch, nextTick, onMounted } from 'vue'
import {
  getDeletedNoteList,
  getDeletedNote,
  restoreNote,
  completelyDeleteNote,
} from '@/api/notebook/note'
import { useRoute, useRouter } from 'vue-router'
import useMarkdown from '../preview/markdown'
import useImgLazyLoad from '../preview/img-lazy-load'
import { useNoteStore } from '@/stores/note'
import { ElLoading } from 'element-plus'

defineOptions({
  name: 'NoteRecycleBin',
})

// TODO: 笔记缓存改造
const store = useNoteStore()

const route = useRoute()
const router = useRouter()
const { md } = useMarkdown()

const noteList = ref([])
const listLoading = ref(false)
const noteLoading = ref(false)

const noteId = Number(route.query.noteId)
const activeId = ref(noteId)
let activeIndex = -1

const currentNote = ref({})

handleGetDeletedNoteList()

function handleGetDeletedNoteList() {
  listLoading.value = true
  getDeletedNoteList()
    .then((res) => {
      noteList.value = res.data.note_list
      if (noteId) {
        activeIndex = noteList.value.findIndex((item) => item.note_id === noteId)
      } else {
        toFirstNote()
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}

function toFirstNote() {
  activeId.value = noteList.value[0]?.note_id
  activeIndex = activeId.value ? 0 : -1
}

watch(activeId, (val) => {
  if (val) {
    handleGetDeletedNote(val)
  } else {
    currentNote.value = {}
    router.replace({ name: 'NoteRecycleBin' })
  }
})

const previewerRef = ref()
let handleImgLazyLoad = null

onMounted(() => {
  const { loadImgFn } = useImgLazyLoad(previewerRef.value)
  handleImgLazyLoad = loadImgFn
  previewerRef.value.addEventListener('scroll', handleImgLazyLoad)
})

function handleGetDeletedNote(id) {
  noteLoading.value = true
  getDeletedNote({ note_id: id })
    .then((res) => {
      currentNote.value = res.data
      router.replace({ name: 'NoteRecycleBin', query: { noteId: id } })
      nextTick(() => {
        handleImgLazyLoad()
        previewerRef.value.scrollTop = 0
      })
    })
    .finally(() => {
      noteLoading.value = false
    })
}

function handleItemClick(id) {
  activeId.value = id
}

function handleRestoreNote() {
  // TODO: 恢复分类改造
  const restoreLoading = ElLoading.service({
    lock: true,
    text: '恢复中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  restoreNote({ note_id: activeId.value })
    .then(() => {
      const noteItem = noteList.value[activeIndex]
      if (store.categoryNoteMap.has(noteItem.category_id)) {
        store.categoryNoteMap.get(noteItem.category_id).unshift(noteItem)
      }
      router.go(-1)
    })
    .finally(() => {
      restoreLoading.close()
    })
}

const deleteLoading = ref(false)

function handleDeleteNote() {
  // TODO: 删除分类改造
  deleteLoading.value = true
  completelyDeleteNote({ note_id: activeId.value })
    .then(() => {
      noteList.value.splice(activeIndex, 1)
      toFirstNote()
    })
    .finally(() => {
      deleteLoading.value = false
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
      max-width: 800px;
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
