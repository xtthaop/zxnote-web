import React from 'react'
import MenuItem from '@/components/MenuItem'
import {
  MenuWrapper
} from './style'

class Menu extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    return (
      <MenuWrapper>
        { this.props.children }
      </MenuWrapper>
    )
  }
}

Menu.Item = MenuItem

export default Menu