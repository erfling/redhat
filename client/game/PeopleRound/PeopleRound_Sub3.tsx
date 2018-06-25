import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;


class PeopleRound_Sub3 extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: PeopleRoundCtrl;

    public static CLASS_NAME = "PeopleRound_Sub3";

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.controller = PeopleRoundCtrl.GetInstance();
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
        if (this.state) {
            return <>
                <h1>Round One-C: round1c</h1>
                {this.state.IndividualContributorContent && this.state.IndividualContributorContent.map((c, i) =>
                    <EditableContentBlock
                        onSaveHandler={this.controller.updateICContent.bind(this.controller)}
                        onRemoveHandler={this.controller.removeRoundContent.bind(this.controller)}
                        Content={c}
                        key={i}
                        idx={i}
                    />
                )}
                <Row>
                    <Button
                        onClick={() => this.controller.addRoundContent()}
                    >Add Content</Button>
                </Row>
            </>;
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(PeopleRound_Sub3);