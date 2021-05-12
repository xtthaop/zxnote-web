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
    width: 100%;
    max-width: 300px;
    margin: 150px auto;
    background: #fff;
    padding: 50px;
    border-radius: 10px;

    .head{
      width: 100%;
      text-align: center;
      font-size: 25px;
      font-weight: 500;
      color: #1E90FF;
    }

    .form{
      width: 100%;
      margin-top: 30px;
    }
  }
`