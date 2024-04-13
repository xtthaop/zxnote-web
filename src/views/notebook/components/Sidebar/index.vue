<template>
  <div class="sidebar-wrapper">
    <header>知行笔记</header>
    <div class="handler-wrapper" v-loading="listLoading">
      <div class="add-btn" @click="handleAddCategory">
        <svg-icon name="plus"></svg-icon>
        <span>新建分类</span>
      </div>
      <el-scrollbar style="height: calc(100% - 50px)">
        <ul class="category-list">
          <li
            v-for="item in categoryList"
            :key="item.category_id"
            :class="[activeId === item.category_id ? 'active' : '']"
            @click="handleItemClick(item.category_id)"
          >
            <span class="title">{{ item.category_name }}</span>
            <el-dropdown trigger="click">
              <span class="handle-btn"><svg-icon name="setting"></svg-icon></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEditCategory(item)">
                    <svg-icon name="rename" style="margin-right: 10px"></svg-icon>
                    <span>重命名</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDeleteCategory(item.category_id)">
                    <svg-icon name="delete" style="margin-right: 10px"></svg-icon>
                    <span>删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
        </ul>
      </el-scrollbar>
    </div>
    <footer v-if="userInfo.username">
      <el-dropdown trigger="click">
        <div>
          <div className="icon">{{ userInfo.username?.substring(0, 1).toUpperCase() }}</div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <svg-icon name="promotion" style="margin-right: 10px"></svg-icon>
              <span>推广配置</span>
            </el-dropdown-item>
            <el-dropdown-item @click="handleClearCache">
              <svg-icon name="clear" style="margin-right: 10px"></svg-icon>
              <span>清除缓存</span>
            </el-dropdown-item>
            <el-dropdown-item @click="handleChangePassword">
              <svg-icon name="change-password" style="margin-right: 10px"></svg-icon>
              <span>修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item @click="handleLogout">
              <svg-icon name="log-out" style="margin-right: 10px"></svg-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span className="username">{{ userInfo.username }}</span>
    </footer>

    <CategoryForm ref="categoryForm" @refresh="handleRefreshCategoryList"></CategoryForm>
    <ResetPwdForm ref="resetPwdForm" @logout="handleLogout"></ResetPwdForm>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { removeToken } from '@/utils/auth'
import { getCategoryList, deleteCategory } from '@/api/notebook/category'
import { clearCache } from '@/api/notebook/note'
import { getUserInfo, logout } from '@/api/permission'
import CategoryForm from './components/CategoryForm.vue'
import ResetPwdForm from './components/ResetPwdForm.vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { filesize } from 'filesize'

defineOptions({
  name: 'SidebarComponent',
})

const router = useRouter()
const route = useRoute()

const listLoading = ref(false)
const categoryList = ref([])
const categoryId = Number(route.params.categoryId)
const activeId = ref(categoryId)

handleGetCategoryList().then(() => {
  if (!categoryId) {
    activeId.value = categoryList.value[0]?.category_id
  }
})

function handleGetCategoryList() {
  listLoading.value = true
  return getCategoryList()
    .then((res) => {
      categoryList.value = res.data.category_list
    })
    .finally(() => {
      listLoading.value = false
    })
}

watch(activeId, (val) => {
  if (val) {
    router.push(`/category/${val}`)
  } else {
    router.push('/')
  }
})

function handleItemClick(id) {
  activeId.value = id
}

const categoryForm = ref(null)
function handleAddCategory() {
  categoryForm.value.open()
}
function handleEditCategory(item) {
  categoryForm.value.open(item)
}

function handleRefreshCategoryList(id) {
  handleGetCategoryList().then(() => {
    if (id) {
      activeId.value = id
    }
  })
}

function handleDeleteCategory(category_id) {
  ElMessageBox.confirm('确认删除分类及分类下所有笔记？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    'show-close': false,
    'close-on-click-modal': false,
    type: 'warning',
  }).then(() => {
    listLoading.value = true
    deleteCategory({ category_id })
      .then(() => {
        handleGetCategoryList().then(() => {
          activeId.value = categoryList.value[0]?.category_id
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

handleGetUserInfo()

const userInfo = reactive({})
function handleGetUserInfo() {
  getUserInfo().then((res) => {
    userInfo.user_id = res.data.user_id
    userInfo.username = res.data.username
  })
}

function handleClearCache() {
  ElMessageBox.confirm('确认清除已不在笔记中引用的文件缓存', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    'show-close': false,
    'close-on-click-modal': false,
    type: 'warning',
  }).then(() => {
    const clearLoading = ElLoading.service({
      lock: true,
      text: '清除缓存中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    clearCache()
      .then((res) => {
        const size = filesize(res.data.deleted_imgs_size)
        const num = res.data.deleted_imgs_num
        ElMessage({
          message: `已清除占用了 ${size} 的 ${num} 个文件`,
          type: 'success',
        })
      })
      .finally(() => {
        clearLoading.close()
      })
  })
}

const resetPwdForm = ref()
function handleChangePassword() {
  resetPwdForm.value.open()
}

function handleLogout() {
  ElMessageBox.confirm('确认退出登录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    'show-close': false,
    'close-on-click-modal': false,
    type: 'warning',
  }).then(() => {
    logout().then(() => {
      removeToken()
      router.push('/login')
    })
  })
}
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
  position: relative;
  width: 15%;
  height: 100%;
  background: #555;
  overflow: hidden;

  header {
    width: 100%;
    line-height: 30px;
    padding: 20px 0;
    font-size: 20px;
    color: var(--base-primary-color);
    letter-spacing: 2px;
    text-align: center;
  }

  .handler-wrapper {
    width: 100%;
    // header: 70px footer: 50px
    height: calc(100% - 70px - 50px);

    :deep(.el-loading-mask) {
      background-color: rgba(85, 85, 85, 0.8) !important;
    }
  }

  .add-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px 20px;
    color: #fff;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;

    .svg-icon {
      margin-right: 5px;
    }
  }

  .category-list {
    width: 100%;
    min-height: 100px;
    color: #fff;

    & > li {
      display: flex;
      align-items: center;
      height: 40px;
      line-height: 30px;
      padding: 5px 10px 5px 20px;
      border-left: 3px solid transparent;
      user-select: none;
      cursor: pointer;

      &.active {
        background: #666;
        border-left-color: var(--base-primary-color);

        .handle-btn {
          display: inline;
        }
      }

      .title {
        display: inline-block;
        width: calc(100% - 24px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .handle-btn {
        display: none;
        width: 24px;
        font-size: 14px;
        color: #fff;
        text-align: center;
      }
    }
  }

  footer {
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    padding: 10px 10px;
    color: #999;

    .icon {
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background: #666;
      border-radius: 50%;
      font-weight: 500;
      font-size: 16px;
      color: #999;
      cursor: pointer;
    }

    .username {
      width: calc(100% - 30px);
      margin-left: 10px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      user-select: none;
    }
  }
}
</style>
