import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App/App';
import URLState from './URLState/URLState';

export default () => {
  return (
    <BrowserRouter>
      <URLState>
        <Switch>
          <Route component={ App } path="/" />
        </Switch>
      </URLState>
    </BrowserRouter>
  );
};
