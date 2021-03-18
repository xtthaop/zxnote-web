import styled from 'styled-components'

const borderColor = '#eee'

export const NotelistWrapper = styled.div`
  width: 300px;
  min-width: 300px;
  height: 100%;
  overflow-y: scroll;
  background: #fff;
  border-right: 1px solid #ccc;
  box-sizing: border-box;
`

export const UpCreateBtn = styled.div`
  width: 100%;
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid ${borderColor};
  box-sizing: border-box;
  cursor: pointer;
`

export const Notes = styled.ul`
  width: 100%;

  li{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 45px);
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid ${borderColor};
    padding: 5px 20px;
    border-left: 5px solid transparent;
    cursor: pointer;

    &.active{
      background: #eee;
      border-left-color: #1E90FF;

      .handle-btn{
        display: inline;
      }
    }

    .noteinfo{
      display: inline-block;
      width: 90%;

      .title{
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 30px;
        font-weight: 500;
      }

      .update-time{
        line-height: 20px;
        font-size: 12px;
      }
    }

    .handle-btn{
      display: none;
      width: 10%;
      font-size: 14px;
      color: #aaa;
      text-align: right;
    }
  }
`
