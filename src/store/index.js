import { createStore, applyMiddleware } from 'redux'
import { combineReducers } from 'redux-immutable'
import promiseMiddleware from 'redux-promise'
import { reducer as userReducer } from './modules/user'

const reducer = combineReducers({
  userReducer,
})

const store = createStore(
  reducer,
  applyMiddleware(promiseMiddleware)
)

export default store
