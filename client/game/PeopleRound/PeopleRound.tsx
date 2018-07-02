import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import { RoleName } from '../../../shared/models/UserModel';
const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;


class PeopleRound extends React.Component<RouteComponentProps<any>, RoundModel>
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

            return <>
                {this.state.CurrentUser && this.state.CurrentUser.Role == RoleName.ADMIN && 
                    <Button
                        onClick={e => this.controller.dataStore.CurrentUser.IsLeader = !this.controller.dataStore.CurrentUser.IsLeader}
                    >
                        Show {this.state.CurrentUser.IsLeader ? "IC" : "Leader"} Content
                    </Button>
                }
                <Row>
                    <Column computer={12} mobile={16} tablet={16}>
                        <h3>Round One: Build the Team</h3>
                    </Column>
                </Row>
                <Grid>
                    <SubRnd/>
                </Grid>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(PeopleRound);