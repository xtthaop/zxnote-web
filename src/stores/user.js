import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/permission'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
  }),
  actions: {
    handleGetUserInfo() {
      return getUserInfo().then((res) => {
        this.userInfo = res.data
      })
    },
  },
})
