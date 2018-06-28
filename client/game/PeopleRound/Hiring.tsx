import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import ContentBlock from "../../../shared/models/ContentBlock";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as Semantic from 'semantic-ui-react';
import SubRoundModel from "../../../shared/models/SubRoundModel";
import RoundContent from "../RoundContent"
const { Button, Grid, Menu, Segment, Dimmer, Loader } = Semantic;
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
        if (this.state && this.state.CurrentUser) {
            const thisSubRound = this.state.SubRounds.filter(s => s.Name.toUpperCase() == Hiring.CLASS_NAME.toUpperCase())[0]

            return <>
                <h1>make the hires</h1>

                <RoundContent
                    CurrentUser={this.state.CurrentUser}
                    SubRound={thisSubRound}
                    onSaveHandler={this.controller.updateContent.bind(this.controller)}
                    onRemoveHandler={this.controller.removeRoundContent.bind(this.controller)}
                    onAddContent={this.controller.addRoundContent.bind(this)}
                />
            </>;
        } else {
            return <Dimmer active>
                    <Loader>Saving</Loader>
                </Dimmer>
        }
    }

}

export default withRouter(Hiring);