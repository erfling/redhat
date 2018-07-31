import * as React from "react";
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { Route, Switch, Redirect } from "react-router";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import EngineeringSub from "./EngineeringSub";

const { Button, Grid, Menu, Segment, Loader } = Semantic;
const { Row, Column } = Grid;

export default class EngineeringRound extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "EngineeringRound";

    public static CONTROLLER = EngineeringRoundCtrl;
    
    controller: EngineeringRoundCtrl = EngineeringRoundCtrl.GetInstance(this);

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
                            <h1>Round Two<br/> Build the Solution</h1>
                        </Row>
                    </Column>
                    <Switch>
                        <Route path="/game/engineeringround/engineeringsub" component={EngineeringSub} />
                        <Redirect exact from="/game/engineeringround/" to="/game/engineeringround/engineeringsub" />
                    </Switch>
                                    
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}
