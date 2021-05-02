import React from 'react'
import { Editor } from '../components/index'
import {
  PreviewWrapper
} from './style'

class Preview extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    return (
      <PreviewWrapper>
        <Editor></Editor>
      </PreviewWrapper>
    )
  }
}

export default Preview
