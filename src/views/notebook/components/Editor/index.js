import React from 'react'
import SvgIcon from '@/components/SvgIcon'
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
    }
    this.titleRef = React.createRef()
    this.changeTitle = this.changeTitle.bind(this)
    this.changeContent = this.changeContent.bind(this)
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
    }
  }

  render(){
    const { title, content, showEditor } = this.state

    return (
      <EditorWrapper>
        {
          showEditor ?
          <React.Fragment>
            <TitleWrapper>
              <div className="save-status">saved</div>
              <input ref={this.titleRef} className="custom-input" value={title} onChange={this.changeTitle}></input>
            </TitleWrapper>
            <ToolBar>
              <li className="tool right">
                <SvgIcon iconClass="release"></SvgIcon>
                <span className="release-text">发布笔记</span>
              </li>
              <li className="tool"><SvgIcon iconClass="pic"></SvgIcon></li>
              <li className="tool right"><SvgIcon iconClass="save"></SvgIcon></li>
            </ToolBar>
            <ContentWrapper value={content} onChange={this.changeContent}></ContentWrapper>
          </React.Fragment>
          : <EmptyArea></EmptyArea>
        }
      </EditorWrapper>
    )
  }
}

export default Editor