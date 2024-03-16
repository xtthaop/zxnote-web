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
                  :style="{ backgroundColor: handlePublishStatus(item) }"
                ></span>
                <span class="create-time">
                  {{ dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss') }}
                </span>
              </div>
            </div>

            <el-dropdown trigger="click">
              <span class="handle-btn"><svg-icon name="setting"></svg-icon></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleMoveNote(item.note_id)">
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
import { getCategoryNote, addNote, deleteNote } from '@/api/notebook/note'
import { ElMessage, ElMessageBox } from 'element-plus'
import NoteForm from './components/NoteForm.vue'

defineOptions({
  name: 'NoteListComponent',
})

const route = useRoute()
const router = useRouter()

const categoryId = ref()
const noteList = ref([])
const listLoading = ref(false)
let activeIndex = 0
let noteId = Number(route.params.noteId)
const activeId = ref(noteId)

watch(
  () => route.params.categoryId,
  (val) => {
    categoryId.value = Number(val)
    if (categoryId.value) {
      noteId = Number(route.params.noteId)
      handleGetCategoryNote().then(() => {
        if (noteId) {
          activeId.value = noteId
          activeIndex = noteList.value.findIndex((item) => item.note_id === noteId)
        } else {
          activeId.value = noteList.value[0]?.note_id
          activeIndex = 0
        }
      })
    } else {
      noteList.value = []
    }
  },
  {
    immediate: true,
  }
)

function handleGetCategoryNote() {
  listLoading.value = true
  return getCategoryNote({ category_id: categoryId.value })
    .then((res) => {
      noteList.value = res.data.category_note_list
    })
    .catch(() => {
      categoryId.value = undefined
      noteList.value = []
    })
    .finally(() => {
      listLoading.value = false
    })
}

watch(activeId, (val) => {
  if (categoryId.value && val) {
    router.push(`/category/${categoryId.value}/note/${val}`)
  }
})

function handleNoteItemClick(id, index) {
  activeId.value = id
  activeIndex = index
}

function handleAddNote() {
  listLoading.value = true
  addNote({ category_id: categoryId.value })
    .then((res) => {
      handleGetCategoryNote().then(() => {
        activeId.value = res.data.note_id
        activeIndex = 0
      })
    })
    .catch(() => {
      listLoading.value = false
    })
}

function handleDeleteNote(id) {
  ElMessageBox.confirm('确认删除笔记？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    'show-close': false,
    'close-on-click-modal': false,
    type: 'error',
  }).then(() => {
    listLoading.value = true
    deleteNote({ note_id: id })
      .then(() => {
        handleGetCategoryNote().then(() => {
          activeId.value = noteList.value[0]?.note_id
          activeIndex = 0
        })
        ElMessage({
          message: '删除成功',
          type: 'success',
        })
      })
      .catch(() => {
        listLoading.value = false
      })
  })
}

const noteFormRef = ref()
function handleMoveNote(noteId) {
  const data = {
    note_id: noteId,
    category_id: categoryId.value,
  }
  noteFormRef.value.open(data)
}

function handleMoveNoteRefresh(newCategoryId) {
  if (newCategoryId !== categoryId.value) {
    handleGetCategoryNote().then(() => {
      activeId.value = noteList.value[0]?.note_id
      activeIndex = 0
    })
  }
}

function handlePublishStatus(item) {
  if (item.publish_status && item.publish_update_status) {
    return 'var(--base-primary-color)'
  }

  if (item.publish_status && !item.publish_update_status) {
    return '#E6A23C'
  }

  if (!item.publish_status && !item.publish_update_status) {
    return '#ccc'
  }
}

function changeNoteTitle(title) {
  if (noteList.value.length && noteList.value[activeIndex]) {
    noteList.value[activeIndex].note_title = title
  }
}

function changeNotePublishStatus(status) {
  if (noteList.value.length && noteList.value[activeIndex]) {
    noteList.value[activeIndex].publish_status = status
  }
}

function changeNotePublishUpdateStatus(status) {
  if (noteList.value.length && noteList.value[activeIndex]) {
    noteList.value[activeIndex].publish_update_status = status
  }
}

defineExpose({
  changeNoteTitle,
  changeNotePublishStatus,
  changeNotePublishUpdateStatus,
})
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
              display: inline-block;
              width: 8px;
              height: 8px;
              margin-right: 8px;
              background-color: #ccc;
              border-radius: 50%;
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
