import * as React from "react";
import SalesRoundCtrl from "./SalesRoundCtrl";
import { Route, Switch, Redirect } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import DealRenewal from "./DealRenewal";
import DealStructure from "./DealStructure";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class SalesRound extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    public static CLASS_NAME = "SalesRound";

    public static CONTROLLER = SalesRoundCtrl;
    
    controller: SalesRoundCtrl = SalesRoundCtrl.GetInstance(this);

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
                            <h1>round three: make the sale</h1>
                        </Row>
                    </Column>
                    <Switch>
                        <Route path="/game/salesrounds/dealstructure" component={DealStructure} />
                        <Route path="/game/salesrounds/dealrenewal" component={DealRenewal} />
                        <Redirect exact from="/game/salesrounds" to="/game/salesrounds/dealstructure" />
                    </Switch>
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}