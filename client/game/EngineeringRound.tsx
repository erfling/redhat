import * as React from "react";
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import RoundModel from "../../shared/models/RoundModel";
import EditableContentBlock from '../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
import { withRouter, RouteComponentProps } from "react-router";
const { Button, Grid, Menu } = Semantic;
const { Row, Column } = Grid;


class EngineeringRound extends React.Component<RouteComponentProps<any>, RoundModel>
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

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.controller = new EngineeringRoundCtrl(this);
        this.state = this.controller.dataStore;
        this.controller.getContentByRound("ENGINEERING");
    }

    componentWillMount() {
        //this.props.history.push("/game/" + this.constructor.name.toLowerCase());
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
                    <h1>ROUND TWO: BUILD THE SOLUTION</h1>
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

export default withRouter(EngineeringRound);