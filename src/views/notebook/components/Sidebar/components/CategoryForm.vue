<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :draggable="true"
    :show-close="false"
    width="390px"
  >
    <el-form ref="formRef" :model="form" :rules="rules" :show-message="false">
      <el-form-item label="" prop="category_name">
        <el-input
          v-model="form.category_name"
          :disabled="loading"
          placeholder="请输入分类名称"
          maxlength="40"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="cancel" :disabled="loading">取 消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { addCategory, updateCategory } from '@/api/notebook/category'

defineOptions({
  name: 'CategoryForm',
})

const emits = defineEmits(['refresh'])

const formRef = ref(null)
const dialogVisible = ref(false)
const loading = ref(false)
const title = ref('')
const form = reactive({})
const rules = ref({
  category_name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
})

function open(item) {
  dialogVisible.value = true
  reset()
  if (!item) {
    title.value = '新建分类'
  } else {
    title.value = '重命名'
    nextTick(() => {
      Object.assign(form, item)
    })
  }
}

function reset() {
  formRef.value?.resetFields()
  form.category_id = undefined
}

async function submitForm() {
  const valid = await formRef.value.validate().catch(() => {})
  if (!valid) return

  loading.value = true
  try {
    if (form.category_id) {
      await updateCategory(form)
      emits('refresh', { category_name: form.category_name })
    } else {
      const { data } = await addCategory(form)
      emits('refresh', {
        category_id: data?.category_id,
        category_name: form.category_name,
      })
    }

    dialogVisible.value = false
  } finally {
    loading.value = false
  }
}

function cancel() {
  dialogVisible.value = false
}

defineExpose({
  open,
})
</script>
