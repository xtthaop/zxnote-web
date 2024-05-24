<template>
  <div class="recycle-bin-wrapper">
    <header>
      <div class="nav-wrapper">
        <div class="title">
          <span>回收站</span>
        </div>
        <nav>
          <router-link :to="{ name: 'NoteRecycleBin', replace: true }"> 笔记 </router-link>
          <router-link :to="{ name: 'ImgRecycleBin', replace: true }">图片</router-link>
        </nav>
      </div>
      <el-icon class="close-btn" @click="router.go(-1)"><Close /></el-icon>
    </header>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineOptions({
  name: 'RecycleBin',
})

const router = useRouter()
</script>

<style lang="scss" scoped>
.recycle-bin-wrapper {
  width: 100%;
  height: 100%;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 50px;
    background: #555;
    color: #fff;

    .nav-wrapper {
      display: flex;
      align-items: center;
    }

    .title {
      width: 230px;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 3px;
      text-align: center;
    }

    nav {
      a {
        font-size: 14px;
        color: #fff;
        text-decoration: none;
        margin: 0 20px;

        &.router-link-active {
          font-weight: 500;
          color: var(--base-primary-color);
        }
      }
    }

    .close-btn {
      margin-right: 20px;
      font-size: 20px;
      cursor: pointer;
    }
  }
}
</style>
