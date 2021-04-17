import React from 'react'
import {
  Sidebar,
  Notelist,
  Editor
} from './components'
import {
  NotebookWrapper
} from './style'

class Notebook extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      activeCategoryId: 0,
    }
    this.changeActiveCategory = this.changeActiveCategory.bind(this)
  }

  changeActiveCategory(val){
    this.setState({
      activeCategoryId: val,
    })
  }

  render(){
    return (
      <NotebookWrapper>
        <Sidebar active={this.changeActiveCategory}></Sidebar>
        <Notelist activeCategoryId={this.state.activeCategoryId}></Notelist>
        <Editor></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
