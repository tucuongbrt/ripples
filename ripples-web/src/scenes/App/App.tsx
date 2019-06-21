import React, { Component } from 'react';
import Ripples from '../Ripples/Ripples';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SoiRisk from '../SoiRisk/SoiRisk';
import TextMessages from '../TextMessages/TextMessages';
import OAuth2RedirectHandler from '../../components/OAuth2RedirectHandler'
import NoLoginPermission from '../NoLoginPermission/NoLoginPermission';
const {NotificationContainer} = require('react-notifications');
import '../../styles/main.css'

class App extends Component {
  render() {
    return (
      <>
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Ripples}/>
          <Route path='/soirisk' exact={true} component={SoiRisk}/>
          <Route path='/messages/text' exact={true} component={TextMessages}/>
          <Route path="/no-login-permission" exact={true} component={NoLoginPermission}/>
          <Route path="/oauth2/redirect" component={OAuth2RedirectHandler}/>
        </Switch>
      </Router>
      <NotificationContainer/>
      </>
    )
  }
}

export default App;