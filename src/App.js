import { BrowserRouter as Router, Route } from 'react-router-dom'

import Notebook from './views/notebook'

class App extends React.Component {
  render() {
    return (
      <div>
        <Router>
          <Route path="/notebook"><Notebook></Notebook></Route>
        </Router>
      </div>
    )
  }
}

export default App