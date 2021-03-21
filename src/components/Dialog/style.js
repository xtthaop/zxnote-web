import styled from 'styled-components'

export const DialogWrapper = styled.div`
  width: 100%;
`

export const DialogMask = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  opacity: 0.6;
  z-index: 1000;
`

export const DialogContentWrapper = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
`

export const DialogContent = styled.div`
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translate(-50%, 0);
  width: 390px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;

  .dialog-head-wrapper{
    width: 100%;
    border-bottom: 1px solid #ddd;

    & > div{
      padding: 15px 20px;
      font-weight: 500;
    }
  }

  .dialog-content-wrapper{
    width: 100%;

    & > div{
      padding: 25px 20px;
    }
  }

  .dialog-footer-wrapper{
    width: 100%;
    text-align: right;

    & > div{
      padding: 0px 20px 20px 20px;
    }
  }
`
