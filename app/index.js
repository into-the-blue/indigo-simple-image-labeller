import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
// import { configureStore, history } from './store/configureStore';
import Routes from './Routes';
import './app.global.css';
import 'antd/dist/antd.css';
// const store = configureStore();

render(
  <AppContainer>
    <Routes />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./Routes', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./Routes').default;
    render(
      <AppContainer>
        <NextRoot />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
