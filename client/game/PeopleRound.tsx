import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
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
    controller: PeopleRoundCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: {}) {
        super(props);

        this.controller = new PeopleRoundCtrl(this);
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
        return <>

            <Row>
                <Column computer={12} mobile={16} tablet={16}>
                    Round intro goes here
                <h1>You are in round 1.</h1>
                </Column>
                <Column computer={1} mobile={16} tablet={16}>
                    <Button
                        color="violet"
                        basic={true}
                    >
                        Best shot
                    </Button>
                </Column>
            </Row>
            <Grid>
                {this.state.IndividualContributorContent && this.state.IndividualContributorContent.map((c, i) =>
                    <EditableContentBlock
                        onSaveHandler={this.controller.updateICContent.bind(this.controller)}
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
            <Row>
                Global game footer (like number of teams complete) goes here
            </Row>
        </>;
    }

}
//            <div dangerouslySetInnerHTML={{__html: testContent}}/>
