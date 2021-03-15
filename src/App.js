import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import GlobalStyle from '@/style'

import Notebook from '@/views/notebook'

class App extends React.Component {
  render() {
    return (
      <div>
        <GlobalStyle></GlobalStyle>
        <Router>
          <Route path="/notebook"><Notebook></Notebook></Route>
        </Router>
      </div>
    )
  }
}

export default App
