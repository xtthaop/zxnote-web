<template>
  <div class="editor-wrapper" v-if="noteId" v-loading="noteLoading">
    <div class="title-wrapper">
      <div className="save-status">{{ savedStatus ? '已保存' : '保存中...' }}</div>
      <input
        ref="titleRef"
        v-model="note.note_title"
        className="custom-input"
        placeholder="请输入标题"
        @input="handleNoteChange"
      />
    </div>
    <ul class="tool-bar-wrapper">
      <li
        class="tool right publish"
        @mouseenter="publishCancel = true"
        @mouseleave="publishCancel = false"
      >
        <template v-if="savedStatus">
          <span v-if="published" @click="hanldePublish(0)">
            <span v-if="publishLoading">
              <span class="publish-text">取消中...</span>
            </span>
            <span v-else>
              <svg-icon :name="publishCancel ? 'error' : 'success'"></svg-icon>
              <span class="publish-text">{{ publishCancel ? '取消发布' : '已发布' }}</span>
            </span>
          </span>
          <span v-else @click="hanldePublish(1)">
            <span v-if="publishLoading">
              <span class="publish-text">发布中...</span>
            </span>
            <span v-else>
              <svg-icon :name="publishUpdate ? 'update' : 'publish'"></svg-icon>
              <span class="publish-text">{{ publishUpdate ? '发布更新' : '发布笔记' }}</span>
            </span>
          </span>
        </template>
        <template v-else>
          <span class="publish-text">保存中...</span>
        </template>
      </li>
      <li class="tool">
        <svg-icon name="pic"></svg-icon>
      </li>
      <li class="tool right">
        <svg-icon name="save"></svg-icon>
      </li>
      <li class="tool right">
        <svg-icon name="square-split"></svg-icon>
      </li>
    </ul>
    <textarea
      class="content-wrapper"
      placeholder="请输入内容"
      v-model="note.note_content"
      @input="handleNoteChange"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getNoteContent, publishNote, saveNote } from '@/api/notebook/note'

defineOptions({
  name: 'EditorComponent',
})

const route = useRoute()

const noteId = ref()
const noteLoading = ref(false)
const savedStatus = ref(true)
const publishLoading = ref(false)
const note = ref({})

watch(
  () => route.params.noteId,
  (val) => {
    noteId.value = Number(val)
    savedStatus.value = true
    publishLoading.value = false
    if (noteId.value) {
      handleGetNoteContent()
    }
  },
  {
    immediate: true,
  }
)

function handleGetNoteContent() {
  noteLoading.value = true
  return getNoteContent({ note_id: noteId.value })
    .then((res) => {
      note.value = res.data
    })
    .catch(() => {
      noteId.value = undefined
      note.value = {}
    })
    .finally(() => {
      noteLoading.value = false
    })
}

const publishCancel = ref(false)
const publishUpdate = computed(() => {
  return note.value.publish_status && !note.value.publish_update_status
})
const published = computed(() => {
  return note.value.publish_status && note.value.publish_update_status
})

let timeoutId
function handleNoteChange() {
  clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    handleSaveNote()
  }, 1000)
}

const emits = defineEmits(['sync-title', 'sync-publish-status', 'sync-publish-update-status'])
function handleSaveNote() {
  savedStatus.value = false
  saveNote(note.value).then(() => {
    emits('sync-title', note.value.note_title)
    note.value.publish_update_status = 0
    emits('sync-publish-update-status', 0)
    savedStatus.value = true
  })
}

function hanldePublish(status) {
  if (publishLoading.value) return

  const data = {
    note_id: note.value.note_id,
    publish_status: status,
  }

  publishLoading.value = true
  publishNote(data).then(() => {
    note.value.publish_status = status
    note.value.publish_update_status = status
    publishLoading.value = false
    emits('sync-publish-status', status)
    emits('sync-publish-update-status', status)
  })
}
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

  .content-wrapper {
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
