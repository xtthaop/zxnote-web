import styled from 'styled-components'

export const SwitchWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;

  input{
    width: 0;
    height: 0;
    display: none;
  }

  label{
    position: relative;
    display: inline-block;
    width: 35px;
    height: 16px;
    background-color: ${props => props.checked ? '#1890ff' : 'gray'};
    border-radius: 35px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .switch-btn{
    position: absolute;
    width: 14px;
    height: 14px;
    top: 50%;
    left: 1px;
    background-color: #fff;
    border-radius: 14px;
    transform: translateY(-50%);
    transition: all 0.2s;
  }

  input:checked + label .switch-btn{
    left: calc(100% - 1px);
    transform: translate(-100%, -50%);
  }
`