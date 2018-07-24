import * as React from "react";
import { Grid, Sidebar, Menu, Segment } from 'semantic-ui-react';
const { Row, Column } = Grid;
import AdminCtrl from './AdminCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

export default class Admin extends BaseComponent<any, IControllerDataStore & {Admin: AdminViewModel} >
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CONTROLLER = AdminCtrl;

    public readonly CLASS_NAME = "Admin";

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
        if (this.state && this.controller.ComponentFistma){
            const DashBoardComponent = this.controller.ComponentFistma.currentState; 
            console.log("DB COMPONENT", DashBoardComponent.name)
            return <>
                <DashBoardComponent/>
            </>;
        }

        return <Segment
            loading
        ></Segment>
    }

}

// {this.state && this.state.Users && <h1>{this.state.Users.length} Users</h1>}
//{this.state && this.state.Games && <h1>{this.state.Games.length} Games</h1>}