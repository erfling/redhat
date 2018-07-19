import * as React from "react";
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import * as Semantic from 'semantic-ui-react';
import { withRouter, RouteComponentProps } from "react-router";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

const { Button, Grid, Menu, Segment, Loader } = Semantic;
const { Row, Column } = Grid;

class EngineeringRound extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "EngineeringRound";

    public static CONTROLLER = EngineeringRoundCtrl;
    
    controller: EngineeringRoundCtrl = EngineeringRoundCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);

        this.state = this.controller.dataStore;
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
    // 
    render() {
        if (this.state && this.controller.ComponentFistma) {
            const SubRnd = this.controller.ComponentFistma.currentState;

            return <>
                <Column width={16}>
                    <Grid>
                        <Column mobile={16} tablet={12} computer={8} largeScreen={6} >
                            <Row>
                                <Column computer={12} mobile={16} tablet={16}>
                                    <h3>Round 2: <small>build the solution</small></h3>
                                </Column>
                            </Row>
                            <Grid>
                                <SubRnd />
                            </Grid>
                        </Column>
                    </Grid>
                </Column>

            </>
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(EngineeringRound);