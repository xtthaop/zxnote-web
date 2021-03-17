import styled from 'styled-components'

const sidebarWidth = '230px'

export const SidebarWrapper = styled.div`
  position: relative;
  width: ${sidebarWidth};
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    line-height: 30px;
    padding: 5px 20px;
    border-left: 3px solid transparent;
    cursor: pointer;

    &.active{
      background: #666;
      border-left-color: #1E90FF;

      .handle-btn{
        display: inline;
        font-size: 12px;

        span{
          margin-left: 10px;
        }
      }
    }

    .handle-btn{
      display: none;
    }
  }
`

export const Foot = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  width: ${sidebarWidth};
  height: 50px;
  line-height: 50px;
  padding: 0 20px 10px;
  box-sizing: border-box;
  color: #999;
  background: #555;

  .icon{
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #666;
    border-radius: 50%;
  }

  .username{
    margin-left: 10px;
  }
`
