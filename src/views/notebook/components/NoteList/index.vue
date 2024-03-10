<template>
  <div class="note-list-wrapper" v-if="categoryId" v-loading="listLoading">
    <div class="add-btn">
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
                  {{ dayjs(item.create_time).format('YYYY-MM-DD') }}
                </span>
              </div>
            </div>

            <span class="handle-btn"><svg-icon name="setting"></svg-icon></span>
          </div>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dayjs } from 'element-plus'
import { getCategoryNote } from '@/api/notebook/note'

defineOptions({
  name: 'NoteListComponent',
})

const route = useRoute()
const router = useRouter()

const categoryId = ref()
const noteList = ref([])

watch(
  () => route.params.categoryId,
  (val) => {
    categoryId.value = Number(val)
    if (categoryId.value) {
      nextTick(() => {
        handleGetCategoryNote()
      })
    } else {
      noteList.value = []
    }
  },
  {
    immediate: true,
  }
)

const listLoading = ref(false)
const activeId = ref()
let activeIndex = 0

function handleGetCategoryNote() {
  listLoading.value = true
  getCategoryNote({ category_id: categoryId.value })
    .then((res) => {
      noteList.value = res.data.category_note_list

      let noteId = Number(route.params.noteId)
      if (noteId) {
        activeId.value = noteId
        activeIndex = noteList.value.findIndex((item) => item.note_id === activeId.value)
      } else {
        activeId.value = noteList.value[0]?.note_id
        activeIndex = 0
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}

function handleNoteItemClick(id, index) {
  activeId.value = id
  activeIndex = index
}

watch(activeId, (val) => {
  if (categoryId.value && val) {
    router.push(`/category/${categoryId.value}/note/${val}`)
  }
})

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
  noteList.value.length &&
    (activeIndex || activeIndex === 0) &&
    (noteList.value[activeIndex].note_title = title)
}

defineExpose({
  changeNoteTitle,
})
</script>

<style lang="scss" scope>
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
          text-align: right;
          line-height: 30px;
        }
      }
    }
  }
}
</style>
