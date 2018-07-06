import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { RoleName } from "../../../shared/models/UserModel";
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment, Form, Dimmer, Loader, Header } = Semantic;
const { Row, Column } = Grid;
import Logo from '-!svg-react-loader?name=Icon!../../img/ss-logo.svg';
import LogoWithCircles from '-!svg-react-loader?name=Icon!../../img/ss-logo-with-circles.svg';


class Intro extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: WelcomeCtrl = WelcomeCtrl.GetInstance();

    public static CLASS_NAME = "Intro";

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
        const thisSubRound = this.state.SubRounds.filter(s => s.Name.toUpperCase() == Intro.CLASS_NAME.toUpperCase())[0]

        if (this.state) {
            return <>
                <Column width={16}>
                    <Grid>
                        <Header
                            as='h3'
                        >
                            welcome to
                    </Header>

                        <Row>
                            <Column width={5} mobile={5}>
                                <LogoWithCircles
                                    style={{
                                        position: 'absolute',
                                        width: '200px',
                                        marginLeft: '-20px'
                                    }}
                                />
                            </Column>
                            <Column width={7} mobile={7}>
                                <Header
                                    as='h1'
                                >
                                    source stream
                            </Header>
                            </Column>
                        </Row>
                        {!this.state.CurrentUser.IsLeader && thisSubRound &&

                            <EditableContentBlock
                                IsEditable={this.state.CurrentUser.Role == RoleName.ADMIN}
                                IsLeader={this.state.CurrentUser.IsLeader}
                                SubRoundId={thisSubRound._id}
                                onSaveHandler={this.controller.updateContent.bind(this.controller)}
                                Content={thisSubRound.IndividualContributorContent}
                            />
                        }

                        {this.state.CurrentUser.IsLeader && thisSubRound &&

                            <EditableContentBlock
                                IsEditable={this.state.CurrentUser.Role == RoleName.ADMIN}
                                IsLeader={this.state.CurrentUser.IsLeader}
                                SubRoundId={thisSubRound._id}
                                onSaveHandler={this.controller.updateContent.bind(this.controller)}
                                Content={thisSubRound.LeaderContent}
                            />
                        }
                    </Grid>
                </Column>

            </>;
        } else {
            return <Dimmer active>
                <Loader>Loading</Loader>
            </Dimmer>
        }
    }

}

export default withRouter(Intro);
  /*
                                <Button
                                    content='Save'
                                    icon='checkmark'
                                    labelPosition='right'
                                    onClick={e => {
                                        this.controller.Save1AResponse(q.PossibleAnswers, q, thisSubRound)
                                    }}
                                />*/