import styled, { keyframes } from 'styled-components'

function switchColor(type){
  switch(type){
    case 'success':
      return '#42c02e'
    case 'primary':
      return '#409EFF'
    default:
      return '#999'
  }
}

const loading = keyframes`
  from{
    transform: rotate(0deg);
  }

  to{
    transform: rotate(360deg);
  }
`

export const ButtonWrapper = styled.button`
  display: inline-block;
  text-align: center;
  height: 30px;
  line-height: 20px;
  padding: 4px 12px;
  border: 1px solid ${props => switchColor(props.type)};
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  white-space: nowrap;
  user-select: none;
  background: #fff;
  color: ${props => switchColor(props.type)};
  outline: none;

  .loading{
    display: ${props => props['data-loading'] ? 'inline-block' : 'none'};
    margin-right: 6px;
    animation: ${loading} 1s linear infinite;
  }
`
