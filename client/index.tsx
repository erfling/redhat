import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import App from './App';
import { Link, Route } from "react-router-dom";
import 'semantic-ui-css/semantic.min.css';

const app = document.createElement('div');
document.body.appendChild(app);
ReactDOM.render(
    <App/>,
    app
);