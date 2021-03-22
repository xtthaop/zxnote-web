import React from 'react'
import {
  InputWrapper,
} from './style'

class Input extends React.Component {
  constructor(props){
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  onChange(e){
    let value = e.target.value
    this.props.onChange(value)
  }

  render(){
    return (
      <InputWrapper 
        {...this.props}
        onChange={this.onChange}
      >
      </InputWrapper>
    )
  }
}

export default Input
