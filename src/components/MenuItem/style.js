import styled from 'styled-components'

export const MenuItemWrapper = styled.li`
  width: 100%;
  padding: 5px 10px;
  box-sizing: border-box;
  color: #333;
  text-align: left;
  border-bottom: 1px solid #ddd;

  &:hover{
    background: #5f5f5f;
    color: #fff;
  }

  &:first-child{
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  &:last-child{
    border-bottom: none;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`