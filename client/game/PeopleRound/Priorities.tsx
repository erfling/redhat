import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import RoundContent from "../RoundContent";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;


class Priorities extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance();

    public static CLASS_NAME = "Priorities";

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
        const thisSubRound = this.state.SubRounds.filter(s => s.Name.toUpperCase() == Priorities.CLASS_NAME.toUpperCase())[0]
        console.log("SUBROUND>>>>>>>>>>>>>>>>>>>>>", thisSubRound)
        if (this.state) {
            return <>
                <h1>Priority</h1>
                <RoundContent
                    CurrentUser={this.state.CurrentUser}
                    SubRound={thisSubRound}
                    onSaveHandler={this.controller.updateContent.bind(this.controller)}
                    onRemoveHandler={this.controller.removeRoundContent.bind(this.controller)}
                />
                <Row>
                    <Button
                        onClick={() => this.controller.addRoundContent(thisSubRound, this.state._id, this.state.CurrentUser.IsLeader)}
                    >Add Content</Button>
                </Row>
            </>;
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Priorities);