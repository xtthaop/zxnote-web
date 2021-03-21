import React from 'react'
import {
  ButtonWrapper,
} from './style'

class Button extends React.Component {
  render(){
    return (
      <ButtonWrapper {...this.props}>
        {this.props.children}
      </ButtonWrapper>
    )
  }
}

export default Button
