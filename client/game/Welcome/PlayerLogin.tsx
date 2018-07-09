import * as React from "react";
import WelcomeCtrl from "./WelcomeCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { RoleName } from "../../../shared/models/UserModel";
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment, Form, Dimmer, Loader, Header, Message } = Semantic;
const { Row, Column } = Grid;
import Logo from '-!svg-react-loader?name=Icon!../../img/ss-logo.svg';
import IntroLogo from '-!svg-react-loader?name=Icon!../../img/intro-logo.svg';
import ICommonComponentState from "../../../shared/base-sapien/client/ICommonComponentState";


class PlayerLogin extends React.Component<RouteComponentProps<any>, {Round: RoundModel, ApplicationState: ICommonComponentState}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: WelcomeCtrl = WelcomeCtrl.GetInstance();

    public static CLASS_NAME = "PlayerLogin";

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

        if (this.state) {
            return <>
                <Column width={16}>
                    <Grid>
                        <Column mobile={16} tablet={12} computer={8} largeScreen={6} 
                            style={{
                                textAlign: 'left'
                            }}
                        >
                            
                            <Row>
                                <IntroLogo
                                    className="intro-logo"
                                />
                            </Row>
                            
                            <Row>
                                <Form>
                                    <Form.Field>
                                        <Semantic.Label>Email</Semantic.Label>
                                        <Semantic.Input
                                            onChange={(e, semanticStuff) => this.controller.dataStore.ApplicationState.CurrentUser.Email = semanticStuff.value}
                                            ref="EMAIL"
                                            placeholder='Email'
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Semantic.Label>PIN</Semantic.Label>
                                        <Semantic.Input
                                            onChange={(e, semanticStuff) => this.controller.dataStore.ApplicationState.CurrentGame.GamePIN = parseInt(semanticStuff.value)}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Button 
                                            color="blue"
                                            onClick={e => this.controller.LoginPlayer()}
                                        >
                                            Login
                                        </Button>
                                    </Form.Field>
                                    {this.state && this.state.ApplicationState.FormError &&
                                        <Message negative>
                                            <Message.Header>{this.state.ApplicationState.FormError}</Message.Header>
                                        </Message>
                                    }
                                </Form>

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

export default withRouter(PlayerLogin);