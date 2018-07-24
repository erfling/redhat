import * as React from "react";
import { RouteComponentProps, withRouter, Route } from "react-router";
import LoginCtrl from './LoginCtrl';
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import ComponentVO from '../../shared/base-sapien/client/ComponentsVO';
export default class Login extends BaseComponent<RouteComponentProps<any>, IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Login";
    
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

    componentDidMount() {
        super.componentDidMount();
        this.props.history.push("/" + this.constructor.name.toLowerCase());
    }

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
        if (this.state) {
        return <Container
            fluid={true}
        >
        <h1>LOGIN</h1>
            <Grid
                verticalAlign="middle"
                padded={true}
                columns={16}
            >
                <Route path="/login/admin" component={ComponentVO.AdminLogin} />
                <Route path="/login/join" component={ComponentVO.Join} />
            </Grid>
        </Container>;
        } else {
            return <h1>Finding you</h1>
        }
    }

}