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
      activeNoteId: 0,
      activeNoteTitle: '',
      titleFocus: false,
    }
    this.changeActiveCategory = this.changeActiveCategory.bind(this)
    this.changeCategoryList = this.changeCategoryList.bind(this)
    this.changeActiveNote = this.changeActiveNote.bind(this)
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

  changeActiveNote(activeId, activeTitle, titleFocus){
    this.setState({
      activeNoteId: activeId,
      activeNoteTitle: activeTitle,
      titleFocus,
    })
  }

  render(){
    const { categoryList, activeCategoryId, activeNoteId, activeNoteTitle, titleFocus } = this.state
    return (
      <NotebookWrapper>
        <Sidebar active={this.changeActiveCategory} sendList={this.changeCategoryList}></Sidebar>
        <Notelist 
          active={this.changeActiveNote}
          activeCategoryId={activeCategoryId} 
          categoryList={categoryList}
        ></Notelist>
        <Editor 
          activeNoteId={activeNoteId} 
          activeNoteTitle={activeNoteTitle} 
          titleFocus={titleFocus}
        ></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
