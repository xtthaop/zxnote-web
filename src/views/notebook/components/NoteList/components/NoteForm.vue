<template>
  <el-dialog
    title="选择笔记分类"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :draggable="true"
    :show-close="false"
    width="390px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :show-message="false"
      v-loading="formLoading"
      :disabled="loading"
    >
      <el-form-item label="" prop="category_id">
        <el-select v-model="form.category_id" placeholder="请选择分类">
          <el-option
            v-for="item in categoryList"
            :key="item.category_id"
            :label="item.category_name"
            :value="item.category_id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="cancel" :disabled="loading || formLoading">取 消</el-button>
      <el-button type="primary" :loading="loading" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getCategoryList } from '@/api/notebook/category'
import { moveNote } from '@/api/notebook/note'
import { useNoteStore } from '@/stores/note'

defineOptions({
  name: 'NoteForm',
})

const store = useNoteStore()

const emits = defineEmits(['refresh'])

const formRef = ref(null)
const dialogVisible = ref(false)

const form = reactive({})
const rules = ref({
  category_id: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
})
const formLoading = ref(false)
const categoryList = ref([])

function open(item) {
  dialogVisible.value = true
  handleGetCategoryList().then(() => {
    Object.assign(form, item)
  })
}

function handleGetCategoryList() {
  if (store.categoryList) {
    categoryList.value = store.categoryList
    return Promise.resolve()
  }

  formLoading.value = true
  getCategoryList()
    .then((res) => {
      categoryList.value = res.data.category_list
    })
    .finally(() => {
      formLoading.value = false
    })
}

const loading = ref(false)

async function submitForm() {
  const valid = await formRef.value.validate().catch(() => {})
  if (!valid) return

  loading.value = true
  try {
    await moveNote(form)
    emits('refresh', { ...form })
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
