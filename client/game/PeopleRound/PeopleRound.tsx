import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import { Route } from 'react-router-dom';
import Priorities from "./Priorities";
import Hiring from "./Hiring";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class PeopleRound extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "PeopleRound";

    public static CONTROLLER = PeopleRoundCtrl;

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance(this);

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
    componentDidMount(){
        super.componentDidMount();
        if(this.props.location && this.props.location.pathname && this.props.location.pathname.toLocaleUpperCase().indexOf("GAME") != -1){
            GameCtrl.GetInstance().ChildController = this.controller;
            GameCtrl.GetInstance().dataStoreDeepProxy.addOnChange(this.controller.dataStoreChange.bind(this.controller))
            console.log("BASE CONTROLLER IN BASE COMPONENT IS:", (GameCtrl.GetInstance().ChildController));
        }
    }

    render() {
        if (this.state && this.controller.ComponentFistma) {
            return <>
                <Grid>
                    <Column
                        className="content-block"
                        width={16}
                    >
                        <Row
                            style={{
                                marginBottom: '-10px'
                            }}
                        >
                            <h1>round one: build the team: {this.state.ApplicationState.MobileWidth}</h1>
                        </Row>
                    </Column>
                        <Route exact path="/game/peopleround/" component={Priorities} />
                        <Route path="/game/peopleround/priorities" component={Priorities} />
                        <Route path="/game/peopleround/hiring" component={Hiring} />                    
                </Grid> 
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}