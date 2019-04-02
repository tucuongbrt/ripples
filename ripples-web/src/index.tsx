import React from "react";
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import App from "./scenes/Home/App";
import { Provider } from 'react-redux'
import { configureStore } from 'redux-starter-kit'
import ripplesReducer from './redux/reducers/ripples.reducer'

const store = configureStore({
  reducer: ripplesReducer,
})


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, 
  document.getElementById("root")
);