import styled, { keyframes } from 'styled-components'

export const MessageWrapper = styled.ul`
  position: fixed;
  left: 50%;
  top: 20px;
  transform: translate(-50%, 0);
  background: transparent;
  z-index: 1002;

  .fade-enter{
    opacity: 0;
    transform: translate(0, -50px);
  }

  .fade-enter-active{
    opacity: 1;
    transform: translate(0, 0);
    transition: all 500ms;
  }

  .fade-exit{
    opacity: 1;
    transform: translate(0, 0);
  }

  .fade-exit-active{
    opacity: 0;
    transform: translate(0, -50px);
    transition: all 500ms;
  }
`

function switchColor(type){
  switch(type){
    case 'success':
      return '#42c02e'
    case 'error':
      return '#ff4d4f'
    default:
      return null
  }
}

export const MessageItem = styled.li`
  padding: 12px 20px;
  color: #333;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
  min-width: 300px;
  box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%);
  margin-bottom: 20px;

  .icon{
    color: ${props => switchColor(props.type)};
    font-size: 18px;
    margin-right: 10px;
  }

  .message{
    font-size: 16px;
  }
`
