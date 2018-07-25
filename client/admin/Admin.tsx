import * as React from "react";
import { Grid, Sidebar, Menu, Segment } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter, Switch, Route, Redirect } from "react-router";
import { BrowserRouter } from 'react-router-dom';
import AdminCtrl from './AdminCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import UserList from "./UserList";
import GameList from "./GameList";
import { RoleName } from "../../shared/models/UserModel";

export default class Admin extends BaseComponent<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel} >
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
        if (this.state && this.state.ApplicationState){
            return <>
                <h1>Admin</h1>
                <Switch>
                    {!this.state.ApplicationState.CurrentUser || this.state.ApplicationState.CurrentUser.Role != RoleName.ADMIN &&
                        <Redirect to="/login/admin"/>
                    }
                    <Redirect from="/admin" to="/admin/userlist"/>
                    <Route exact path="/admin/userlist" component={UserList} />
                    <Route exact path="/admin/gamelist" component={GameList} />
                </Switch>
            </>;
        }

        return <Segment
            loading
        ></Segment>
    }

}

// {this.state && this.state.Users && <h1>{this.state.Users.length} Users</h1>}game: ComponentsVO.Game,
            //admin: ComponentsVO.Admin,
            //login: ComponentsVO.Login
//{this.state && this.state.Games && <h1>{this.state.Games.length} Games</h1>}