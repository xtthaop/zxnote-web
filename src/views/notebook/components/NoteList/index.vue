<template>
  <div class="note-list-wrapper" v-if="categoryId" v-loading="listLoading">
    <div class="add-btn" @click="handleAddNote">
      <svg-icon name="plus"></svg-icon>
      <span>新建笔记</span>
    </div>
    <el-scrollbar style="height: calc(100% - 51px); margin-top: 51px">
      <ul class="note-list">
        <li
          v-for="(item, index) in noteList"
          :key="item.note_id"
          :class="{ active: activeId === item.note_id }"
          @click="handleNoteItemClick(item.note_id, index)"
        >
          <div class="note-info-wrapper">
            <div class="note-info">
              <div class="title">{{ item.note_title }}</div>
              <div class="other-info">
                <span
                  class="publish-status"
                  :style="{ color: publicStatusColor[item.status] || '#ccc' }"
                >
                  {{ publicStatusText[item.status] || '未知' }}
                </span>
                <span class="create-time">
                  {{ dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss') }}
                </span>
              </div>
            </div>

            <el-dropdown trigger="click">
              <span class="handle-btn"><svg-icon name="setting"></svg-icon></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleMoveNote(item)">
                    <svg-icon name="folder" style="margin-right: 10px"></svg-icon>
                    <span>移动笔记</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDeleteNote(item.note_id)">
                    <svg-icon name="delete" style="margin-right: 10px"></svg-icon>
                    <span>删除笔记</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </li>
      </ul>
    </el-scrollbar>

    <NoteForm ref="noteFormRef" @refresh="handleMoveNoteRefresh"></NoteForm>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dayjs } from 'element-plus'
import { getCategoryNote, addNote, softDeleteNote } from '@/api/notebook/note'
import { ElMessage, ElMessageBox } from 'element-plus'
import NoteForm from './components/NoteForm.vue'
import { useNoteStore } from '@/stores/note'

defineOptions({
  name: 'NoteListComponent',
})

const store = useNoteStore()
let abortController

const route = useRoute()
const router = useRouter()

const noteList = ref([])
const listLoading = ref(false)

const categoryId = ref()
let activeIndex = -1
const activeId = ref()

watch(
  () => route.params.categoryId,
  (val) => {
    categoryId.value = Number(val) || undefined
    if (categoryId.value) {
      const noteId = Number(route.params.noteId) || undefined
      activeId.value = noteId
      handleGetCategoryNote().then(() => {
        if (activeId.value) {
          activeIndex = noteList.value.findIndex((item) => item.note_id === activeId.value)
        } else {
          toFirstNote()
        }
      })
    }
  },
  {
    immediate: true,
  }
)

function toFirstNote() {
  activeId.value = noteList.value[0]?.note_id
  activeIndex = activeId.value ? 0 : -1
}

function handleGetCategoryNote() {
  if (store.categoryNoteMap.has(categoryId.value)) {
    noteList.value = store.categoryNoteMap.get(categoryId.value)
    return Promise.resolve()
  }

  if (abortController) {
    abortController.abort()
  }

  abortController = new AbortController()
  const signal = abortController.signal

  listLoading.value = true
  return getCategoryNote({ category_id: categoryId.value }, signal)
    .then((res) => {
      noteList.value = res.data.category_note_list
      store.categoryNoteMap.set(categoryId.value, noteList.value)
      listLoading.value = false
    })
    .catch((err) => {
      // 主动取消请求则保持列表的加载中状态
      if (err.code === 'ERR_CANCELED') {
        return Promise.reject()
      }

      listLoading.value = false

      // 如果后端报错比如记录不存在则重置路由地址达到隐藏笔记列表和笔记内容的目的
      router.replace('/')
      return Promise.reject()
    })
}

watch(activeId, (val) => {
  if (!categoryId.value) return

  if (val) {
    router.replace(`/category/${categoryId.value}/note/${val}`)
  } else {
    router.replace(`/category/${categoryId.value}`)
  }
})

function handleNoteItemClick(id, index) {
  activeId.value = id
  activeIndex = index
}

const titleFocus = defineModel('titleFocus')

function handleAddNote() {
  listLoading.value = true
  addNote({ category_id: categoryId.value })
    .then((res) => {
      noteList.value.unshift(res.data)
      titleFocus.value = true
      activeId.value = res.data.note_id
      activeIndex = 0
    })
    .finally(() => {
      listLoading.value = false
    })
}

function handleDeleteNote(id) {
  ElMessageBox.confirm('确认删除笔记？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    'show-close': false,
    'close-on-click-modal': false,
    type: 'warning',
  }).then(() => {
    listLoading.value = true
    softDeleteNote({ note_id: id })
      .then(() => {
        noteList.value.splice(activeIndex, 1)
        toFirstNote()
        ElMessage({
          message: '删除成功',
          type: 'success',
        })
      })
      .finally(() => {
        listLoading.value = false
      })
  })
}

const noteFormRef = ref()

function handleMoveNote(item) {
  const data = {
    ...item,
    category_id: categoryId.value,
  }
  noteFormRef.value.open(data)
}

function handleMoveNoteRefresh(val) {
  if (val.category_id !== categoryId.value) {
    noteList.value.splice(activeIndex, 1)
    toFirstNote()
    if (store.categoryNoteMap.has(val.category_id)) {
      const findIndex = store.categoryNoteMap
        .get(val.category_id)
        .findIndex((item) => new Date(item.create_time) <= new Date(val.create_time))
      if (findIndex > -1) {
        store.categoryNoteMap.get(val.category_id).splice(findIndex, 0, val)
      } else {
        store.categoryNoteMap.get(val.category_id).push(val)
      }
    }
  }
}

const publicStatusText = {
  0: '未发布',
  1: '已发布',
  2: '未发布更新',
}
const publicStatusColor = {
  0: '#696969',
  1: 'var(--base-primary-color)',
  2: '#E6A23C',
}
</script>

<style lang="scss" scoped>
.note-list-wrapper {
  position: relative;
  width: 25%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #ccc;

  .add-btn {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px 25px;
    border-bottom: 1px solid #eee;
    font-size: 15px;
    line-height: 20px;
    cursor: pointer;
    user-select: none;

    .svg-icon {
      margin-right: 5px;
    }
  }

  .note-list {
    width: 100%;

    & > li {
      width: 100%;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      user-select: none;

      &.active {
        background: #eee;

        .note-info-wrapper {
          border-left-color: var(--base-primary-color);

          .handle-btn {
            display: inline;
          }
        }
      }

      .note-info-wrapper {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 5px 20px;
        border-left: 5px solid transparent;

        .note-info {
          width: calc(100% - 20px);

          .title {
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-weight: 500;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .other-info {
            display: flex;
            align-items: center;
            width: 100%;
            line-height: 20px;
            font-size: 12px;

            .publish-status {
              margin-right: 8px;
              color: #ccc;
            }

            .create-time {
              color: #696969;
            }
          }
        }

        .handle-btn {
          display: none;
          width: 20px;
          font-size: 14px;
          color: #aaa;
          text-align: center;
          line-height: 15px;
        }
      }
    }
  }
}
</style>
