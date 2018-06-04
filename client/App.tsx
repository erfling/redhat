import * as React from "react";
import Admin from './admin/Admin';
import Game from './game/Game';
import Login from './login/Login';

export default class App extends React.Component<{}, any>
{

    render() {
        return  <>
            <Game/>
        </>           
    }
}
//            <Login/>
