import React from 'react'
import {
  MenuItemWrapper
} from './style'

class MenuItem extends React.Component {
  render(){
    return (
      <MenuItemWrapper className="menu-item">
        { this.props.children }
      </MenuItemWrapper>
    )
  }
}

export default MenuItem