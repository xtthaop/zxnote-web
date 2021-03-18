import styled from 'styled-components'
import { sidebarWidth } from '../Sidebar/style'
import { notelistWidth } from '../Notelist/style'

const otherWidth = (parseInt(sidebarWidth) + parseInt(notelistWidth)) + 'px'

export const EditorWrapper = styled.div`
  width: calc(100% - ${otherWidth});
  height: 100%;
  background: #fffff9;
`