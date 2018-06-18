import * as React from "react";
import { RouteComponentProps, withRouter, Route } from "react-router";
import LoginController from './LogtinCtrl'
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;

class Login extends React.Component<RouteComponentProps<any>, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: any


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.controller = new LoginController(this);
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
        if (this.state && this.state.ComponentFistma) {
            const ComponentFromState: any = this.state.ComponentFistma.currentState
        return <Container
            fluid={true}
        >
            <Grid
                verticalAlign="middle"
                centered
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