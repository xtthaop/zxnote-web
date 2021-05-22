import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import Loading from '@/components/Loading'
import { getCaptcha } from '@/api/permission'
import { CaptchaWrapper } from './style'

class Captcha extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      jigsawLeft: 0,
      loadedNum: 0,
    }
    this.captcha = React.createRef()
    this.drawCaptcha = this.drawCaptcha.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose(){
    this.props.onClose()
  }

  handleGetCaptcha(){
    getCaptcha().then(res => {
      this.drawCaptcha(res.data)
    })
  }

  drawCaptcha(imgInfo){
    const $dst = this.captcha.current.querySelector('#dst')
    const $jigsaw = this.captcha.current.querySelector('#jigsaw')

    const dstCtx = $dst.getContext('2d')
    const jigsawCtx = $jigsaw.getContext('2d')

    const dstImg = new Image()
    const jigsawImg = new Image()

    dstImg.src = imgInfo.dst_img
    jigsawImg.src = imgInfo.jigsaw_img
    dstImg.onload = () => {
      this.setState(state => {
        return {
          loadedNum: ++state.loadedNum
        }
      })
      dstCtx.drawImage(dstImg, 0, 0, 320, 140)
    }

    jigsawImg.onload = () => {
      this.setState(state => ({
        loadedNum: ++state.loadedNum
      }))
      jigsawCtx.drawImage(jigsawImg, 2, imgInfo.y, 40, 40)
    }
  }

  componentDidMount(){
    this.handleGetCaptcha()
  }

  render(){
    const { jigsawLeft, loadedNum } = this.state

    return (
      <CaptchaWrapper>
        <header>
          <div className="header-left">
            <span>完成拼图验证</span>
            <span className="switch">换一张</span>
          </div>
          <div className="header-right">
            <SvgIcon iconClass="close" style={{ cursor: 'pointer' }} onClick={this.handleClose}></SvgIcon>
          </div>
        </header>
        <div className="captcha-container">
          {
            loadedNum !== 2 ?
            <div className="loading-mask">
              <Loading data-loading={true}></Loading>
            </div> : null
          }
          <div>
            <div className="captcha" ref={this.captcha}>
              <canvas id="jigsaw" width="320" height="140" style={{ left: jigsawLeft }}></canvas>
              <canvas id="dst" width="320" height="140"></canvas>
            </div>
            <div className="slider-container">

            </div>
          </div>
        </div>
        
      </CaptchaWrapper>
    )
  }
}

export default Captcha
