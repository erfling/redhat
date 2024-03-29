import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import "./style/style.scss";

const app = document.createElement('div');
document.body.appendChild(app);
ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route path="/" component={App} />
        </Switch>
    </BrowserRouter>,
    app
);