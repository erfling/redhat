import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { RoleName } from '../../../shared/models/UserModel';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;
import DeepProxy from "../../../shared/entity-of-the-state/DeepProxy";


class PeopleRound extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance(this);

    public static CLASS_NAME = "PeopleRound";

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
            console.log("huh?", this.state, SubRnd.WrappedComponent.CLASS_NAME)

            return <>
                <Column width={16} centered>
                    <Grid centered>
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