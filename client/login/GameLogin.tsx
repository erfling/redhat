import * as React from "react";
import UserModel from "../../shared/models/UserModel";
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;
//import * as Icons from 'react-icons/lib/io';
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import LoginCtrl from './LoginCtrl';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";

class GameLogin extends React.Component<RouteComponentProps<any>, UserModel & IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: LoginCtrl = new LoginCtrl(this);

    public static CLASS_NAME = "GameLogin";


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);        
        
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