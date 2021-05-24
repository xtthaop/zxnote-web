import { fromJS } from 'immutable'
import { getUserInfo } from '@/api/permission'

const defaultState = fromJS({
  username: '',
})

export const types = {
  CHANGE_AUTH_STATUS: 'user/change_auth_status',
}

export const reducer = (state = defaultState, action) => {
  switch(action.type){
    case types.CHANGE_AUTH_STATUS:
      state.merge(action.payload)
    default:
      return state
  }
}

export const actions = {
  handleChangeAuthStatus: () => new Promise((resolve, reject) => {
    getUserInfo().then(res => {
      resolve({
        type: types.CHANGE_AUTH_STATUS,
        payload: { username: res.data.username },
      })
    }).catch(error => {
      reject(error)
    })
  })
}
