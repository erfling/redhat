import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
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
        this.controller.getContentByRound("PEOPLE");
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
                <Row>
                    <Column computer={12} mobile={16} tablet={16}>
                        <h1>Round One: Build the Team</h1>
                    </Column>
                </Row>
                <Grid
                    padded={true}
                >
                    <SubRnd/>
                </Grid>
                <Row>
                    Form content goes here
                </Row>
            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(PeopleRound);