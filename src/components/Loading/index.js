import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import {
  LoadingWrapper,
} from './style'

class Loading extends React.Component {
  render(){
    return (
      <LoadingWrapper {...this.props}>
        <span className="loading"><SvgIcon iconClass="loading"></SvgIcon></span>
      </LoadingWrapper>
    )
  }
}

export default Loading
