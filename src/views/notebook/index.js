import React from 'react'
import {
  Sidebar,
  Notelist,
  Editor
} from './components'
import {
  NotebookWrapper
} from './style'

class Notebook extends React.Component {
  render(){
    return (
      <NotebookWrapper>
        <Sidebar></Sidebar>
        <Notelist></Notelist>
        <Editor></Editor>
      </NotebookWrapper>
    )
  }
}

export default Notebook
