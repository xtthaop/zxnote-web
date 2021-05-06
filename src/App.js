import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import GlobalStyle from '@/style'

import Notebook from '@/views/notebook'
import Preview from '@/views/preview'
import Page404 from '@/views/errorpage/404'

class App extends React.Component {
  render(){
    return (
      <div>
        <GlobalStyle></GlobalStyle>
        <Router>
          <Switch>
            <Route path={["/", '/category/:categoryId', '/category/:categoryId/note/:noteId']} exact>
              <Notebook></Notebook>
            </Route>
            <Route path="/category/:categoryId/note/:noteId/preview" exact>
              <Preview></Preview>
            </Route>
            <Route path="*" exact><Page404></Page404></Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
