import React from 'react'
import { connect } from 'react-redux'
import { actions } from '@/store/modules/user'
import { Route, Redirect } from 'react-router-dom'
import { getToken } from '@/utils/auth'

class PrivateRoute extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    const token = getToken()
    const { children, auth, handleGetUserInfo, ...rest } = this.props

    return(
      <Route
        { ...rest }
        render={({ location }) => {
          if(token){
            if(auth){
              return children
            }else{
              // try{
                handleGetUserInfo()

                return (
                  <Redirect to={{  pathname: "/login", state: { from: location }}}></Redirect>
                )
              // }catch{
  
              // }
            }
          }else{
            return (
              <Redirect to={{  pathname: "/login", state: { from: location }}}></Redirect>
            )
          }
        }}
      ></Route>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.getIn(['userReducer', 'username']) ? true : false,
})

const mapDispatchToProps = (dispatch) => ({
  handleGetUserInfo(){
    dispatch(actions.handleChangeAuthStatus())
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(PrivateRoute)
