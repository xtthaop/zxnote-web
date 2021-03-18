import styled from 'styled-components'
import { sidebarWidth } from '../Sidebar/style'
import { notelistWidth } from '../Notelist/style'

const otherWidth = (parseInt(sidebarWidth) + parseInt(notelistWidth)) + 'px'

export const EditorWrapper = styled.div`
  width: calc(100% - ${otherWidth});
  height: 100%;
  background: #fffff9;
`

export const TitleWrapper = styled.div`
  width: 100%;
  height: 70px;

  .save-status{
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    padding-right: 5px;
    color: #ccc;
    text-align: right;
  }

  .custom-input{
    width: 100%;
    height: calc(100% - 20px);
    border: none;
    background: transparent;
    padding: 0 30px 15px;
    font-size: 30px;
    outline: none;
    margin: 0;
    box-sizing: border-box;
  }
`

export const ToolBar = styled.ul`
  width: 100%;
  background: #ccc;
  padding: 0 10px;
  box-sizing: border-box;

  &:after, &:before{
    content: "";
    display: table;
    clear: both;
  }

  li.tool{
    display: inline-block;
    color: #555;
    font-size: 16px;
    padding: 8px;
    vertical-align: top;

    &.right{
      float: right;
    }

    .release{
      display: inline-block;
      height: 16px;
      line-height: 16px;
      vertical-align: 0.05em;
      font-size: 13px;
      margin-left: 5px;
    }
  }
`
