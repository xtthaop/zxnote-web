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
      activeNoteId: undefined,
      activeNoteTitle: '',
      titleFocus: false,
    }
    this.noteListRef = React.createRef()
    this.changeCategoryList = this.changeCategoryList.bind(this)
    this.changeActiveNote = this.changeActiveNote.bind(this)
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
  }

  changeCategoryList(val){
    this.setState({ categoryList: val })
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
    const { categoryList, activeNoteId, activeNoteTitle, titleFocus } = this.state
    return (
      <NotebookWrapper>
        <Sidebar changeCategoryList={this.changeCategoryList}></Sidebar>
        <Notelist 
          wrappedComponentRef={this.noteListRef}
          active={this.changeActiveNote}
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
