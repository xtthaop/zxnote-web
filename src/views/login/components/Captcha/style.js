import styled from 'styled-components'

export const CaptchaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  height: 100%;

  header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;

    .header-left .switch{
      color: #1E90FF;
      margin-left: 10px;
    }
  }

  .captcha-container{
    position: relative;
    flex: 1;
    width: 100%;

    .loading-mask{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      z-index: 1;
    }
  }

  .captcha{
    position: relative;
    width: 320px;
    height: 140px;

    #jigsaw{
      position: absolute;
      top: 0;
    }
  }
`
