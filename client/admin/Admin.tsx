import * as React from "react";
import { Grid, Sidebar, Menu, Segment } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter, Switch, Route, Redirect } from "react-router";
import AdminCtrl from './AdminCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import UserList from "./UserList";
import GameList from "./GameList";
import { RoleName } from "../../shared/models/UserModel";
import GameDetail from "./GameDetail";

export default class Admin extends BaseComponent<any, IControllerDataStore & {Admin: AdminViewModel} >
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

    constructor(props: any) {
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
            return <div style={{padding: '20px'}}>
                <Switch>
                    {!this.state.ApplicationState.CurrentUser || this.state.ApplicationState.CurrentUser.Role != RoleName.ADMIN &&
                        <Redirect to="/login/admin"/>
                    }
                    <Route path="/admin/userlist" component={UserList} />
                    <Route exact path="/admin/gamelist" component={GameList} />
                    <Route exact path="/admin/gamedetail/:gameid" component={GameDetail} />
                    <Redirect exact from="/admin" to="/admin/userlist"/>

                </Switch>
            </div>;
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