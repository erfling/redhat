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
        GameCtrl.GetInstance().CurrentComponent = this;
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
                <Column width={16}>
                    <Grid>
                        <Column mobile={16} tablet={12} computer={8} largeScreen={6} >
                            <Row>
                                <Column computer={12} mobile={16} tablet={16}>
                                    <h3>Round One: Build the Team</h3>
                                </Column>
                            </Row>
                            <Grid>
                                <SubRnd />
                            </Grid>
                        </Column>
                    </Grid>
                </Column>

            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(PeopleRound);