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
  bottom: ${ props => (props.placement === 'top' || props.placement.split('-')[0] === 'top') ? '100%' : '' };
  left: ${ props => (props.placement === 'start' || props.placement.split('-')[1] === 'start') ? 0 : '' };
  right: ${ props => (props.placement === 'end' || props.placement.split('-')[1] === 'end') ? 0 : '' };
  margin-top: 5px;
  width: 130px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
`