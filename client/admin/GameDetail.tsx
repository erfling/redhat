import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import { Button, Segment, Label, Header, Icon, Form, Input, Dropdown, Popup, Card, Grid, Loader, Dimmer, Modal } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter } from "react-router";
import GameManagementCtrl from './GameManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import DecisionIcon from '-!svg-react-loader?name=Icon!../img/decisions.svg';
import GameModel from "../../shared/models/GameModel";
import TeamModel from "../../shared/models/TeamModel";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from 'moment';
import UserModel, { RoleName } from "../../shared/models/UserModel";
import UserModal from './UserModal';
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';


class GameDetail extends React.Component<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: GameManagementCtrl = new GameManagementCtrl(this);

    //alias for navigation
    public static CLASS_NAME = "GameDetail"

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

    componentDidMount() {
        console.log("DOES CONSTRUCTOR HAVE LOCATION?", this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0]).then(r =>
            this.controller.getAllUsers().then(r => this.controller.filterUsersByGame(this.state.Admin.SelectedGame))
        )

    }

    render() {
        const DashBoardComponent = this.controller.ComponentFistma.currentState;
        if(this.state){
        return <>
            {this.state && this.state.ApplicationState && this.state.ApplicationState.ModalObject && this.state.ApplicationState.ModalObject.className == "GameModel" && 
                <Modal open={this.state.ApplicationState.ModalOpen} basic onClose={e => this.controller.closeModal()}>
                    <Modal.Header><Icon name="game" />Edit Game</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form inverted>
                                <Form.Field>
                                    <label>PIN (remove this soon)</label>
                                    <Input
                                        value={(this.state.ApplicationState.ModalObject as GameModel).GamePIN}
                                        onChange={(e) => (this.state.ApplicationState.ModalObject as GameModel).GamePIN = parseInt((e.target as HTMLInputElement).value)}
                                        placeholder="GamePIN"
                                    />
                                </Form.Field><Form.Field>
                                    <label>Location</label>
                                    <Input
                                        value={(this.state.ApplicationState.ModalObject as GameModel).Location}
                                        onChange={(e) => (this.state.ApplicationState.ModalObject as GameModel).Location = (e.target as HTMLInputElement).value}
                                        placeholder="Location"
                                    />
                                </Form.Field>
                                <Form.Field
                                    onClick={e => {
                                        setTimeout(() => {
                                            let popup = document.querySelector("#suirCalendarPopup");
                                            (popup.parentNode as HTMLDivElement).style.display = "none";

                                            if (popup) {
                                                (popup.parentNode as HTMLDivElement).style.filter = "none";
                                                (popup.parentNode as HTMLDivElement).style['-webkit-filter'] = "none";
                                                (popup.parentNode as HTMLDivElement).style.display = "block";
                                            }
                                        }, 1)
                                    }}
                                >
                                    <label>Start Date</label>
                                    <DateInput
                                        name="date"
                                        placeholder="Date"
                                        value={this.controller.dataStore.ApplicationState.ModalObject.DatePlayed}
                                        iconPosition="left"
                                        dateFormat="MM/DD/YYYY"
                                        onChange={(e, output) => {
                                            this.controller.dataStore.ApplicationState.ModalObject.DatePlayed = output.value;
                                        }} />
                                </Form.Field>
                                <Form.Field>
                                    <label>Facilitator</label>
                                    {this.state.Admin.Users &&
                                        <Dropdown
                                            placeholder='Select Facilitator'
                                            fluid
                                            search
                                            selection
                                            value={(this.state.ApplicationState.ModalObject as GameModel).Facilitator._id}
                                            onChange={(e, output) => {
                                                this.controller.dataStore.ApplicationState.ModalObject.Facilitator._id = output.value
                                            }}
                                            options={this.state.Admin.Users.filter(u => u.Role == RoleName.ADMIN).map((u, i) => {
                                                return {
                                                    text: u.FirstName + " " + u.LastName + " (" + u.Email + ")",
                                                    value: u._id,
                                                    key: i
                                                }
                                            })}
                                        />
                                    }
                                </Form.Field>
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            inverted
                            color='red'
                            icon='cancel'
                            labelPosition="right"
                            content="Cancel"
                            onClick={e => this.controller.closeModal()}
                        >
                        </Button>
                        <Button
                            inverted
                            color="blue"
                            icon='check'
                            labelPosition="right"
                            content='Save Game'
                            loading={this.state.ApplicationState.FormIsSubmitting}
                            onClick={e => this.controller.saveGame(this.state.Admin.ModalObject)
                                                            .then(r => {
                                                                console.warn("<<<<<<>>>>>>savedgame",r);
                                                                this.setState(Object.assign(this.state, {SelectedGame: Object.assign(this.state.Admin.SelectedGame, r)}))}
                                                            )}
                        ></Button>
                    </Modal.Actions>
                </Modal>
            }
            <Segment
                clearing
                className="top-info"
                loading={this.state.ApplicationState.IsLoading}
            >  {this.state.Admin.SelectedGame &&
                <>
                    <Popup
                        floated="right"
                        trigger={<Button
                            color="blue"
                            circular
                            icon='edit'
                            onClick={e => this.controller.createOrEditGame(this.state.Admin.SelectedGame)}
                        ></Button>}
                        header="Edit Game"
                    />
                    <Header as="h3">
                        <Label
                            ribbon
                            color="blue"
                        >
                            Game Detail
                        </Label>
                    </Header>

                    <Header as="h3">
                        <Icon name="calendar" />{this.state.Admin.SelectedGame.DatePlayed}
                    </Header>
                    <Header as="h3">
                        <Icon name="map" />{this.state.Admin.SelectedGame.Location}
                    </Header>
                    <Header as="h3">
                        <Icon name="user" />Facilitator: {this.state.Admin.SelectedGame.Facilitator.FirstName + " " + this.state.Admin.SelectedGame.Facilitator.LastName}
                    </Header>
                    
                </>
                }
            </Segment>
            {this.state && this.state.Admin.SelectedGame && this.state.Admin.SelectedGame.Teams &&
                <>
                    <Segment clearing>
                        <Header floated="left"><Icon name="users" />Teams </Header>
                        <Button
                            icon="plus"
                            color="blue"
                            content="Add Team"
                            labelPosition="right"
                            onClick={e => this.controller.addTeamToGame(this.state.Admin.SelectedGame)}
                        >
                        </Button>
                    </Segment>
                    <Grid
                        padded
                        stackable
                        columns={3}
                    >
                        {this.state.ApplicationState.FormIsSubmitting &&
                            <Dimmer active>
                                <Loader>Saving</Loader>
                            </Dimmer>
                        }
                        {this.state.Admin.SelectedGame.Teams.map((t, i) => {
                            return <Column>
                                <Card
                                    fluid
                                    key={i}
                                    color="blue"
                                >
                                    <Card.Content>
                                        <Card.Header>
                                            <Header>
                                                Team {i + 1}
                                            </Header>
                                        </Card.Header>
                                    </Card.Content>
                                    <Card.Content>
                                        <Form>
                                            {t.Players && t.Players.map((p, j) => {
                                                return <Form.Field
                                                    key={j}
                                                >
                                                    <Grid>
                                                        <Column width={13}>
                                                            {p.EditMode &&
                                                                <Dropdown
                                                                    options={this.state.Admin.AvailablePlayers}
                                                                    placeholder='Choose Player'
                                                                    search
                                                                    selection
                                                                    fluid
                                                                    allowAdditions
                                                                    value={this.state.Admin.SelectedGame.Teams[i].Players[j]._id}
                                                                    onChange={(e, output) => {

                                                                        var playerToAdd: UserModel = this.state.Admin.Users.filter(p => {
                                                                            console.log(p._id, p._id == output.value)
                                                                            return p._id == output.value
                                                                        })[0] || null;

                                                                        if (playerToAdd) {
                                                                            this.state.Admin.SelectedGame.Teams[i].Players[j] = playerToAdd;
                                                                            this.controller.filterUsersByGame(this.state.Admin.SelectedGame)
                                                                            console.log(t.Players)
                                                                            p.EditMode = false;
                                                                        }
                                                                    }}
                                                                    onAddItem={e => this.controller.addPlayer(this.state.Admin.SelectedGame.Teams[i])}
                                                                />
                                                            }
                                                            {!p.EditMode && <Header as="h4">{p.FirstName} {p.LastName} {p.Email && <small><br />{p.Email}</small>}</Header>}
                                                        </Column>
                                                        <Column width={3}>
                                                            {!p.EditMode &&
                                                                <>
                                                                    <Icon
                                                                        color="blue"
                                                                        name="edit"
                                                                        onClick={e => this.state.Admin.SelectedGame.Teams[i].Players[j].EditMode = true}
                                                                        style={{ marginTop: '7px' }}
                                                                    />
                                                                    <Icon
                                                                        color="red"
                                                                        name="trash"
                                                                        onClick={e => {
                                                                            this.state.Admin.SelectedGame.Teams[i].Players = this.state.Admin.SelectedGame.Teams[i].Players.filter(innerP => p._id != innerP._id)
                                                                            this.controller.filterUsersByGame(this.state.Admin.SelectedGame)
                                                                        }}
                                                                        style={{ marginTop: '7px' }}
                                                                    />
                                                                </>
                                                            }
                                                            {p.EditMode &&
                                                                <Icon
                                                                    color="red"
                                                                    name="cancel"
                                                                    onClick={e => this.state.Admin.SelectedGame.Teams[i].Players[j].EditMode = false}
                                                                    style={{ marginTop: '7px' }}
                                                                />
                                                            }
                                                        </Column>
                                                    </Grid>
                                                </Form.Field>
                                            })}
                                        </Form>
                                    </Card.Content>
                                    <Card.Content>
                                        {t.Players.length == 5 &&
                                            <Popup
                                                trigger={<Button
                                                    icon="add user"
                                                    color="blue"
                                                    content="Add Player"
                                                    labelPosition="right"
                                                    disabled
                                                ></Button>}
                                                header="Teams cannot have more than five players"
                                            />
                                        }
                                        {t.Players.length < 5 &&
                                            <Button
                                                icon="add user"
                                                color="blue"
                                                content="Add Player"
                                                labelPosition="right"
                                                onClick={e => {
                                                    var player = new UserModel();
                                                    player.EditMode = true;
                                                    t.Players = t.Players.concat(player)
                                                }}
                                            ></Button>
                                        }

                                    </Card.Content>

                                    <Card.Content extra>
                                        <div className='ui two buttons'>
                                            {t.Players.length > 3 &&

                                                <Button
                                                    icon="check"
                                                    color="blue"
                                                    content="Save"
                                                    onClick={e => this.controller.saveTeam(this.state.Admin.SelectedGame.Teams[i])}
                                                >
                                                </Button>
                                            }
                                            {t.Players.length < 4 &&
                                                <Popup
                                                    trigger={<Button
                                                        icon="add user"
                                                        inverted
                                                        color="blue"
                                                        content="Save"
                                                        labelPosition="right"
                                                    ></Button>}
                                                    header="Teams must have at least four players"
                                                />
                                            }
                                            <Button
                                                inverted
                                                icon="trash"
                                                color="red"
                                                content="Delete"
                                                onClick={e => this.controller.saveTeam(this.state.Admin.SelectedGame.Teams[i])}
                                            >
                                            </Button>

                                        </div>
                                    </Card.Content>
                                </Card>
                            </Column>
                        })}
                    </Grid>
                </>

            }
            {this.state && this.state.ApplicationState && this.state.ApplicationState.ModalObject && this.state.ApplicationState.ModalObject.className == "UserModel" && <UserModal
                User={this.state.ApplicationState.ModalObject}
                CloseFunction={this.controller.closeModal.bind(this.controller)}
                SaveFunction={this.controller.saveUser.bind(this.controller)}
                Submitting={this.state.ApplicationState.FormIsSubmitting}
            />}
        </>;
        } else {
            return <h1>adsf</h1>
        }
    }

}

export default withRouter(GameDetail);
//{this.state.Admin.SelectedGame && <pre>{JSON.stringify(this.state.Admin.SelectedGame, null, 2)}</pre>}
