import * as React from "react";
import FinanceRoundCtrl from "./FinanceRoundCtrl";
import { withRouter, RouteComponentProps, Route } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import Pricing from "./Pricing";
import AcquisitionStructure from "./AcquisitionStructure";
import Bid from "./Bid";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class FinanceRound extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
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
                            <h1>round four: finance</h1>
                        </Row>
                    </Column>

                    <Route path="/game/financeround" component={Pricing} />
                    <Route path="/game/financeround/Pricing" component={Pricing} />
                    <Route path="/game/financeround/Bid" component={Bid} />                
                    <Route path="/game/financeround/AcquisitionStructure" component={AcquisitionStructure} />

                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }


}