import React from 'react'
import ReactDOM from 'react-dom'
import MessageComponent from './MessageComponent'

class Msg {
  constructor(){
    this.messageRef = React.createRef()
    const div = document.createElement('div')
    document.body.append(div)
    ReactDOM.render(<MessageComponent ref={this.messageRef}></MessageComponent>, div)
  }

  success(message){
    this.messageRef.current.add({
      type: 'success',
      message,
    })
  }

  error(message){
    this.messageRef.current.add({
      type: 'error',
      message,
    })
  }
}

Msg.getInstance = (function(){
  let instance
  return function(){
    if(!instance){
      instance = new Msg()
    }
    return instance
  }
})()

export const message = Msg.getInstance()
