<template>
  <div class="handle-wrapper">
    <el-button
      type="primary"
      @click="handleRecoveryNote"
      v-show="currentVersion.note_content !== undefined"
    >
      恢复到这个版本
    </el-button>
    <el-button type="info" plain @click="handleBack">返回</el-button>
  </div>

  <div class="note-history-wrapper">
    <div class="sidebar-wrapper">
      <header>
        <span>共</span>
        <span class="num">&nbsp;{{ historyList.length }}&nbsp;</span>
        <span>条历史版本</span>
      </header>
      <ul class="history-list" v-loading="listLoading">
        <li
          class="history-item"
          v-for="item in historyList"
          :key="item.id"
          :class="[activeId === item.id ? 'active' : '']"
          @click="handleItemClick(item.id)"
        >
          <span>{{ item.create_time }}</span>
        </li>
      </ul>
    </div>

    <div class="note-wrapper" ref="previewerRef" v-loading="versionLoading">
      <div class="note" v-show="currentVersion.note_title !== undefined">
        <div class="title">{{ currentVersion.note_title }}</div>
        <div class="info">{{ currentVersion.create_time }}</div>
        <div class="md-result-wrapper" v-html="md.render(currentVersion.note_content || '')"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { getNoteHistoryList, getNoteHistoryVersion, recoveryNote } from '@/api/notebook/note'
import useMarkdown from '../preview/useMarkdown'
import useImgLazyLoad from '../preview/useImgLazyLoad'
import { useRoute, useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/note'
import { ElLoading } from 'element-plus'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'NoteHIstory',
})

const store = useNoteStore()
let abortController

const route = useRoute()
const router = useRouter()
const { md } = useMarkdown()

const listLoading = ref(false)
const historyList = ref([])
const historyId = Number(route.params.historyId)
const activeId = ref()
const currentVersion = ref({})

handleGetNoteHistoryList()

function handleGetNoteHistoryList() {
  listLoading.value = true
  const { noteId, categoryId } = route.params
  getNoteHistoryList({ note_id: Number(noteId) })
    .then((res) => {
      if (res.data.category_id !== Number(categoryId)) {
        ElMessage.error('记录不存在')
        return Promise.reject()
      }

      historyList.value = res.data.note_history_list

      if (historyId) {
        activeId.value = historyId
      } else {
        activeId.value = historyList.value[0]?.id
      }
    })
    .catch(() => {
      currentVersion.value = {}
    })
    .finally(() => {
      listLoading.value = false
    })
}

const historyVersionMap = new Map()
const versionLoading = ref(false)

function handleItemClick(id) {
  activeId.value = id
}

const previewerRef = ref()
const { loadImgFn: handleImgLazyLoad } = useImgLazyLoad(previewerRef)

watch(activeId, (val) => {
  if (!val) return
  handleGetCurrentVersion(val).then(() => {
    nextTick(() => {
      handleImgLazyLoad()
      previewerRef.value.scrollTop = 0
    })
    const { noteId, categoryId } = route.params
    router.replace(`/category/${categoryId}/note/${noteId}/history/${val}`)
  })
})

function handleGetCurrentVersion(id) {
  if (abortController) {
    abortController.abort()
  }

  if (historyVersionMap.get(id)) {
    currentVersion.value = historyVersionMap.get(id)
    return Promise.resolve()
  }

  abortController = new AbortController()
  const signal = abortController.signal

  versionLoading.value = true
  const { noteId } = route.params
  return getNoteHistoryVersion({ id }, signal)
    .then((res) => {
      versionLoading.value = false
      if (res.data.note_id !== Number(noteId)) {
        ElMessage.error('记录不存在')
        return Promise.reject()
      }
      currentVersion.value = res.data
      historyVersionMap.set(id, currentVersion.value)
    })
    .catch((err) => {
      if (err.code === 'ERR_CANCELED') return Promise.reject('canceled')
      versionLoading.value = false
      currentVersion.value = {}
      return Promise.reject()
    })
}

function handleRecoveryNote() {
  const loading = ElLoading.service({
    lock: true,
    text: '恢复中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  recoveryNote({ id: activeId.value })
    .then((res) => {
      const currentNote = store.noteContentMap.get(res.data.note_id)
      if (currentNote) {
        currentNote.note_title = currentVersion.value.note_title
        currentNote.note_content = currentVersion.value.note_content
      }
      handleBack()
    })
    .finally(() => {
      loading.close()
    })
}

function handleBack() {
  const { noteId, categoryId } = route.params
  router.push(`/category/${categoryId}/note/${noteId}`)
}
</script>

<style scoped lang="scss">
.handle-wrapper {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 10;
}

.note-history-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;

  .sidebar-wrapper {
    width: 230px;
    background: #fff;
    border-right: 1px solid #ccc;

    header {
      width: 100%;
      padding: 10px;
      font-size: 14px;
      line-height: 20px;
      color: #fff;
      background: #555;

      .num {
        color: var(--base-primary-color);
      }
    }

    .history-list {
      width: 100%;
      height: calc(100% - 40px);
      overflow-y: auto;

      .history-item {
        padding: 15px;
        border-bottom: 1px solid #d9d9d9;
        font-size: 14px;
        line-height: 19px;
        color: #555;
        cursor: pointer;

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
        margin-top: 30px;
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
