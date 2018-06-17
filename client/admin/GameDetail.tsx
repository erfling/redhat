import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input, Dropdown, Popup } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter } from "react-router";
import GameManagementCtrl from './GameManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import DecisionIcon from '-!svg-react-loader?name=Icon!../img/decisions.svg';
import GameModel from "../../shared/models/GameModel";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from 'moment';
import UserModel, { RoleName } from "../../shared/models/UserModel";

class GameDetail extends React.Component<RouteComponentProps<any>, AdminViewModel & ICommonComponentState>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: GameManagementCtrl;

    //alias for navigation
    static CLASS_NAME= "GameDetail"

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.controller = new GameManagementCtrl(this);
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

    componentWillMount(){
        console.log("DOES CONSTRUCTOR HAVE LOCATION?", this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
        
        
    }

    render() {
        const DashBoardComponent = this.state.ComponentFistma.currentState;
        return <>
            
            <Segment 
                clearing
                loading={this.state.IsLoading}
                style={{paddingBottom:0}}
            >   
                {this.state.SelectedGame &&
                   <pre>{JSON.stringify(this.state.SelectedGame, null, 2)}</pre>
                }
            </Segment>
            <Segment
                loading={this.state.IsLoading}
            >
               
            </Segment>
        </>;
    }

}

export default withRouter(GameDetail);