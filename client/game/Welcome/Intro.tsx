import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import { RoleName } from "../../../shared/models/UserModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment, Form, Dimmer, Loader, Header } = Semantic;
const { Row, Column } = Grid;
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

import IntroLogo from '-!svg-react-loader?name=Icon!../../img/intro-logo.svg';

class Intro extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Intro";

    public static CONTROLLER = WelcomeCtrl;
    
    controller: WelcomeCtrl = WelcomeCtrl.GetInstance();

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
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == Intro.CLASS_NAME.toUpperCase())[0]

        if (this.state) {
            return <>
                        <Column>
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
                            {!this.state.ApplicationState.CurrentUser.IsLeader && thisSubRound &&

                                <EditableContentBlock
                                    IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                    IsLeader={this.state.ApplicationState.CurrentUser.IsLeader}
                                    SubRoundId={thisSubRound._id}
                                    onSaveHandler={this.controller.updateContent.bind(this.controller)}
                                    Content={thisSubRound.IndividualContributorContent}
                                />
                            }

                            {this.state.ApplicationState.CurrentUser.IsLeader && thisSubRound &&

                                <EditableContentBlock
                                    IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                    IsLeader={this.state.ApplicationState.CurrentUser.IsLeader}
                                    SubRoundId={thisSubRound._id}
                                    onSaveHandler={this.controller.updateContent.bind(this.controller)}
                                    Content={thisSubRound.LeaderContent}
                                />
                            }
                            <Row
                                centered
                            >
                                <Button 
                                    color="blue"
                                    size='huge'
                                    style={{
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        display: 'block'
                                    }}
                                    onClick={e => this.controller.navigateOnClick("/game/welcome/playerlogin")}
                                >
                                    Login
                                </Button>
                            </Row>
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