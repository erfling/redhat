import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router, BrowserRouter } from 'react-router-dom';
import App from './App';
import { Link, Route } from "react-router-dom";
import "./style/style.scss";

const app = document.createElement('div');
document.body.appendChild(app);
ReactDOM.render(
    <BrowserRouter><App/></BrowserRouter>,
    app
);