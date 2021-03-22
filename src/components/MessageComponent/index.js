import React from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import SvgIcon from '@/components/SvgIcon'
import {
  MessageWrapper,
  MessageItem,
} from './style'

class MessageComponent extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      id: 0,
      messages: [],
    }
    this.switchIcon = this.switchIcon.bind(this)
  }

  switchIcon(type){
    switch(type){
      case 'success':
        return (
          <SvgIcon iconClass="success"></SvgIcon>
        )
      case 'error':
        return (
          <SvgIcon iconClass="error"></SvgIcon>
        )
      default:
        return null
    }
  }

  add(options){
    let { id, messages } = this.state
    const layer = {
      id: id++,
      ...options,
    }
    layer.timer = setTimeout(() => {
      this.remove(layer)
    }, 2000)
    messages.push(layer)
    this.setState({
      id,
      messages,
    })
  }

  remove(layer){
    clearTimeout(layer.timer)
    const messages = this.state.messages.filter(item => item.id !== layer.id)
    this.setState({ messages })
  }

  render(){
    return (
      <MessageWrapper>
        <TransitionGroup>
          {
            this.state.messages.map((item) => {
              return (
                <CSSTransition 
                  key={item.id}
                  timeout={500}
                  classNames="fade"
                >
                  <MessageItem key={item.id} type={item.type} className='hide'>
                    <span className="icon">{ this.switchIcon(item.type) }</span>
                    <span className="message">{item.message}</span>
                  </MessageItem>
                </CSSTransition>
              )
            })
          }
        </TransitionGroup>
      </MessageWrapper>
    )
  }
}

export default MessageComponent
