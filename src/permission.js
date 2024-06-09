import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import { removeToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async (to) => {
  NProgress.start()

  const userStore = useUserStore()
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      return '/'
    } else {
      if (userStore.userInfo) {
        return true
      } else {
        try {
          await userStore.handleGetUserInfo()
          return to.fullPath
        } catch (error) {
          // eslint-disable-next-line
          console.log(error || 'error')
          removeToken()
          return '/login'
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      return true
    } else {
      return `/login`
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
