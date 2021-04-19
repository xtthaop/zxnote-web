import styled from 'styled-components'

export const SelectWrapper = styled.div`
  width: 100%;
  position: relative;

  input{
    cursor: pointer;
  }

  .arrow-down{
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    color: #666;
    cursor: pointer;
  }
`

export const OptionWrapper = styled.ul`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  margin-top: 5px;
  padding: 5px 0;
  width: 100%;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 3px;
  box-sizing: border-box;
  background: #fff;
  z-index: 100;

  div.no-data{
    width: 100%;
    text-align: center;
    color: #696969;
    padding: 10px 0;
  }
`
