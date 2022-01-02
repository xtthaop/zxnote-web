import React from 'react'
import { CSSTransition } from 'react-transition-group'
import Button from '../Button'
import SvgIcon from '../SvgIcon'
import {
  MessageBoxWrapper,
  MessageBoxMask,
  MessageBoxContentWrapper,
  MessageBoxContent,
} from './style'

class MessageBox extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      visible: false,
      type: '',
      title: '',
      message: '',
      showCancelButton: true,
      footer: null,
      beforeClose: null,
      confirmLoading: false,
    }
    this.handleHide = this.handleHide.bind(this)
    this.handleDone = this.handleDone.bind(this)
  }

  show(options){
    return new Promise((resolve, reject) => {
      const footer = (confirmLoading) => (
        <div>
          <Button 
            style={{ marginRight: '10px', display: options.showCancelButton ? 'inline-block' : 'none' }} 
            disabled={confirmLoading}
            onClick={() => this.handleDone('cancel', reject)}
          >
            取消
          </Button>
          <Button 
            type="primary" 
            data-loading={confirmLoading}
            onClick={() => this.handleDone('confirm', resolve)}
          >
            确认
          </Button>
        </div>
      )

      this.setState({
        visible: true,
        ...options,
        footer,
      })
    })
  }

  handleDone(action, callback){
    const done = () => { this.handleHide(callback) }
    if(this.state.beforeClose){
      this.state.beforeClose(action, this, done)
    }else{
      done()
    }
  }

  handleHide(callback){
    this.setState({
      visible: false,
    })
    callback()
  }

  render(){
    const { visible, title, message, footer, type, confirmLoading } = this.state
    return (
      <MessageBoxWrapper>
        { !visible && null }
        <CSSTransition in={visible} unmountOnExit timeout={200} classNames="mask">
          <MessageBoxMask></MessageBoxMask>
        </CSSTransition>
        <CSSTransition in={visible} unmountOnExit timeout={200} classNames="content">
          <MessageBoxContentWrapper>
            <MessageBoxContent type={type}>
              <div className="messagebox-head-wrapper">
                <div>
                  <SvgIcon iconClass="warning" style={{ marginRight: '8px' }}></SvgIcon>
                  <span>{title}</span>
                </div>
              </div>
              <div className="messagebox-content-wrapper"><div>{message}</div></div>
              <div className="messagebox-footer-wrapper"><div>{footer && footer(confirmLoading)}</div></div>
            </MessageBoxContent>
          </MessageBoxContentWrapper>
        </CSSTransition>
      </MessageBoxWrapper>
    )
  }
}

export default MessageBox
