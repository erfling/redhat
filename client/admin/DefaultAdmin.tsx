import * as React from "react";
import { RouteComponentProps, withRouter} from "react-router";
import AdminCtrl from './AdminCtrl';
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

class DefaultAdmin extends BaseComponent<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "DefaultAdmin";

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
        const DashBoardComponent = this.controller.ComponentFistma.currentState;
        return <>
            {this.state.ApplicationState.CurrentUser && <h2>Welcome, {this.state.ApplicationState.CurrentUser.FirstName}</h2>}
        </>;
    }

}

export default withRouter(DefaultAdmin);