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
    line-height: 15px;
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
      width: calc(100% + 10px);
      height: 100%;
      margin: 0 -5px;
      background: #fff;
      z-index: 3;
    }

    .captcha{
      width: 100%;

      .captcha-img-container{
        position: relative;
        width: 320px;
        height: 140px;

        #jigsaw{
          position: absolute;
          top: 0;
        }
      }

      .slider-container{
        position: relative;
        width: 100%;
        height: 50px;
        padding: 15px 0 5px;

        .btn{
          display: ${ props => props.btnShow ? 'block' : 'none' };
          position: absolute;
          width: 40px;
          height: 40px;
          background: #fff;
          box-shadow: 1px 1px 6px 1px #a1c6ec;
          border-radius: 100%;
          text-align: center;
          cursor: pointer;
          z-index: 2;

          .arrow-icon{
            font-size: 20px;
            height: 40px;
            color: #409EFF;
          }
        }

        .status{
          position: absolute;
          height: 36px;
          margin: 2px 0;
          line-height: 36px;
          text-align: center;
          border-radius: 18px;
          font-size: 14px;
          color: #fff;
        }

        .track{
          width: 100%;
          height: 36px;
          margin: 2px 0;
          line-height: 36px;
          text-align: center;
          background: #fff;
          box-shadow: inset 0 0 30px 1px #eee;
          border-radius: 18px;
          font-size: 14px;
          color: #999;
          user-select: none;
        }
      }
    }
  }
`
