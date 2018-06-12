import * as React from "react";
import UserModel from "../../shared/models/UserModel";
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;
//import * as Icons from 'react-icons/lib/io';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import LoginCtrl from './LogtinCtrl'

class GameLogin extends React.Component<RouteComponentProps<any>, UserModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: LoginCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);        
        this.controller = new LoginCtrl(this)
        this.state = this.controller.dataStore;
    }

    componentWillMount() {}

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    render() {
        return <></>
    }

}

export default withRouter(GameLogin);