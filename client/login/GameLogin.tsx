import * as React from "react";
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;
import { Route, Switch, RouteComponentProps, withRouter } from "react-router";
import LoginCtrl from './LoginCtrl';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";

class GameLogin extends React.Component<RouteComponentProps<any>, IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "GameLogin";
    
    public static CONTROLLER = LoginCtrl;
    
    controller: LoginCtrl = LoginCtrl.GetInstance(this);

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