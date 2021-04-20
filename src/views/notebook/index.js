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
      activeNoteIndex: 0,
      activeNoteTitle: '',
      titleFocus: false,
    }
    this.noteListRef = React.createRef()
    this.changeActiveCategory = this.changeActiveCategory.bind(this)
    this.changeCategoryList = this.changeCategoryList.bind(this)
    this.changeActiveNote = this.changeActiveNote.bind(this)
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
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

  handleSyncTitle(title){
    this.noteListRef.current.changeActiveNoteTitle(title)
  }

  render(){
    const { categoryList, activeCategoryId, activeNoteId, activeNoteTitle, titleFocus, syncTitle } = this.state
    return (
      <NotebookWrapper>
        <Sidebar active={this.changeActiveCategory} sendList={this.changeCategoryList}></Sidebar>
        <Notelist 
          ref={this.noteListRef}
          active={this.changeActiveNote}
          activeCategoryId={activeCategoryId} 
          categoryList={categoryList}
        ></Notelist>
        <Editor 
          activeNoteId={activeNoteId} 
          activeNoteTitle={activeNoteTitle} 
          titleFocus={titleFocus}
          handleSyncTitle={this.handleSyncTitle}
        ></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
