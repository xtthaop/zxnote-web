import styled from 'styled-components'

export const DropdownWrapper = styled.div`
  position: relative;

  .handle{
    display: inline-block;
  }
`

export const DropdownFrame = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  right: 0;
  margin-top: 5px;
  width: 130px;
  background: #fff;
  border-radius: 6px;
`