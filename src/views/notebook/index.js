import React from 'react'
import { Sidebar, Notelist, Editor } from './components'
import {
  NotebookWrapper
} from './style'

class Notebook extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      categoryList: [],
      categoryNoteList: [],
      activeNoteInfo: {},
      titleFocus: false,
    }
    this.noteListRef = React.createRef()
    this.changeCategoryList = this.changeCategoryList.bind(this)
    this.changeActiveNote = this.changeActiveNote.bind(this)
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
    this.changeCategoryNoteList = this.changeCategoryNoteList.bind(this)
  }

  changeCategoryList(val){
    this.setState({ categoryList: val })
  }

  changeCategoryNoteList(val){
    this.setState({ categoryNoteList: val })
  }

  changeActiveNote(activeNoteInfo, titleFocus){
    this.setState({
      activeNoteInfo,
      titleFocus,
    })
  }

  handleSyncTitle(title){
    this.noteListRef.current.changeActiveNoteTitle(title)
  }

  render(){
    const { categoryList, activeNoteInfo, titleFocus, categoryNoteList } = this.state
    return (
      <NotebookWrapper>
        <Sidebar changeCategoryList={this.changeCategoryList}></Sidebar>
        <Notelist 
          wrappedComponentRef={this.noteListRef}
          active={this.changeActiveNote}
          categoryList={categoryList}
          changeCategoryNoteList={this.changeCategoryNoteList}
        ></Notelist>
        <Editor 
          categoryNoteList={categoryNoteList}
          activeNoteInfo={activeNoteInfo}
          titleFocus={titleFocus}
          handleSyncTitle={this.handleSyncTitle}
        ></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
