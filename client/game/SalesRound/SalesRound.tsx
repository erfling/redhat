import * as React from "react";
import SalesRoundCtrl from "./SalesRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";

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

        GameCtrl.GetInstance().CurrentComponent = this;
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
            const SubRnd = this.controller.ComponentFistma.currentState;

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
                    <SubRnd />
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}
