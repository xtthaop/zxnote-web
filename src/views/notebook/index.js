import React from 'react'
import Page404 from '@/views/errorpage/404'
import { Sidebar, Notelist, Editor } from './components'
import Preview from './preview'
import {
  NotebookWrapper
} from './style'

class Notebook extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      activeCategoryId: undefined,
      categoryList: [],
      noteList: [],
      activeNoteId: undefined,
      activeNoteTitle: '',
      titleFocus: false,
      page: false,
    }
    this.noteListRef = React.createRef()
    this.changeActiveCategory = this.changeActiveCategory.bind(this)
    this.changeCategoryList = this.changeCategoryList.bind(this)
    this.changeActiveNote = this.changeActiveNote.bind(this)
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
    this.handleHashChange = this.handleHashChange.bind(this)
    this.changeNoteList = this.changeNoteList.bind(this)
    this.handlePageNotefound = this.handlePageNotefound.bind(this)
  }

  changeActiveCategory(val, refresh){
    if(val !== this.state.activeCategoryId){
      if(refresh){
        if(val){
          location.hash = `/category/${val}`
        }else{
          location.hash = ''
        }

        this.setState({
          activeCategoryId: val,
          activeNoteId: undefined,
          noteList: []
        })
      }else{
        this.setState({
          activeCategoryId: val,
          activeNoteId: undefined,
          noteList: []
        })

        if(val){
          location.hash = `/category/${val}`
        }else{
          location.hash = ''
        }
      }
    }
  }

  changeCategoryList(val){
    this.setState({
      categoryList: val,
    })
  }

  changeNoteList(val){
    this.setState({
      noteList: val,
    })
  }

  changeActiveNote(activeId, activeTitle, titleFocus){
    if(activeId !== this.state.activeNoteId){
      this.setState({
        activeNoteId: activeId,
        activeNoteTitle: activeTitle,
        titleFocus,
      })
      if(activeId){
        location.hash = `/category/${this.state.activeCategoryId}/note/${activeId}`
      }else if(this.state.activeCategoryId){
        location.hash = `/category/${this.state.activeCategoryId}`
      }else{
        location.hash = ''
      }
    }
  }

  handleSyncTitle(title){
    this.noteListRef.current.changeActiveNoteTitle(title)
  }

  handlePageNotefound(){
    this.setState({ page: false })
  }

  getHash(){
    const hash = location.hash
    const hashArr = hash.split('/')
    return hashArr
  }

  handleHashChange(){
    const hash = this.getHash()
    const regExp = /^\d+$/
    const { activeCategoryId, activeNoteId } = this.state

    if(hash[5]){
      if(hash[5] === 'preview'){
        this.setState({ page: 'preview', activeCategoryId: undefined, activeNoteId: undefined })
      }else{
        this.setState({ page: false })
      }
      return
    }

    if(activeCategoryId && activeNoteId){
      if(location.hash === '' || location.hash === '#/'){
        location.hash = `/category/${activeCategoryId}/note/${activeNoteId}`
        return
      }

      if(hash[1] !== 'category' || !regExp.test(hash[2]) || hash[3] !== 'note' || !regExp.test(hash[4])){
        this.setState({ page: false }, () => {
          this.setState({ activeCategoryId: undefined, activeNoteId: undefined })
        })
      }
    }else if(activeCategoryId && !activeNoteId){
      if(location.hash === '' || location.hash === '#/'){
        location.hash = `/category/${activeCategoryId}`
        return
      }

      if(hash[1] !== 'category' || !regExp.test(hash[2])){
        this.setState({ page: false }, () => {
          this.setState({ activeCategoryId: undefined })
        })
      }
    }else{
      this.setState({ page: 'note' })
    }
  }

  componentDidMount(){
    const hash = this.getHash()

    if(hash[5] && hash[5] === 'preview'){
      this.setState({ page: 'preview' })
    }else{
      this.setState({ page: 'note' })
    }

    window.addEventListener('hashchange', this.handleHashChange)
  }

  componentWillUnmount(){
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  render(){
    const { categoryList, activeCategoryId, activeNoteId, activeNoteTitle, titleFocus, page } = this.state
    return (
      <React.Fragment>
        {(() => {
          switch(page){
            case 'note':
              return <NotebookWrapper>
                <Sidebar 
                  active={this.changeActiveCategory} 
                  changeCategoryList={this.changeCategoryList}
                  handlePageNotefound={this.handlePageNotefound}
                >
                </Sidebar>
                <Notelist 
                  wrappedComponentRef={this.noteListRef}
                  active={this.changeActiveNote}
                  changeNoteList={this.changeNoteList}
                  activeCategoryId={activeCategoryId} 
                  categoryList={categoryList}
                ></Notelist>
                <Editor 
                  activeCategoryId={activeCategoryId}
                  activeNoteId={activeNoteId} 
                  activeNoteTitle={activeNoteTitle} 
                  titleFocus={titleFocus}
                  handleSyncTitle={this.handleSyncTitle}
                ></Editor>
              </NotebookWrapper>
            case 'preview':
              return <Preview></Preview>
            default:
              return <Page404></Page404>
          }
        })()}
      </React.Fragment>
    )
  }
}

export default Notebook
