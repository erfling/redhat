import * as React from "react";
import { RouteComponentProps, withRouter, Route } from "react-router";
import LoginCtrl from './LoginCtrl';
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;

class Login extends React.Component<RouteComponentProps<any>, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Login";
    
    public static CONTROLLER = LoginCtrl;
    
    controller: LoginCtrl = new LoginCtrl(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.state = this.controller.dataStore;
    }

    componentWillMount() {
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
        if (this.state && this.controller.ComponentFistma) {
            const ComponentFromState: any = this.controller.ComponentFistma.currentState
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

export default withRouter(Login);