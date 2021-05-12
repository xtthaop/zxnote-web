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

function switchPadding(size){
  switch(size){
    case 'small':
      return '4px 6px'
    case 'medium':
      return '6px 8px'
    default:
      return '8px 10px'
  }
}

function switchFontSize(size){
  switch(size){
    case 'small':
      return '12px'
    case 'medium':
      return '14px'
    default:
      return '14px'
  }
}

function switchBorderRadius(shape){
  switch(shape){
    case 'round':
      return '20px'
    case 'circle':
      return '50%'
    default:
      return '4px'
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
  line-height: 1;
  padding: ${props => switchPadding(props.size)};
  border: 1px solid ${props => switchColor(props.type)};
  border-radius: ${props => switchBorderRadius(props.shape)};
  font-size: ${props => switchFontSize(props.size)};
  background: ${props => switchColor(props.type)};
  font-weight: 500;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  white-space: nowrap;
  user-select: none;
  color: #fff;
  outline: none;
  box-sizing: border-box;

  .loading{
    display: ${props => props['data-loading'] ? 'inline-block' : 'none'};
    margin-right: 6px;
    animation: ${loading} 1s linear infinite;
  }
`
