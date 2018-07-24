import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import { RoleName } from "../../../shared/models/UserModel";
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment, Form, Dimmer, Loader, Header } = Semantic;
const { Row, Column } = Grid;
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";

import IntroLogo from '-!svg-react-loader?name=Icon!../../img/intro-logo.svg';

export default class Intro extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
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

        this.controller.ParentController = WelcomeCtrl.GetInstance();
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
                            as='h1'
                        >
                            welcome to
                        </Header>
                    </Row>

                    <Row>
                        <IntroLogo
                            className="intro-logo"
                        />
                    </Row>

                    {thisSubRound && this.state.ApplicationState.SelectedMessage &&
                        <EditableContentBlock
                            IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                            SubRoundId={thisSubRound._id}
                            onSaveHandler={this.controller.updateContent.bind(this.controller)}
                            Message={this.state.ApplicationState.SelectedMessage}
                        />
                    }
                    
                    <Row
                        centered
                    >
                    <Link to="/game/welcome/playerlogin">
                        <Button
                            color="blue"
                            size='huge'
                            style={{
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                display: 'block'
                            }}
                            onClick={e => this.props.history.push("/game/welcome/playerlogin")}
                        >
                            Login
                                </Button>
                        </Link>
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

  /*                    <pre>{JSON.stringify(this.state, null, 2)}</pre>

                                <Button
                                    content='Save'
                                    icon='checkmark'
                                    labelPosition='right'
                                    onClick={e => {
                                        this.controller.Save1AResponse(q.PossibleAnswers, q, thisSubRound)
                                    }}
                                />*/