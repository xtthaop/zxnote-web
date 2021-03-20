import React from 'react'
import {
  MenuItemWrapper
} from './style'

class MenuItem extends React.Component {
  render(){
    return (
      <MenuItemWrapper>
        { this.props.children }
      </MenuItemWrapper>
    )
  }
}

export default MenuItem