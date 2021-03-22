import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import {
  EditorWrapper,
  TitleWrapper,
  ToolBar,
  ContentWrapper,
} from './style'

class Editor extends React.Component {
  render(){
    return (
      <EditorWrapper>
        <TitleWrapper>
          <div className="save-status">saved</div>
          <input className="custom-input" defaultValue="Title"></input>
        </TitleWrapper>
        <ToolBar>
          <li className="tool right">
            <SvgIcon iconClass="release"></SvgIcon>
            <span className="release-text">发布笔记</span>
          </li>
          <li className="tool"><SvgIcon iconClass="pic"></SvgIcon></li>
          <li className="tool right"><SvgIcon iconClass="save"></SvgIcon></li>
        </ToolBar>
        <ContentWrapper defaultValue="content..."></ContentWrapper>
      </EditorWrapper>
    )
  }
}

export default Editor