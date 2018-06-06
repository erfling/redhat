import * as React from "react";
import Admin from './admin/Admin';
import Game from './game/Game';
import Login from './login/Login';
import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";

export default class App extends React.Component<{}, any>
{

    render() {
        return <Switch>
                <Route exact path="/" render={(renderProps) => (
                    <div>
                        <h1>You are in root.</h1>
                        <Link to="/game">Go to Game</Link>
                        <Link to="/login">Go to Login</Link>
                        <Link to="/admin">Go to Admin</Link>
                    </div>
                    
                )} />
                <Route path="/game" component={Game} />
                <Route path="/login" component={Login} />
                <Route path="/admin" component={Admin} />
                <Redirect from="*" to="/" />
            </Switch>
    }
}
//            <Login/>
