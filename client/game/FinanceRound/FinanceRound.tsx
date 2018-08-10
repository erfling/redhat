import * as React from "react";
import FinanceRoundCtrl from "./FinanceRoundCtrl";
import { Route, Switch, Redirect } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import Pricing from "./Pricing";
import AcquisitionStructure from "./AcquisitionStructure";
import Bid from "./Bid";
import TeamRating from "./TeamRating";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class FinanceRound extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    
    public static CLASS_NAME = "FinanceRound";

    public static CONTROLLER = FinanceRoundCtrl;
    
    controller: FinanceRoundCtrl = FinanceRoundCtrl.GetInstance(this);

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
        console.log("BASE CONTROLLER IN BASE COMPONENT IS:", (GameCtrl.GetInstance().ChildController));

        if(this.props.location && this.props.location.pathname && this.props.location.pathname.toLocaleUpperCase().indexOf("GAME") != -1){
            GameCtrl.GetInstance().ChildController = this.controller;
            GameCtrl.GetInstance().dataStoreDeepProxy.addOnChange(this.controller.dataStoreChange.bind(this.controller))
            console.log("BASE CONTROLLER IN BASE COMPONENT IS:", (GameCtrl.GetInstance().ChildController));
        }
    }

    componentWillUnmount(){
        console.warn("FACILITATION WILL UNMOUNT")
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
                            <h1>ROUND FOUR<br/> Finance</h1>
                        </Row>
                    </Column>
                    <Switch>
                        <Route path="/game/financeround/pricing" component={Pricing} />
                        <Route path="/game/financeround/teamrating" component={TeamRating} />
                        <Route path="/game/financeround/bid" component={Bid} />                
                        <Route path="/game/financeround/acquisitionstructure" component={AcquisitionStructure} />
                        <Redirect exact from="/game/financeround" to="/game/financeround/pricing" />
                    </Switch>

                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }


}