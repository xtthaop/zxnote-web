<template>
  <el-dialog
    title="修改密码"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :draggable="true"
    :show-close="false"
    width="390px"
  >
    <el-form
      ref="resetPwdFormRef"
      :model="form"
      :rules="rules"
      :disabled="loading"
      label-width="80px"
      @submit.prevent
    >
      <el-form-item label="旧密码" prop="old_password">
        <el-input
          v-model="form.old_password"
          show-password
          placeholder="请输入旧密码"
          maxlength="20"
          type="password"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="new_password">
        <el-input
          v-model="form.new_password"
          show-password
          placeholder="请输入新密码"
          type="password"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm_password">
        <el-input
          v-model="form.confirm_password"
          show-password
          placeholder="请确认密码"
          type="password"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="cancel" :disabled="loading">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { md5Password } from '@/utils/index'
import { changePassword } from '@/api/permission'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'ResetPwdForm',
})

const emits = defineEmits(['logout'])

const dialogVisible = ref(false)
const loading = ref(false)
const form = reactive({})
const resetPwdFormRef = ref()

const equalToNewPassword = (rule, value, callback) => {
  if (form.new_password !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = ref({
  old_password: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  new_password: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度需在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToNewPassword, trigger: 'blur' },
  ],
})

async function submitForm() {
  const valid = await resetPwdFormRef.value.validate().catch(() => {})
  if (!valid) return

  loading.value = true

  const data = {}
  for (let key in form) {
    data[key] = md5Password(form[key])
  }

  changePassword(data)
    .then(() => {
      ElMessage({
        message: '密码修改成功！请重新登录！',
        type: 'success',
      })
      emits('logout')
      dialogVisible.value = false
    })
    .finally(() => {
      loading.value = false
    })
}

function cancel() {
  dialogVisible.value = false
}

function reset() {
  resetPwdFormRef.value?.resetFields()
}

function open() {
  reset()
  dialogVisible.value = true
}

defineExpose({
  open,
})
</script>
