import * as React from "react";
import CustomerRoundCtrl from "./CustomerRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

export default class CustomerRound extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "CustomerRound";

    public static CONTROLLER = CustomerRound;

    controller: CustomerRoundCtrl = CustomerRoundCtrl.GetInstance(this);

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
                            <h1>round five: customer round</h1>
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
