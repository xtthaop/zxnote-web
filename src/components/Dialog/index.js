import React from 'react'
import { CSSTransition } from 'react-transition-group'
import {
  DialogWrapper,
  DialogMask,
  DialogContentWrapper,
  DialogContent,
} from './style'

class Dialog extends React.Component {
  render(){
    const { visible, title, children, footer } = this.props
    return (
      <DialogWrapper>
        { !visible && null }
        <CSSTransition in={visible} unmountOnExit timeout={200} classNames="mask">
          <DialogMask></DialogMask>
        </CSSTransition>
        <CSSTransition in={visible} unmountOnExit timeout={200} classNames="content">
          <DialogContentWrapper>
            <DialogContent>
              <div className="dialog-head-wrapper"><div>{title}</div></div>
              <div className="dialog-content-wrapper"><div>{children}</div></div>
              <div className="dialog-footer-wrapper"><div>{footer}</div></div>
            </DialogContent>
          </DialogContentWrapper>
        </CSSTransition>
      </DialogWrapper>
    )
  }
}

export default Dialog
