import React from 'react'
import {
  SwitchWrapper,
} from './style'

class Switch extends React.Component {
  constructor(props){
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e){
    const checked = e.target.checked
    this.props.onChange(checked)
  }

  render(){
    const { checked } = this.props

    return (
      <SwitchWrapper checked={checked}>
        <input 
          id="switch-input" 
          className="switch-input" 
          type="checkbox" 
          checked={checked} 
          onChange={this.handleChange}
        />
        <label htmlFor="switch-input">
          <span className="switch-btn"></span>
        </label>
      </SwitchWrapper>
    )
  }
}

export default Switch
