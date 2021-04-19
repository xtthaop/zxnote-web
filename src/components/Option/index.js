import React from 'react'
import {
  OptionItemWrapper,
} from './style'

class Option extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      showOption: false
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(val, label){
    this.props.change(val, label)
  }

  render(){
    return (
      <OptionItemWrapper 
        active={this.props.value === this.props.activeValue} 
        onClick={() => this.handleClick(this.props.value, this.props.children)}
      >
        { this.props.children }
      </OptionItemWrapper>
    )
  }
}

export default Option
