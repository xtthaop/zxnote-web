import styled, { keyframes } from 'styled-components'

const loading = keyframes`
  from{
    transform: rotate(0deg);
  }

  to{
    transform: rotate(360deg);
  }
`

export const LoadingWrapper = styled.div`
  width: 100%;
  font-size: ${props => props.fontSize ? props.fontSize : '20px'};
  text-align: center;
  padding: 15px 0;
  display: ${props => props['data-loading'] ? 'block' : 'none'};

  .loading{
    display: 'inline-block';
    animation: ${loading} 1s linear infinite;
  }
`
