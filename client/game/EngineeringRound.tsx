import * as React from "react";
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import RoundModel from "../../shared/models/RoundModel";
import EditableContentBlock from '../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Icon } = Semantic;
const { Row, Column } = Grid;


export default class PeopleRound extends React.Component<{}, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: EngineeringRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: {}) {
        super(props);

        this.controller = new EngineeringRoundCtrl(this);
        this.state = this.controller.dataStore;
        this.controller.getContentByRound("ENGINEERING");
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
        return <>

            <Row>
                <Column computer={12} mobile={16} tablet={16}>
                    Round intro goes here
                    <h1>You are in round 2.</h1>
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
        </>;
    }

}