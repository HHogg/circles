import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import App from './App/App';
import URLState from './URLState/URLState';

const Site = () => {
  return (
    <URLState>
      <Switch>
        <Route component={ App } path="/" />
      </Switch>
    </URLState>
  );
};

export default hot(module)(Site);
