import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import { getNoteContent, saveNote } from '@/api/notebook/note'
import {
  EditorWrapper,
  TitleWrapper,
  ToolBar,
  ContentWrapper,
  EmptyArea,
} from './style'

class Editor extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      title: '',
      content: '',
      showEditor: false,
      savedStatus: true,
    }
    this.titleRef = React.createRef()
    this.changeTitle = this.changeTitle.bind(this)
    this.changeContent = this.changeContent.bind(this)
    this.handleSaveNote = this.handleSaveNote.bind(this)
  }

  changeTitle(e){
    let value = e.target.value
    this.setState({
      title: value
    })
  }

  changeContent(e){
    let value = e.target.value
    this.setState({
      content: value
    })
  }

  handleSaveNote(){
    const data = {
      note_id: this.props.activeNoteId,
      note_title: this.state.title,
      note_content: this.state.content,
    }

    this.setState({ savedStatus: false })
    saveNote(data).then(() => {
      this.setState({ savedStatus: true })
    })
  }

  componentDidUpdate(prevProp){
    if(prevProp.activeNoteId !== this.props.activeNoteId){
      if(!this.props.activeNoteId){
        this.setState({ title: '', content: '', showEditor: false  })
        return
      }

      this.setState({ title: this.props.activeNoteTitle, showEditor: true })

      if(this.props.titleFocus){
        this.titleRef.current.select()
      }

      getNoteContent({ note_id: this.props.activeNoteId }).then(res => {
        const noteContent = res.data.note_content
        this.setState({ content: noteContent === null ? '' : noteContent })
      })
    }
  }

  render(){
    const { title, content, showEditor, savedStatus } = this.state

    return (
      <EditorWrapper>
        {
          showEditor ?
          <React.Fragment>
            <TitleWrapper>
              <div className="save-status">{savedStatus ? '已保存' : '保存中...'}</div>
              <input ref={this.titleRef} className="custom-input" value={title} onChange={this.changeTitle}></input>
            </TitleWrapper>
            <ToolBar>
              <li className="tool right">
                <SvgIcon iconClass="release"></SvgIcon>
                <span className="release-text">发布笔记</span>
              </li>
              <li className="tool"><SvgIcon iconClass="pic"></SvgIcon></li>
              <li className="tool right" onClick={this.handleSaveNote}><SvgIcon iconClass="save"></SvgIcon></li>
            </ToolBar>
            <ContentWrapper value={content} onChange={this.changeContent}></ContentWrapper>
          </React.Fragment> : 
          <EmptyArea></EmptyArea>
        }
      </EditorWrapper>
    )
  }
}

export default Editor