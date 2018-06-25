import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
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

    controller: PeopleRoundCtrl;

    public static CLASS_NAME = "PeopleRound";


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        alert("Contstructing people round")
        this.controller = new PeopleRoundCtrl(this);
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
                        <SubRnd/>
                    </Column>
                </Row>
                <Grid
                    padded={true}
                >
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