import styled from 'styled-components'

export const MenuItemWrapper = styled.li`
  width: 100%;
  line-height: 30px;
  padding: 5px 10px;
  box-sizing: border-box;
  color: #333;
  text-align: left;
  border-bottom: 1px solid #ddd;

  &:hover{
    background: #1e90ff12;
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