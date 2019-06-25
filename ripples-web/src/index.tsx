import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from 'redux-starter-kit'
import ripplesReducer from './redux/reducers/ripples.reducer'
import App from './scenes/App/App'

const store = configureStore({
  reducer: ripplesReducer,
})

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
