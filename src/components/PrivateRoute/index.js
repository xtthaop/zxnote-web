import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { getToken } from '@/utils/auth'

function PrivateRoute({ children, ...rest }){
  const token = getToken()

  return(
    <Route
      { ...rest }
      render={({ location }) => 
        token ? (
          children
        ) : (
          <Redirect 
            to={{ 
              pathname: "/login", 
              state: { from: location }
            }}
          />
        )
      }
    />
  )
}

export default PrivateRoute
