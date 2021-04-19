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
      categoryList: [],
    }
    this.changeActiveCategory = this.changeActiveCategory.bind(this)
  }

  changeActiveCategory(val, list){
    this.setState({
      activeCategoryId: val,
      categoryList: list
    })
  }

  render(){
    const { categoryList, activeCategoryId } = this.state
    return (
      <NotebookWrapper>
        <Sidebar active={this.changeActiveCategory}></Sidebar>
        <Notelist activeCategoryId={activeCategoryId} categoryList={categoryList}></Notelist>
        <Editor></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
