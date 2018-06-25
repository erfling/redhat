import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import Game from '../game/Game';
import { Grid, Sidebar, Menu, Segment } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter} from "react-router";
import { Route, Link } from "react-router-dom";
import AdminCtrl from './AdminCtrl';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState'
import AdminViewModel from '../../shared/models/AdminViewModel';

class Admin extends React.Component<RouteComponentProps<any>, AdminViewModel & ICommonComponentState & {ComponentFistma?: FiStMa<any>} >
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: AdminCtrl;

    public static CLASS_NAME = "Admin"



    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.controller = AdminCtrl.GetInstance(this);
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
        if(this.state && this.controller.ComponentFistma){
            const DashBoardComponent = this.controller.ComponentFistma.currentState;
            console.log("DB COMPONENT", DashBoardComponent.WrappedComponent.name)
            return <>
                <DashBoardComponent/>
            </>;
        }

        return <Segment
            loading
        ></Segment>
    }

}

export default withRouter(Admin);
// {this.state && this.state.Users && <h1>{this.state.Users.length} Users</h1>}
//{this.state && this.state.Games && <h1>{this.state.Games.length} Games</h1>}