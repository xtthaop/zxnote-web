import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import GlobalStyle from '@/style'

import Notebook from '@/views/notebook'
import Page404 from '@/views/errorpage/404'

class App extends React.Component {
  render(){
    return (
      <div>
        <GlobalStyle></GlobalStyle>
        <Router>
          <Route path={["/", '/category/:categoryId', '/category/:categoryId/note/:noteId']} exact><Notebook></Notebook></Route>
          <Route path="*"><Page404></Page404></Route>
        </Router>
      </div>
    )
  }
}

export default App
