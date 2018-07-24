import * as React from "react";
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";

const { Button, Grid, Menu, Segment, Loader } = Semantic;
const { Row, Column } = Grid;

export default class EngineeringRound extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public readonly CLASS_NAME = "EngineeringRound";

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
    // 
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
                            <h1>round two: build the solution</h1>
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
