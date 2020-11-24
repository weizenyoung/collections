import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App {...window.initialData} />
  </React.StrictMode>,
  document.getElementById('root')
);