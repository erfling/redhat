import * as React from "react";
import AdminCtrl from './AdminCtrl';
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

export default class DefaultAdmin extends BaseComponent<any, IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CONTROLLER = AdminCtrl;

    public readonly CLASS_NAME = "DefaultAdmin";
    
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
        const DashBoardComponent = this.controller.ComponentFistma.currentState;
        return <>
            {this.state.ApplicationState.CurrentUser && <h2>Welcome, {this.state.ApplicationState.CurrentUser.FirstName}</h2>}
        </>;
    }

}
