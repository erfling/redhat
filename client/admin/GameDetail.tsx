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
import GameModal from './GameModal'
import DeleteTeamModal from './DeleteTeamModal'

class GameDetail extends React.Component<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel} & {ShowUserModal: boolean, ShowGameModal: boolean, ShowTeamDeleteModal: boolean}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: GameManagementCtrl = GameManagementCtrl.GetInstance(this);

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
        <pre>{this.state.ApplicationState && this.state.ApplicationState.ModalObject && JSON.stringify( this.state.ApplicationState.ModalObject.className, null, 2 )}</pre>
            {this.state && this.state.ShowGameModal &&
                <GameModal
                    Game={this.state.Admin.SelectedGame}
                    Users={this.state.Admin.Users}
                    CloseFunction={this.controller.closeModal.bind(this.controller)}
                    SaveFunction={this.controller.saveGame.bind(this.controller)}
                    Submitting= {this.state.ApplicationState.FormIsSubmitting}
                />
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
                                                onClick={e => this.controller.OpenTeamModal(this.state.Admin.SelectedGame.Teams[i])}
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

            {this.state && this.state.ApplicationState.ModalObject && this.state.ShowTeamDeleteModal && <DeleteTeamModal
                Team={this.state.ApplicationState.ModalObject}
                CloseFunction={this.controller.closeModal.bind(this.controller)}
                SaveFunction={this.controller.DeleteTeam.bind(this.controller)}
                Submitting={this.state.ApplicationState.FormIsSubmitting}
            />}
            <pre>{this.state && this.state.Admin && this.state.Admin.AvailablePlayers}</pre>
        </>;
        } else {
            return <h1>adsf</h1>
        }
    }

}

export default withRouter(GameDetail);
//{this.state.Admin.SelectedGame && <pre>{JSON.stringify(this.state.Admin.SelectedGame, null, 2)}</pre>}
