import React from 'react'
import {
  InputWrapper,
} from './style'

class Input extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      value: ''
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange(e){
    let value = e.target.value
    this.setState({
      value
    })
    this.props.onChange(value)
  }

  render(){
    return (
      <InputWrapper 
        {...this.props}
        type={this.props.type || 'text'} 
        value={this.state.value}
        onChange={this.onChange}
      >
      </InputWrapper>
    )
  }
}

export default Input
