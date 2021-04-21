import React from 'react'
import Page404 from '@/views/errorpage/404'
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
      activeCategoryId: undefined,
      categoryList: [],
      noteList: [],
      activeNoteId: undefined,
      activeNoteIndex: undefined,
      activeNoteTitle: '',
      titleFocus: false,
      pageNoteFound: false,
    }
    this.noteListRef = React.createRef()
    this.changeActiveCategory = this.changeActiveCategory.bind(this)
    this.changeCategoryList = this.changeCategoryList.bind(this)
    this.changeActiveNote = this.changeActiveNote.bind(this)
    this.handleSyncTitle = this.handleSyncTitle.bind(this)
    this.handleHashChange = this.handleHashChange.bind(this)
    this.changeNoteList = this.changeNoteList.bind(this)
  }

  changeActiveCategory(val){
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
    this.setState({
      activeNoteId: activeId,
      activeNoteTitle: activeTitle,
      titleFocus,
    })
    if(activeId){
      location.hash = `/category/${this.state.activeCategoryId}/note/${activeId}`
    }else{
      location.hash = `/category/${this.state.activeCategoryId}`
    }
  }

  handleSyncTitle(title){
    this.noteListRef.current.changeActiveNoteTitle(title)
  }

  getHash(){
    const hash = location.hash
    const hashArr = hash.split('/')
    return hashArr
  }

  handleHashChange(){
    const hash = this.getHash()
    const regExp = /^\d+$/
    let pageNoteFound = false
    if(this.state.noteList.length && this.state.categoryList.length){
      if(hash[1] !== 'category' || !regExp.test(hash[2]) || hash[3] !== 'note' || !regExp.test(hash[4])){
        pageNoteFound = true
        this.setState({ pageNoteFound }, () => {
          this.setState({ activeCategoryId: undefined, activeNoteId: undefined })
        })
      }else{
        pageNoteFound = false
        this.setState({ pageNoteFound })
      }
    }
  }

  componentDidMount(){
    window.addEventListener('hashchange', this.handleHashChange)
  }

  componentWillUnmount(){
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  render(){
    const { categoryList, activeCategoryId, activeNoteId, activeNoteTitle, titleFocus, pageNoteFound } = this.state
    return (
      <React.Fragment>
        {
          pageNoteFound ? <Page404></Page404> :
          <NotebookWrapper>
            <Sidebar active={this.changeActiveCategory} changeCategoryList={this.changeCategoryList}></Sidebar>
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
        }
      </React.Fragment>
    )
  }
}

export default Notebook
