import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import SvgIcon from '@/components/SvgIcon'
import Loading from '@/components/Loading'
import { message } from '@/components/message'
import { getNoteContent, saveNote, releaseNote } from '@/api/notebook/note'
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
      releaseStatus: false,
      cancelStatus: false,
      releaseLoading: false,
      timeoutId: undefined,
      contentLoading: false,
      isPreviewMode: false,
    }
    this.titleRef = React.createRef()
    this.changeTitle = this.changeTitle.bind(this)
    this.changeContent = this.changeContent.bind(this)
    this.handleSaveNote = this.handleSaveNote.bind(this)
    this.handleGetNoteContent = this.handleGetNoteContent.bind(this)
    this.handleToPreview = this.handleToPreview.bind(this)
    this.handleRelease = this.handleRelease.bind(this)
    this.handleChangeCancelStatus = this.handleChangeCancelStatus.bind(this)
  }

  changeTitle(e){
    clearTimeout(this.state.timeoutId)

    let value = e.target.value
    this.setState({
      title: value
    })

    const timeoutId = setTimeout(() => {
      this.handleSaveNote()
    }, 1000)
    this.setState({ timeoutId })
  }

  changeContent(e){
    clearTimeout(this.state.timeoutId)

    let value = e.target.value
    this.setState({
      content: value
    })

    const timeoutId = setTimeout(() => {
      this.handleSaveNote()
    }, 1000)
    this.setState({ timeoutId })
  }

  handleSaveNote(){
    const data = {
      note_id: this.props.activeNoteInfo.note_id,
      note_title: this.state.title,
      note_content: this.state.content,
    }

    this.setState({ savedStatus: false })
    saveNote(data).then(() => { 
      this.props.handleSyncTitle(this.state.title)
      if(this.props.isPreviewMode){
        this.props.handleSyncContent(this.state.content)
      }
      this.setState({ savedStatus: true })
    })
  }

  handleGetNoteContent(){
    this.setState({ contentLoading: true, showEditor: false })

    if(this.props.isPreviewMode){
      this.props.handleSyncContent(false)
    }
    
    const data = {
      note_id: this.props.activeNoteInfo.note_id
    }

    getNoteContent(data).then(res => {
      const noteContent = res.data.note_content === null ? '' : res.data.note_content

      this.setState({ 
        title: this.props.activeNoteInfo.note_title,
        releaseStatus: this.props.activeNoteInfo.release_status ? true : false,
        content: noteContent, 
        showEditor: true,
        contentLoading: false,
      }, () => {
        if(this.props.titleFocus){
          this.titleRef.current.select()
        }

        if(this.props.isPreviewMode){
          this.props.handleSyncContent(this.state.content)
        }
      })
    }).catch(() => {
      this.setState({ showEditor: false, content: '', title: '', contentLoading: false })
    })
  }

  handleToPreview(){
    if(this.props.isPreviewMode){
      const pathArr = this.props.history.location.pathname.split('/')
      pathArr.pop()
      this.props.history.push(pathArr.join('/'))
    }else{
      this.props.history.push(this.props.history.location.pathname + '/preview')
    }
  }

  componentDidUpdate(prevProp){
    const activeNoteInfo = this.props.activeNoteInfo ? this.props.activeNoteInfo : {}
    const prevActiveNoteInfo = prevProp.activeNoteInfo ? prevProp.activeNoteInfo : {}

    if(prevActiveNoteInfo.note_id !== activeNoteInfo.note_id){
      if(activeNoteInfo.note_id){
        this.handleGetNoteContent()
      }else{
        this.setState({ showEditor: false, content: '', title: '', contentLoading: false })
        if(this.props.isPreviewMode){
          this.props.handleSyncContent(false)
        }
      }
    }
  }

  handleRelease(status){
    if(this.state.releaseLoading) return

    const data = {
      note_id: this.props.activeNoteInfo.note_id,
      release_status: status ? 1 : 0,
    }

    this.setState({ releaseLoading: true })
    releaseNote(data).then(() => {
      this.setState({ releaseStatus: status, releaseLoading: false })
    })
  }

  handleChangeCancelStatus(status){
    if(this.state.savedStatus && this.state.releaseStatus){
      this.setState({ cancelStatus: status })
    }
  }

  render(){
    const { title, content, showEditor, savedStatus, contentLoading, releaseStatus, releaseLoading, cancelStatus } = this.state

    return (
      <EditorWrapper isPreviewMode={this.props.isPreviewMode} showEditor={showEditor}>
        {
          showEditor ?
          <React.Fragment>
            <TitleWrapper>
              <div className="save-status">{savedStatus ? '已保存' : '保存中...'}</div>
              <input ref={this.titleRef} className="custom-input" value={title} onChange={this.changeTitle}></input>
            </TitleWrapper>
            <ToolBar>
              <li 
                className="tool right release" 
                onMouseEnter={() => this.handleChangeCancelStatus(true)}
                onMouseLeave={() => this.handleChangeCancelStatus(false)}
              >
                {
                  savedStatus ?
                  <Fragment>
                    {
                      releaseStatus ?
                      <div onClick={() => this.handleRelease(false)}>
                        <SvgIcon iconClass={cancelStatus ? 'error' : 'success'}></SvgIcon>
                        <span className="release-text">{cancelStatus ? (releaseLoading ? '取消中...' : '取消发布') : '已发布'}</span>
                      </div> : 
                      <div onClick={() => this.handleRelease(true)}>
                        <SvgIcon iconClass={releaseLoading ? '' : 'release'}></SvgIcon>
                        <span className="release-text">{releaseLoading ? '发布中...' : '发布笔记'}</span>
                      </div>
                    }
                  </Fragment> :
                  <span className="release-text">保存中...</span>
                }
              </li>
              <li className="tool"><SvgIcon iconClass="pic"></SvgIcon></li>
              <li className="tool right" onClick={this.handleSaveNote}><SvgIcon iconClass="save"></SvgIcon></li>
              <li className="tool right" onClick={this.handleToPreview}><SvgIcon iconClass="square-split"></SvgIcon></li>
            </ToolBar>
            <ContentWrapper value={content} onChange={this.changeContent}></ContentWrapper>
          </React.Fragment> : 
          <EmptyArea>
            <Loading data-loading={contentLoading}></Loading>
          </EmptyArea>
        }
      </EditorWrapper>
    )
  }
}

export default withRouter(Editor)
