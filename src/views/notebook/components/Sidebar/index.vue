<template>
  <div class="sidebar-wrapper">
    <header>知行笔记</header>
    <div class="main-wrapper" v-loading="listLoading">
      <div class="add-btn" @click="handleAddOrEditCategory(null)">
        <svg-icon name="plus"></svg-icon>
        <span>新建分类</span>
      </div>
      <el-scrollbar style="height: calc(100% - 50px)">
        <ul class="category-list">
          <li
            v-for="(item, index) in categoryList"
            :key="item.category_id"
            :class="[activeId === item.category_id ? 'active' : '']"
            @click="handleItemClick(item.category_id, index)"
            :title="item.category_name"
          >
            <span class="title">{{ item.category_name }}</span>
            <el-dropdown trigger="click">
              <span class="handle-btn"><svg-icon name="setting"></svg-icon></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleAddOrEditCategory(item)">
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
    <footer v-if="userInfo?.username">
      <el-dropdown trigger="click">
        <div>
          <div className="icon">{{ userInfo.username?.substring(0, 1).toUpperCase() }}</div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleClearSpace">
              <svg-icon name="clear" style="margin-right: 10px"></svg-icon>
              <span>清理空间</span>
            </el-dropdown-item>
            <el-dropdown-item @click="router.push({ name: 'NoteRecycleBin' })">
              <svg-icon name="recycle-bin" style="margin-right: 10px"></svg-icon>
              <span>回收站</span>
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
    <ResetPwdForm ref="resetPwdForm" @logout="handleLogoutImmediately"></ResetPwdForm>
    <ClearSpaceForm ref="clearSpaceForm"></ClearSpaceForm>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { removeToken } from '@/utils/auth'
import { getCategoryList, deleteCategory } from '@/api/notebook/category'
import { logout } from '@/api/permission'
import CategoryForm from './components/CategoryForm.vue'
import ResetPwdForm from './components/ResetPwdForm.vue'
import ClearSpaceForm from './components/ClearSpaceForm.vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { useNoteStore } from '@/stores/note'
import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'SidebarComponent',
})

const noteStore = useNoteStore()
const userStore = useUserStore()
const userInfo = userStore.userInfo

const router = useRouter()
const route = useRoute()

const listLoading = ref(false)
const categoryList = ref([])

const categoryId = Number(route.params.categoryId) || undefined
let activeIndex = -1
const activeId = ref(categoryId)

watch(activeId, (val) => {
  if (val) {
    router.replace(`/category/${val}`)
  } else {
    router.replace('/')
  }
})

handleGetCategoryList().then(() => {
  if (activeId.value) {
    activeIndex = categoryList.value.findIndex((item) => item.category_id === activeId.value)
  } else {
    toFirstCategory()
  }
})

function handleGetCategoryList() {
  if (noteStore.categoryList) {
    categoryList.value = noteStore.categoryList
    return Promise.resolve()
  }

  listLoading.value = true
  return getCategoryList()
    .then((res) => {
      categoryList.value = res.data.category_list
      noteStore.categoryList = categoryList.value
    })
    .finally(() => {
      listLoading.value = false
    })
}

function toFirstCategory() {
  activeId.value = categoryList.value[0]?.category_id
  activeIndex = activeId.value ? 0 : -1
}

function handleItemClick(id, index) {
  activeIndex = index
  activeId.value = id
}

const categoryForm = ref(null)
function handleAddOrEditCategory(item) {
  categoryForm.value.open(item)
}

function handleRefreshCategoryList(val) {
  if (val.category_id) {
    categoryList.value.unshift(val)
    activeIndex = 0
    activeId.value = val.category_id
  } else {
    categoryList.value[activeIndex].category_name = val.category_name
  }
}

function handleDeleteCategory(category_id) {
  ElMessageBox.confirm('确认删除分类及分类下所有笔记？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    closeOnHashChange: false,
    draggable: true,
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.cancelButtonClass = 'is-disabled'
        instance.confirmButtonLoading = true
        deleteCategory({ category_id })
          .then(() => {
            categoryList.value.splice(activeIndex, 1)
            noteStore.categoryNoteMap.delete(category_id)
            toFirstCategory()
            done()
          })
          .finally(() => {
            instance.cancelButtonClass = ''
            instance.confirmButtonLoading = false
          })
      } else {
        if (instance.confirmButtonLoading === true) return
        done()
      }
    },
  }).then(() => {
    ElMessage({
      message: '删除成功',
      type: 'success',
    })
  })
}

const clearSpaceForm = ref()
function handleClearSpace() {
  clearSpaceForm.value.open()
}

const resetPwdForm = ref()
function handleChangePassword() {
  resetPwdForm.value.open()
}

function handleLogoutImmediately() {
  const logoutLoading = ElLoading.service({
    lock: true,
    text: '退出登录中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  logout()
    .then(() => {
      removeToken()
      router.push('/login')
    })
    .finally(() => {
      logoutLoading.close()
    })
}

function handleLogout() {
  ElMessageBox.confirm('确认退出登录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    'show-close': false,
    'close-on-click-modal': false,
    type: 'warning',
  }).then(() => {
    handleLogoutImmediately()
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

  .main-wrapper {
    width: 100%;
    /* header: 70px; footer: 50px */
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
