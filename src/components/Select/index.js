import React from 'react'
import Input from '@/components/Input'
import SvgIcon from '@/components/SvgIcon'
import Option from '@/components/Option'
import {
  SelectWrapper,
  OptionWrapper,
} from './style'

class Select extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      value: '',
      label: '',
      showOption: false
    }
    this.handleInputClick = this.handleInputClick.bind(this)
    this.handleHide = this.handleHide.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleOptionChange = this.handleOptionChange.bind(this)
  }

  handleInputClick(e){
    e.stopPropagation()
    this.setState({
      showOption: this.state.showOption ? false : true
    })
  }

  handleHide(){
    this.setState({
      showOption: false
    })
  }

  handleOptionChange(val, label){
    this.props.change(val)
    this.setState({
      label,
      value: val
    })
  }

  handleValueChange(val){
    console.log(val)
  }

  componentDidMount(){
    window.addEventListener('click', this.handleHide)
  }

  componentWillUnmount(){
    window.removeEventListener('click', this.handleHide)
  }

  render(){
    const { showOption, label, value } = this.state
    return (
      <SelectWrapper onClick={(e) => this.handleInputClick(e)}>
        <Input 
          value={label} 
          placeholder={this.props.placeholder}
          disabled 
        ></Input>
        <SvgIcon iconClass="arrow-down" className="arrow-down"></SvgIcon>
        <OptionWrapper show={showOption}>
          {
            this.props.children ? 
            React.Children.map(this.props.children, child => {
              return React.cloneElement(child, { change: this.handleOptionChange, activeValue: value })
            })
            : <div className="no-data">暂无数据</div>
          }
        </OptionWrapper>
      </SelectWrapper>
    )
  }
}

Select.Option = Option

export default Select
