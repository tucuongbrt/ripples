import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler'
import NoLoginPermission from './scenes/NoLoginPermission/NoLoginPermission'
import Ripples from './scenes/Ripples/Ripples'
import SoiRisk from './scenes/SoiRisk/SoiRisk'
import TextMessages from './scenes/TextMessages/TextMessages'
const { NotificationContainer } = require('react-notifications')
import './styles/main.css'

class App extends Component {
  public render() {
    return (
      <>
        <Router>
          <Switch>
            <Route path="/" exact={true} component={Ripples} />
            <Route path="/soirisk" exact={true} component={SoiRisk} />
            <Route path="/messages/text" exact={true} component={TextMessages} />
            <Route path="/no-login-permission" exact={true} component={NoLoginPermission} />
            <Route path="/oauth2/redirect" component={OAuth2RedirectHandler} />
          </Switch>
        </Router>
        <NotificationContainer />
      </>
    )
  }
}

export default App
