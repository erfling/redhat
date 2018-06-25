import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import ContentBlock from "../../../shared/models/ContentBlock";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import SubRoundModel from "../../../shared/models/SubRoundModel";
const { Button, Grid, Menu, Segment } = Semantic;
const { Row, Column } = Grid;


class Hiring extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance();

    public static CLASS_NAME = "Hiring";

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
        if (this.state) {

            let ICContent: ContentBlock[] = []; 
            if(this.state.SubRounds){
                var subRound = this.state.SubRounds.filter(s => s.Name.toUpperCase() == Hiring.CLASS_NAME.toUpperCase())[0];
                if(subRound)ICContent = subRound.IndividualContributorContent;
            }

            return <>
                <h1>Round One-A: round1a</h1>
                {ICContent && ICContent.map((c, i) =>
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

export default withRouter(Hiring);