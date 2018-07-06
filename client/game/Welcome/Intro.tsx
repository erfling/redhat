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
import IntroLogo from '-!svg-react-loader?name=Icon!../../img/intro-logo.svg';


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
                <Column width={16} centered>
                    <Grid centered>
                        <Column mobile={16} tablet={12} computer={8} largeScreen={6} >
                            <Row>
                                <Header
                                    as='h3'
                                >
                                    welcome to
                        </Header>
                            </Row>

                            <Row>
                                <IntroLogo
                                    className="intro-logo"
                                />
                            </Row>
                            {this.state.CurrentUser && this.state.CurrentUser.Role == RoleName.ADMIN &&
                                <Button
                                    onClick={e => this.controller.dataStore.CurrentUser.IsLeader = !this.controller.dataStore.CurrentUser.IsLeader}
                                >
                                    Show {this.state.CurrentUser.IsLeader ? "IC" : "Leader"} Content
                                </Button>
                            }
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
                            <Row>
                                <Button 
                                    color="blue"
                                    size='huge'>
                                    Login
                                </Button>
                            </Row>
                        </Column>
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