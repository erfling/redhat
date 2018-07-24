import * as React from "react";
import { Grid, Sidebar, Menu, Segment } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter, Switch, Route } from "react-router";
import { BrowserRouter } from 'react-router-dom';
import AdminCtrl from './AdminCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import UserList from "./UserList";
import GameList from "./GameList";

class Admin extends BaseComponent<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel} >
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    public static CLASS_NAME = "Admin";

    public static CONTROLLER = AdminCtrl;

    controller: AdminCtrl = AdminCtrl.GetInstance(this);


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        
        this.state = this.controller.dataStore;
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
        if (this.state && this.controller.ComponentFistma){
            const DashBoardComponent = this.controller.ComponentFistma.currentState;
            console.log("DB COMPONENT", DashBoardComponent.WrappedComponent.name)
            return <>
                <h1>Admin</h1>
                <Route exact path="/admin/userlist" component={UserList} />
                <Route exact path="/admin/gamelist" component={GameList} />
            </>;
        }

        return <Segment
            loading
        ></Segment>
    }

}

export default withRouter(Admin);
// {this.state && this.state.Users && <h1>{this.state.Users.length} Users</h1>}game: ComponentsVO.Game,
            //admin: ComponentsVO.Admin,
            //login: ComponentsVO.Login
//{this.state && this.state.Games && <h1>{this.state.Games.length} Games</h1>}