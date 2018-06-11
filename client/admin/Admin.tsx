import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import GameCtrl from "../game/GameCtrl";
import Game from '../game/Game';
import { Grid, Sidebar, Menu, Icon } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter, } from "react-router";
import { Route, Link } from "react-router-dom";

class Admin extends React.Component<RouteComponentProps<any>, any>
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
        console.log("ADMIN PROPS: ",this.props);
        if(!localStorage || !localStorage.getItem("rhjwt") && this.props.location.pathname.indexOf("join") == -1){
            this.props.history.push("/login/admin");
        }else {
            this.props.history.push("/admin");
        }
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
        return <>
            <Sidebar
                as={Menu}
                animation='uncover'
                width='thin'
                visible={true}
                vertical
            >
                <Menu.Item name='home'>
                    Manage Users
                    </Menu.Item>
                <Menu.Item name='home'>
                    Manage Games
                    </Menu.Item>
                <Menu.Item name='home'>
                    <Link to="/game">Edit Game Content</Link>                    
                </Menu.Item>
            </Sidebar>
            <Route path="/game" component={Game} />
        </>;
    }

}

export default withRouter(Admin);