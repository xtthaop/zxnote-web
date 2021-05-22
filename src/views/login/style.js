import styled from 'styled-components'

export const LoginWrapper = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #eee;

  .login-form-container{
    position: relative;
    width: 300px;
    margin: 150px auto 0;
    background: #fff;
    padding: 120px 60px;
    border-radius: 10px;

    .head{
      width: 100%;
      text-align: center;
      font-size: 25px;
      font-weight: 500;
      color: #1E90FF;
      letter-spacing: 2px;
    }

    .form{
      width: 100%;
      margin-top: 30px;
    }
  }

  .captcha-wrapper{
    position: absolute;
    top: 32px;
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    height: 220px;
    padding: 10px;
    background: #fff;
    box-shadow: 0 0 2px 2px #eee;
  }
`