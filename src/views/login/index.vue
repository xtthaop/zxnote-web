<template>
  <div class="login-container">
    <div class="login-card">
      <el-form :model="loginForm" ref="loginFormRef" :rules="rules" :show-message="false">
        <div class="login-card-title">
          <img class="logo" src="@/assets/images/logo.png" />
          <h1 class="title">知行笔记</h1>
        </div>

        <el-form-item prop="username">
          <el-input
            ref="usernameRef"
            tabindex="1"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            maxlength="50"
            prefix-icon="el-icon-user"
            clearable
          ></el-input>
        </el-form-item>

        <el-tooltip :visible="capsTootip" content="已开启大写锁定" placement="top">
          <el-form-item prop="password">
            <el-input
              tabindex="2"
              v-model="loginForm.password"
              placeholder="请输入密码"
              maxlength="20"
              show-password
              prefix-icon="el-icon-lock"
              clearable
              @keyup="checkCapslock"
              @blur="capsTootip = false"
              @keyup.enter="handleLogin"
            ></el-input>
          </el-form-item>
        </el-tooltip>

        <el-popover placement="top" width="350" :visible="captchaVisible">
          <SliderCaptcha
            ref="captchaRef"
            @verify="verify"
            v-model:captchaVisible="captchaVisible"
          ></SliderCaptcha>
          <template #reference>
            <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
          </template>
        </el-popover>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SliderCaptcha from './components/SliderCaptcha.vue'
import { md5Password } from '@/utils/index'
import { setToken } from '@/utils/auth'
import { login } from '@/api/permission'

defineOptions({
  name: 'LoginPage',
})

const rules = ref({
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
})
const loginForm = ref({
  username: '',
  password: '',
})
const usernameRef = ref(null)

onMounted(() => {
  usernameRef.value.focus()
})

const loginFormRef = ref(null)
const captchaVisible = ref(false)

function handleLogin() {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      captchaVisible.value = true
    } else {
      return false
    }
  })
}

const captchaRef = ref(null)
const router = useRouter()

function verify(x) {
  const username = loginForm.value.username
  const password = loginForm.value.password

  const data = {
    username,
    password: md5Password(password),
    x,
  }

  login(data)
    .then((res) => {
      captchaRef.value.handleVerifySuccess()
      setToken(res.data.token)
      setTimeout(() => {
        router.push('/')
      }, 300)
    })
    .catch((error) => {
      if (error.code === 4010) {
        // 用户名密码不匹配
        captchaVisible.value = false
        captchaRef.value.handleVerifyFail(true)
      } else {
        captchaRef.value.handleVerifyFail()
      }
    })
}

const capsTootip = ref(false)

function checkCapslock(e) {
  const { key } = e
  capsTootip.value = key && key.length === 1 && key >= 'A' && key <= 'Z'
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 100%;
  background-color: #ebeff5;
  overflow: hidden;

  .login-card {
    position: relative;
    width: 380px;
    margin: 130px auto 0;
    padding: 100px 50px 80px;
    background: #fff;
    border: 1px solid #c7cbd3;
    border-radius: 5px;

    .login-card-title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 50px;

      .logo {
        width: 39px;
        height: 39px;
        margin-right: 12px;
      }

      .title {
        display: inline-block;
        margin: 0;
        font-weight: 600;
        line-height: 50px;
        font-size: 22px;
        font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      }
    }
  }
}
</style>
