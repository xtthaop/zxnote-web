import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import {
  ButtonWrapper,
} from './style'

class Button extends React.Component {
  render(){
    return (
      <ButtonWrapper {...this.props} disabled={this.props['data-loading']}>
        <span className="loading"><SvgIcon iconClass="loading"></SvgIcon></span>
        {this.props.children}
      </ButtonWrapper>
    )
  }
}

export default Button
