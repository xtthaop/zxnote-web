import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import GlobalStyle from '@/style'

import Notebook from '@/views/notebook'
import Page404 from '@/views/errorpage/404'

class App extends React.Component {
  render() {
    return (
      <div>
        <GlobalStyle></GlobalStyle>
        <Router>
          <Switch>
            <Route path="/notebook" exact><Notebook></Notebook></Route>
            <Route path="/404" exact><Page404></Page404></Route>
            <Route path="*"><Page404></Page404></Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
