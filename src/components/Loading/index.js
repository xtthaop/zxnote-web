import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import {
  LoadingWrapper,
} from './style'

class Loading extends React.Component {
  render(){
    return (
      <LoadingWrapper {...this.props}>
        <div className="loading"><SvgIcon iconClass="loading"></SvgIcon></div>
      </LoadingWrapper>
    )
  }
}

export default Loading
