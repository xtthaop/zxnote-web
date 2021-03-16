import styled from 'styled-components'

export const SidebarWrapper = styled.div`
  width: 230px;
  height: 100%;
  background: #555;
  overflow-y: auto;
`

export const Header = styled.div`
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 20px 0;
  font-size: 20px;
  color: #1E90FF;
  letter-spacing: 2px;
  text-align: center;
`

export const CreateButton = styled.div`
  width: 100%;
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  color: #fff;
  box-sizing: border-box;
  cursor: pointer;
`

export const Categories = styled.ul`
  width: 100%;
  color: #fff;
  box-sizing: border-box;

  li{
    height: 30px;
    line-height: 30px;
    padding: 5px 20px;
  }
`
