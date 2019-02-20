import React, { Component } from 'react';
import Ripples from '../Ripples/Ripples';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SoiRisk from '../SoiRisk/SoiRisk';
import Home from './Home';
import TextMessages from '../TextMessages/TextMessages';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Home}/>
          <Route path='/ripples' exact={true} component={Ripples}/>
          <Route path='/soirisk' exact={true} component={SoiRisk}/>
          <Route path='/messages/text' exact={true} component={TextMessages}/>
        </Switch>
      </Router>
    )
  }
}

export default App;