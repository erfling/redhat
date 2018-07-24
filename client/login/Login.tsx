import * as React from "react";
import LoginCtrl from './LoginCtrl';
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

export default class Login extends BaseComponent<any, IControllerDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public readonly CLASS_NAME = "Login";
    
    public static CONTROLLER = LoginCtrl;
    
    controller: LoginCtrl = LoginCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);

        this.state = this.controller.dataStore;
    }

    componentDidMount() {
        super.componentDidMount();
        window.history.pushState({}, "", "/" + this.constructor.name.toLowerCase());
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
        if (this.state && this.state.ComponentFistma) {
            const ComponentFromState: any = this.state.ComponentFistma.currentState
        return <Container
            fluid={true}
        >
            <Grid
                verticalAlign="middle"
                padded={true}
                columns={16}
            >
                <ComponentFromState/>
            </Grid>
        </Container>;
        } else {
            return <h1>Finding you</h1>
        }
    }

}
