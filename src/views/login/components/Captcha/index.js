import React from 'react'
import { withRouter } from 'react-router-dom'
import md5 from 'js-md5'
import SvgIcon from '@/components/SvgIcon'
import Loading from '@/components/Loading'
import { setToken } from '@/utils/auth'
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
      imgLoading: true,
    }
    this.captcha = React.createRef()
    this.slider = React.createRef()
    this.drawCaptcha = this.drawCaptcha.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.dragStart = this.dragStart.bind(this)
    this.dragMove = this.dragMove.bind(this)
    this.dragUp = this.dragUp.bind(this)
    this.initCaptchaStatus = this.initCaptchaStatus.bind(this)
    this.handleGetCaptcha = this.handleGetCaptcha.bind(this)
  }

  handleClose(){
    this.props.onClose()
  }

  handleGetCaptcha(){
    this.setState({ imgLoading: true, loadedNum: 0 })
    getCaptcha().then(res => {
      this.drawCaptcha(res.data)
    }).catch(() => {
      this.setState({ imgLoading: false })
    })
  }

  drawCaptcha(imgInfo){
    const $dst = this.captcha.current.querySelector('#dst')
    const $jigsaw = this.captcha.current.querySelector('#jigsaw')

    const dstCtx = $dst.getContext('2d')
    const jigsawCtx = $jigsaw.getContext('2d')

    // 重绘清空画布
    $dst.height = 320
    $jigsaw.height = 320

    const dstImg = new Image()
    const jigsawImg = new Image()

    dstImg.src = imgInfo.dst_img
    jigsawImg.src = imgInfo.jigsaw_img

    dstImg.onload = () => {
      this.setState(state => ({
        loadedNum: ++state.loadedNum
      }))
      dstCtx.drawImage(dstImg, 0, 0, 320, 140)
    }

    dstImg.onerror = () => {
      this.setState({
        imgLoading: false
      })
    }

    jigsawImg.onload = () => {
      this.setState(state => ({
        loadedNum: ++state.loadedNum
      }))
      jigsawCtx.drawImage(jigsawImg, 0, imgInfo.y, 40, 40)
    }

    jigsawImg.onerror = () => {
      this.setState({
        imgLoading: false
      })
    }
  }

  dragStart(e){
    if(this.state.verifyLoading) return

    this.initCaptchaStatus()
    this.setState({ downX: e.clientX })

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
    const data = {
      username: this.props.formData.username,
      password: md5(this.props.formData.password),
      x: this.state.offset,
    }

    this.setState({ verifyLoading: true })
    login(data).then(res => {
      this.setState(state => ({
        btnShow: false,
        statusStyle: Object.assign({}, state.statusStyle, { width: '320px' }),
      }))

      setToken(res.data.token)

      setTimeout(() => {
        this.props.history.push('/')
      }, 300)
    }).catch(error => {
      switch(error.code){
        case 4010:
          // 用户名与密码不匹配
          this.props.onClose()
          break
        case 4007:
          // 拼图验证失败
          this.setState(state => ({
            offset: 0,
            jigsawLeft: 0,
            btnStyle: Object.assign({}, state.btnStyle, { left: 0 + 'px', transition: 'left 1s' }),
            statusStyle: Object.assign({}, state.statusStyle, { width: '40px', background: '#F56C6C', transition: 'width 1s' }),
          }), () => {
            this.setState({ verifyLoading: false })
          })
          this.handleGetCaptcha()
          break
        default:
          this.props.onClose()
      }
    })
  }

  componentDidMount(){
    this.handleGetCaptcha()
  }

  render(){
    const { jigsawLeft, loadedNum, statusStyle, btnStyle, btnShow, imgLoading } = this.state

    return (
      <CaptchaWrapper btnShow={btnShow}>
        <header>
          <div className="header-left">
            <span>完成拼图验证</span>
            <span className="switch" onClick={this.handleGetCaptcha}>换一张</span>
          </div>
          <div className="header-right">
            <SvgIcon iconClass="close" style={{ cursor: 'pointer' }} onClick={this.handleClose}></SvgIcon>
          </div>
        </header>
        <div className="captcha-container">
          {
            loadedNum !== 2 ?
            <div className="loading-mask">
              <Loading data-loading={imgLoading}></Loading>
              { imgLoading ? null : <span className="img-error">验证码图片加载失败</span> }
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
                { !btnShow ? '拼接成功' : null }
              </div>
              <div className="track">向右滑动完成拼图</div>
            </div>
          </div>
        </div>
      </CaptchaWrapper>
    )
  }
}

export default withRouter(Captcha)
