import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler'
import KMLManager from './scenes/KMLManager/KMLManager'
import LogbookManager from './scenes/LogbookManager/LogBookManager'
import NoLoginPermission from './scenes/NoLoginPermission/NoLoginPermission'
import Ripples from './scenes/Ripples/Ripples'
import SoiRisk from './scenes/SoiRisk/SoiRisk'
import TextMessages from './scenes/TextMessages/TextMessages'
import Users from './scenes/Users/Users'
import UserProfile from './scenes/Users/UserProfile'
import Settings from './scenes/Settings/Settings'
import './styles/main.css'
import SettingsPanel from './scenes/Settings/SettingsPanel'
import AssetProfile from './scenes/Assets/AssetProfile'

const { NotificationContainer } = require('react-notifications')

class App extends Component {
  public render() {
    return (
      <>
        <Router>
          <Switch>
            <Route path="/" exact={true} component={Ripples} />
            <Route path="/risk" exact={true} component={SoiRisk} />
            <Route path="/messages/text" exact={true} component={TextMessages} />
            <Route path="/kml/manager" exact={true} component={KMLManager} />
            <Route path="/logbook/manager" exact={true} component={LogbookManager} />
            <Route path="/user/manager" exact={true} component={Users} />
            <Route path="/settings/manager" exact={true} component={Settings} />
            <Route path="/settings/panel" exact={true} component={SettingsPanel} />
            <Route path="/user/profile" exact={true} component={UserProfile} />
            <Route path="/asset/profile" exact={true} component={AssetProfile} />
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
