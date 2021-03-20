import React from 'react'
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
      visible ? (
        <DialogWrapper>
          <DialogMask></DialogMask>
          <DialogContentWrapper>
            <DialogContent>
              <div className="dialog-head-wrapper"><div>{title}</div></div>
              <div className="dialog-content-wrapper"><div>{children}</div></div>
              <div className="dialog-footer-wrapper">{footer}</div>
            </DialogContent>
          </DialogContentWrapper>
        </DialogWrapper>
      ) : null
    )
  }
}

export default Dialog
