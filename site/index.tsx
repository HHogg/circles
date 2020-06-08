import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import URLState from './components/URLState';
import './index.css';

const rootElement = document.getElementById('Root');

if (rootElement) {
  render(
    <BrowserRouter>
      <URLState>
        <App />
      </URLState>
    </BrowserRouter>, rootElement
  );
}
