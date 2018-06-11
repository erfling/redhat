import * as React from "react";
import { RouteComponentProps, withRouter, Route } from "react-router";
import GameLogin from './GameLogin';
import AdminLogin from './AdminLogin';
import FirstLogin from './FirstLogin';
import { Grid, Menu, Container, Button } from 'semantic-ui-react';
const { Column, Row } = Grid;

class Login extends React.Component<RouteComponentProps<any>, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------



    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

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
        return <Container
            fluid={true}
        >
            <Grid
                verticalAlign="middle"
                centered
                padded={true}
                columns={16}
            >
                <Route path="/login/game" component={GameLogin} exact />
                <Route path="/login/join" component={FirstLogin} exact />
                <Route path="/login/admin" component={AdminLogin} exact/>
            </Grid>
        </Container>;
    }

}

export default withRouter(Login);