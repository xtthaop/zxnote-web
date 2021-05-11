import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import md5 from 'js-md5'
import SvgIcon from '@/components/SvgIcon'
import Loading from '@/components/Loading'
import { getNoteContent, saveNote, releaseNote } from '@/api/notebook/note'
import { uploadFile } from '@/api/upload'
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
      imgUploading: false,
    }
    this.titleRef = React.createRef()
    this.contentRef = React.createRef()
    this.imgFileInputRef = React.createRef()
    this.changeTitle = this.changeTitle.bind(this)
    this.changeContent = this.changeContent.bind(this)
    this.handleSaveNote = this.handleSaveNote.bind(this)
    this.handleGetNoteContent = this.handleGetNoteContent.bind(this)
    this.handleToPreview = this.handleToPreview.bind(this)
    this.handleRelease = this.handleRelease.bind(this)
    this.handleChangeCancelStatus = this.handleChangeCancelStatus.bind(this)
    this.handleUploadImg = this.handleUploadImg.bind(this)
    this.handleImgFileChange = this.handleImgFileChange.bind(this)
    this.handleClickImgInput = this.handleClickImgInput.bind(this)
  }

  handleUploadImg(file, uploadingStr, filePromiseArr){
    const fileNameArr = file.name.split('.')
    const newFileName = +new Date() + '-' + md5(file.name) + '.' + fileNameArr[fileNameArr.length - 1]

    const data = new FormData()
    data.append('key', `images/${newFileName}`)
    data.append('file', file)

    const filePromise = uploadFile(data).then(res => {
      const imgUrl = res.data.url
      this.setState(state => {
        const start = state.content.indexOf(uploadingStr)
        const end = start + uploadingStr.length
        return {
          content: state.content.slice(0, start) + `![${file.name}](${imgUrl})` + state.content.slice(end)
        }
      })
    })

    filePromiseArr.push(filePromise)
  }

  handleImgFileChange(e){
    this.setState({ imgUploading: true })
    let start = this.contentRef.current.selectionStart
    let end = this.contentRef.current.selectionEnd
    let uploadingStr = ''

    for(let i = 0; i < e.target.files.length; i++){
      const tmpStr = `[图片正在上传...(${e.target.files[i].name}-${+new Date()})]\n`
      uploadingStr += tmpStr
    }

    this.setState((state) => ({
      content: state.content.slice(0, start) + uploadingStr + state.content.slice(end)
    }))

    const filePromiseArr = []
    const uploadingArr = uploadingStr.split('\n')
    for(let i = 0; i < e.target.files.length; i++){
      const tmpStr = uploadingArr[i]
      this.handleUploadImg(e.target.files[i], tmpStr, filePromiseArr)
    }

    Promise.all(filePromiseArr).then(() => {
      this.setState({ imgUploading: false })
      this.imgFileInputRef.current.value = ''
      this.handleSaveNote()
    })
  }

  handleClickImgInput(){
    this.imgFileInputRef.current.click()
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
      if(!this.state.imgUploading){
        this.handleSaveNote()
      }
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
        this.contentRef.current.setSelectionRange(-1, -1)

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
              <li className="tool" onClick={this.handleClickImgInput}>
                <input ref={this.imgFileInputRef} type="file" multiple="multiple" onChange={this.handleImgFileChange} />
                <SvgIcon iconClass="pic"></SvgIcon>
              </li>
              <li className="tool right" onClick={this.handleSaveNote}><SvgIcon iconClass="save"></SvgIcon></li>
              <li className="tool right" onClick={this.handleToPreview}><SvgIcon iconClass="square-split"></SvgIcon></li>
            </ToolBar>
            <ContentWrapper 
              ref={this.contentRef}
              value={content}
              onChange={this.changeContent}
            ></ContentWrapper>
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
