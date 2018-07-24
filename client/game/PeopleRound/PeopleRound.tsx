import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import GameCtrl from "../GameCtrl";

const { Grid, Segment } = Semantic;
const { Row, Column } = Grid;

class PeopleRound extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
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
                            <h1>round one: build the team: {this.state.ApplicationState.MobileWidth}</h1>
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

export default withRouter(PeopleRound);