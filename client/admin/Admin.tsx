import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import Game from '../game/Game';
import { Grid, Sidebar, Menu } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter} from "react-router";
import { Route, Link } from "react-router-dom";
import AdminCtrl from './AdminCtrl';

class Admin extends React.Component<RouteComponentProps<any>, any>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: AdminCtrl;



    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.controller = new AdminCtrl(this);
        this.state = this.controller.dataStore;
    }

    componentWillMount() {
        console.log("ADMIN PROPS: ",this.props);
        /*
        if(!localStorage || !localStorage.getItem("rhjwt") && this.props.location.pathname.indexOf("login") == -1){
            this.props.history.push("/login/admin");
        }else {
            this.props.history.push("/admin");
        }
        */
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
        const DashBoardComponent = this.state.ComponentsFistma.currentState;
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
            <DashBoardComponent/>
        </>;
    }

}

export default withRouter(Admin);