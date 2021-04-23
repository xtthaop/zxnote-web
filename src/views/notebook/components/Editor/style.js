import styled from 'styled-components'
import { sidebarWidth } from '../Sidebar/style'
import { notelistWidth } from '../Notelist/style'

const otherWidth = (100 - (parseInt(sidebarWidth) + parseInt(notelistWidth))) + '%'

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.isPreviewMode ? '50%' : otherWidth};
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
  padding-right: 5px;
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
    padding: 8px 10px;
    vertical-align: top;
    cursor: pointer;

    &:hover{
      background: #555;
      color: #efefef;
    }

    &.right{
      float: right;
    }

    .release-text{
      display: inline-block;
      font-size: 13px;
      vertical-align: 0.05em;
      margin-left: 5px;
    }
  }
`

export const ContentWrapper = styled.textarea`
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  padding: 30px;
  background: #fffff9;
  resize: none;
  font-size: 16px;
`

export const EmptyArea = styled.div`
  flex: 1;
  width: 100%;
  background: #efefef;
`
