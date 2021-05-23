import { fromJS } from 'immutable'

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
  changeAuthStatus: (payload) => ({
    type: types.CHANGE_AUTH_STATUS,
    payload,
  }),
}
