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
    this.changeCategoryList = this.changeCategoryList.bind(this)
  }

  changeActiveCategory(val){
    this.setState({
      activeCategoryId: val,
    })
  }

  changeCategoryList(val){
    this.setState({
      categoryList: val,
    })
  }

  render(){
    const { categoryList, activeCategoryId } = this.state
    return (
      <NotebookWrapper>
        <Sidebar active={this.changeActiveCategory} sendList={this.changeCategoryList}></Sidebar>
        <Notelist activeCategoryId={activeCategoryId} categoryList={categoryList}></Notelist>
        <Editor></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
