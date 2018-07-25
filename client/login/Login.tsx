import * as React from "react";
import { RouteComponentProps, withRouter, Route, Redirect, Switch } from "react-router";
import LoginCtrl from './LoginCtrl';
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import ComponentVO from '../../shared/base-sapien/client/ComponentsVO';
import AdminLogin from "./AdminLogin";
import Join from "./Join";
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
                <Grid
                    verticalAlign="middle"
                    padded={true}
                    columns={16}
                >
                    <Switch>
                        <Route path="/login/admin" component={AdminLogin} />
                        <Route path="/login/join" component={Join} />
                        <Redirect from="/login" exact to="/login/admin" />

                    </Switch>
                </Grid>
        </Container>;
        } else {
            return <h1>Finding you</h1>
        }
    }

}