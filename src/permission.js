import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach(async (to) => {
  NProgress.start()

  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      return { path: '/' }
    } else {
      return true
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
