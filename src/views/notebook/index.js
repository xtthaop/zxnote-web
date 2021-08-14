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
    this.handleSyncPublishStatus = this.handleSyncPublishStatus.bind(this)
    this.handleSyncPublishUpdateStatus = this.handleSyncPublishUpdateStatus.bind(this)
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

  handleSyncPublishStatus(status){
    this.noteListRef.current.changeActiveNoteStatus(status)
  }

  handleSyncPublishUpdateStatus(status){
    this.noteListRef.current.changeActiveNoteUpdateStatus(status)
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
          handleSyncPublishStatus={this.handleSyncPublishStatus}
          handleSyncPublishUpdateStatus={this.handleSyncPublishUpdateStatus}
        ></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
