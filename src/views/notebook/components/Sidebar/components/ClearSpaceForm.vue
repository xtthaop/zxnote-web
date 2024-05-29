<template>
  <el-dialog
    title="清理空间"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :draggable="true"
    :show-close="false"
    width="500px"
  >
    <el-checkbox-group v-model="checkList">
      <el-checkbox value="history">
        <span style="display: flex; align-items: center">
          <span style="color: red">彻底删除</span>
          <el-select
            v-model="time"
            size="small"
            style="width: 80px; margin: 0 10px"
            @click="(e) => e.preventDefault()"
          >
            <el-option
              v-for="item in timeOpts"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span>的笔记历史版本</span>
        </span>
      </el-checkbox>
      <el-checkbox value="img">
        <span>
          <span>将已不在笔记或笔记历史版本中引用的图片</span>
          <span style="color: #e6a23c">放到回收站</span>
        </span>
      </el-checkbox>
      <el-checkbox value="recycle">
        <span style="color: red">清空回收站</span>
      </el-checkbox>
    </el-checkbox-group>

    <template #footer>
      <el-button @click="cancel" :disabled="loading">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { clearSpace } from '@/api/notebook/note'
import { ElNotification } from 'element-plus'
import { filesize } from 'filesize'

defineOptions({
  name: 'ClearSpaceForm',
})

const dialogVisible = ref(false)

function open() {
  checkList.value = []
  time.value = 1
  dialogVisible.value = true
}

const checkList = ref([])
const timeOpts = [
  {
    label: '7天前',
    value: 1,
  },
  {
    label: '30天前',
    value: 2,
  },
  {
    label: '全部',
    value: 3,
  },
]
const time = ref(1)
const loading = ref(false)

function submitForm() {
  if (!checkList.value.length) return

  const data = {
    checked: checkList.value,
    time: time.value,
  }

  loading.value = true
  clearSpace(data)
    .then((res) => {
      dialogVisible.value = false
      const {
        deleted_history_notes_num,
        soft_deleted_imgs_num,
        soft_deleted_imgs_size,
        deleted_notes_num,
        deleted_imgs_num,
        deleted_imgs_size,
      } = res.data

      ElNotification({
        type: 'success',
        duration: 0,
        title: '清理完成',
        dangerouslyUseHTMLString: true,
        message: `彻底删除了 ${deleted_history_notes_num} 条笔记历史版本；
        将 ${soft_deleted_imgs_num / 2}(${filesize(soft_deleted_imgs_size)}) 张图片放到了回收站；
        彻底删除了 ${deleted_notes_num} 条笔记和 ${deleted_imgs_num / 2}(${filesize(
          deleted_imgs_size
        )}) 张图片。`,
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function cancel() {
  dialogVisible.value = false
}

defineExpose({
  open,
})
</script>
