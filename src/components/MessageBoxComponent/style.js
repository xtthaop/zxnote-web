import styled from 'styled-components'

function switchColor(type){
  switch(type){
    case 'success':
      return '#42c02e'
    case 'primary':
      return '#409EFF'
    case 'warning':
      return '#E6A23C'
    default:
      return '#999'
  }
}

export const MessageBoxWrapper = styled.div`
  width: 100%;

  .mask-enter{
    opacity: 0;
  }

  .mask-enter-active{
    opacity: 0.6;
    transition: opacity 200ms;
  }

  .mask-exit{
    opacity: 0.6;
    transition: opacity 200ms;
  }

  .mask-exit-active{
    opacity: 0;
    transition: opacity 200ms;
  }

  .content-enter{
    opacity: 0;
    transform: translate(0, -10px);
  }

  .content-enter-active{
    opacity: 1;
    transform: translate(0, 0);
    transition: all 300ms;
  }

  .content-exit{
    opacity: 1;
    transform: translate(0, 0);
  }

  .content-exit-active{
    opacity: 0;
    transform: translate(0, -10px);
    transition: opacity 50ms;
  }
`
export const MessageBoxMask = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  opacity: 0.6;
  z-index: 1000;
`

export const MessageBoxContentWrapper = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
`

export const MessageBoxContent = styled.div`
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translate(-50%, 0);
  width: 390px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;

  .messagebox-head-wrapper{
    width: 100%;

    & > div{
      padding: 15px 20px 10px;
      font-weight: 500;

      .svg-icon{
        color: ${props => switchColor(props.type)}
      }
    }
  }

  .messagebox-content-wrapper{
    width: 100%;

    & > div{
      padding: 25px 20px;
      line-height: 25px;
    }
  }

  .messagebox-footer-wrapper{
    width: 100%;
    text-align: right;

    & > div{
      padding: 0px 20px 20px 20px;
    }
  }
`
