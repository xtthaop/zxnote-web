import React from 'react'
import ReactDOM from 'react-dom'
import MessageBoxComponent from './MessageBoxComponent'

class MsgBox {
  constructor(){
    this.messageboxRef = React.createRef()
    const div = document.createElement('div')
    document.body.append(div)
    ReactDOM.render(<MessageBoxComponent ref={this.messageboxRef}></MessageBoxComponent>, div)
  }

  warning(title, message, options){
    return this.messageboxRef.current.show({
      type: 'warning',
      title,
      message,
      showCancelButton: true,
      ...options,
    })
  }
}

MsgBox.getInstance = (function(){
  let instance
  return function(){
    if(!instance){
      instance = new MsgBox()
    }
    return instance
  }
})()

export const messagebox = MsgBox.getInstance()
