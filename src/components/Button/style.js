import styled from 'styled-components'

function switchColor(type){
  switch(type){
    case 'success':
      return '#42c02e'
    default:
      return '#999'
  }
}

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
`
