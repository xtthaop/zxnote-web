import React from 'react'
import SvgIcon from '@/components/SvgIcon'
import Loading from '@/components/Loading'
import { getCaptcha, login } from '@/api/permission'
import { CaptchaWrapper } from './style'

class Captcha extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      jigsawLeft: 0,
      loadedNum: 0,
      downX: 0,
      offset: 0,
      statusStyle: {
        width: 0,
        background: '#409EFF',
        transition: ''
      },
      btnStyle: {
        left: 0,
        transition: ''
      },
      verifyLoading: false,
      btnShow: true,
    }
    this.captcha = React.createRef()
    this.slider = React.createRef()
    this.drawCaptcha = this.drawCaptcha.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.dragStart = this.dragStart.bind(this)
    this.dragMove = this.dragMove.bind(this)
    this.dragUp = this.dragUp.bind(this)
    this.initCaptchaStatus = this.initCaptchaStatus.bind(this)
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
      jigsawCtx.drawImage(jigsawImg, 0, imgInfo.y, 40, 40)
    }
  }

  dragStart(e){
    if(this.state.verifyLoading) return

    this.setState({
      downX: e.clientX,
    })

    this.slider.current.addEventListener('mousemove', this.dragMove)
    document.addEventListener('mouseup', this.dragUp)
  }

  initCaptchaStatus(){
    this.setState({
      jigsawLeft: 0,
      downX: 0,
      offset: 0,
      btnStyle: { left: 0, transition: '' },
      statusStyle: { width: 0, background: '#409EFF', transition: '' }
    })
  }

  dragMove(e){
    const moveX = e.clientX
    const offset = moveX - this.state.downX

    if(offset >= (320 - 40) || offset <= 0) return

    this.setState(state => ({ 
      offset,
      jigsawLeft: offset + 'px',
      btnStyle: Object.assign({}, state.btnStyle, { left: offset + 'px' }),
      statusStyle: Object.assign({}, state.statusStyle, { width: offset + 40 + 'px' }),
    }))
  }

  dragUp(){
    this.slider.current.removeEventListener('mousemove', this.dragMove)
    document.removeEventListener('mouseup', this.dragUp)

    this.handleVerify()
  }

  handleVerify(){
    const data = this.props.formData
    data.x = this.state.offset

    this.setState({ verifyLoading: true })
    login(data).then(res => {
      console.log(res)
      this.setState({ verifyLoading: false })
    }).catch(() => {
      this.setState({ verifyLoading: false })
      this.initCaptchaStatus()
    })
  }

  componentDidMount(){
    this.handleGetCaptcha()
  }

  render(){
    const { jigsawLeft, loadedNum, statusStyle, btnStyle, btnShow } = this.state

    return (
      <CaptchaWrapper btnShow={btnShow}>
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
          <div className="captcha">
            <div className="captcha-img-container" ref={this.captcha}>
              <canvas id="jigsaw" width="320" height="140" style={{ left: jigsawLeft }}></canvas>
              <canvas id="dst" width="320" height="140"></canvas>
            </div>
            <div ref={this.slider} className="slider-container">
              <div className="btn" style={btnStyle} onMouseDown={this.dragStart}>
                <SvgIcon iconClass="arrow-right" className="arrow-icon"></SvgIcon>
              </div>
              <div className="status" style={statusStyle}>
                { btnShow ? '拼接成功' : null }
              </div>
              <div className="track">向右滑动完成拼图</div>
            </div>
          </div>
        </div>
        
      </CaptchaWrapper>
    )
  }
}

export default Captcha
