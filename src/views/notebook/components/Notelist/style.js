import styled from 'styled-components'

const borderColor = '#eee'

export const NotelistWrapper = styled.div`
  width: 300px;
  height: 100%;
  overflow-y: scroll;
  background: #fff;
`

export const UpCreateBtn = styled.div`
  width: 100%;
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid ${borderColor};
  cursor: pointer;
`

export const Notes = styled.ul`
  width: 100%;

  li{
    height: 50px;
    border-bottom: 1px solid ${borderColor};
    padding: 5px 20px;

    .title{
      line-height: 30px;
      font-weight: 500;
    }

    .update-time{
      line-height: 20px;
      font-size: 12px;
    }
  }
`
