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
                </Menu.Item>
            </Sidebar>
        </>;
    }

}

export default withRouter(Admin);