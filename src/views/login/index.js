import React from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { message } from '@/components/message'
import Captcha from './components/Captcha'
import { LoginWrapper } from './style'

class Login extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      form: {
        username: '',
        password: '',
      },
      showCaptcha: false,
    }
    this.handleChangeUsername = this.handleChangeUsername.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose(){
    this.setState({
      showCaptcha: false
    })
  }

  handleChangeUsername(val){
    this.setState({ 
      form: Object.assign({}, this.state.form, { username: val })
    })
  }

  handleChangePassword(val){
    this.setState({
      form: Object.assign({}, this.state.form, { password: val })
    })
  }

  handleLogin(){
    const { form } = this.state 

    if(!form.username){
      message.error('请输入用户名！')
      return
    }

    if(!form.password){
      message.error('请输入密码！')
      return
    }

    this.setState({ showCaptcha: true })
  }

  render(){
    const { form, showCaptcha } = this.state 
    return (
      <LoginWrapper>
        <div className="login-form-container">
          <div className="head">知行笔记</div>
          <div className="form">
            <Input 
              placeholder="用户名" 
              value={form.username} 
              onChange={this.handleChangeUsername}
            ></Input>
            <Input 
              placeholder="密码" 
              type="password"
              value={form.password} 
              onChange={this.handleChangePassword} 
              style={{ marginTop: '20px' }}
            ></Input>
            <Button 
              type="primary" 
              onClick={this.handleLogin} 
              style={{ marginTop: '25px', width: '100%' }}
            >登 录</Button>
          </div>
          {
            showCaptcha ? 
            <div className="captcha-wrapper">
              <Captcha onClose={this.handleClose} formData={form}></Captcha>
            </div> : null
          }
        </div>
      </LoginWrapper>
    )
  }
}

export default Login
