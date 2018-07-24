import * as React from "react";
import SalesRoundCtrl from "./SalesRoundCtrl";
import { withRouter, RouteComponentProps, Route } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";
import DealRenewal from "./DealRenewal";
import DealStructure from "./DealStructure";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class SalesRound extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
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

                    <Route path="/game/salesrounds" component={DealStructure} />
                    <Route path="/game/salesrounds/DealStructure" component={DealStructure} />
                    <Route path="/game/salesrounds/DealRenewal" component={DealRenewal} />

                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}