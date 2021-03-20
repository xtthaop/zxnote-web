import React from 'react'
import {
  DropdownWrapper,
  DropdownFrame,
} from './style'

class Dropdown extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      show: false,
    }
    this.handleToggle = this.handleToggle.bind(this)
    this.handleHide = this.handleHide.bind(this)
  }

  handleToggle(e){
    this.selector = e.target
    const show = this.state.show ? false : true
    this.setState({
      show
    })
  }

  handleHide(e){
    if(e.target !== this.selector && this.state.show){
      this.setState({
        show: false
      })
    }
  }

  render(){
    const { show } = this.state
    return (
      <DropdownWrapper>
        <div id="menu-item-handle" className="handle" onClick={this.handleToggle}>
          {this.props.children}
        </div>
        <DropdownFrame show={show}>
          {this.props.overlay}
        </DropdownFrame>
      </DropdownWrapper>
    )
  }

  componentDidMount(){
    window.addEventListener('click', this.handleHide)
  }

  componentWillUnmount(){
    window.removeEventListener('click', this.handleHide)
  }
}

export default Dropdown
