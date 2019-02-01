import React, { Component } from 'react';
import Ripples from './Ripples';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SoiRisk from './SoiRisk';
import Home from './Home';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path='/' exact={true} component={Home}/>
          <Route path='/ripples' exact={true} component={Ripples}/>
          <Route path='/soirisk' exact={true} component={SoiRisk}/>
        </Switch>
      </Router>
    )
  }
}

export default App;