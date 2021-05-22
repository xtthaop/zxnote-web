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
      username: '',
      password: '',
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
    this.setState({ username: val })
  }

  handleChangePassword(val){
    this.setState({ password: val })
  }

  handleLogin(){
    const { username, password } = this.state 

    // if(!username){
    //   message.error('请输入用户名！')
    //   return
    // }

    // if(!password){
    //   message.error('请输入密码！')
    //   return
    // }

    this.setState({ showCaptcha: true })

    const data = {
      username,
      password
    }

    console.log(data)
  }

  render(){
    const { username, password, showCaptcha } = this.state 
    return (
      <LoginWrapper>
        <div className="login-form-container">
          <div className="head">知行笔记</div>
          <div className="form">
            <Input 
              placeholder="用户名" 
              value={username} 
              onChange={this.handleChangeUsername}
            ></Input>
            <Input 
              placeholder="密码" 
              type="password"
              value={password} 
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
              <Captcha onClose={this.handleClose}></Captcha>
            </div> : null
          }
        </div>
      </LoginWrapper>
    )
  }
}

export default Login
