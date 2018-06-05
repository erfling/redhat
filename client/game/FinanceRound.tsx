import * as React from "react";
import FinanceRountCtrl from "./FinanceRountCtrl";
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
    controller: FinanceRountCtrl;

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: {}) {
        super(props);

        this.controller = new FinanceRountCtrl(this);
        this.state = this.controller.dataStore;
        this.controller.getContentByRound("FINANCE");
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
                    <h1>ROUND 4: GROW THE COMPANY.</h1>
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