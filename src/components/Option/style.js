import styled from 'styled-components'

export const OptionItemWrapper = styled.li`
  padding: 10px;
  cursor: pointer;
  color: #333;
  font-size: 15px;
  background: ${props => props.active ? '#1e90ff12' : '#fff'};

  &:hover{
    background: #efefef;
  }
`
