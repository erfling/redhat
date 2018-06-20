import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import { Button, Segment, Label, Header, Icon, Form, Input, Dropdown, Popup, Card, Grid, Loader, Dimmer } from 'semantic-ui-react';
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
import { SSL_OP_LEGACY_SERVER_CONNECT } from "constants";

class GameDetail extends React.Component<RouteComponentProps<any>, AdminViewModel & ICommonComponentState & { AvailablePlayers: { text: string, value: string, key: number }[] }>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: GameManagementCtrl;

    //alias for navigation
    public static CLASS_NAME = "GameDetail"

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.controller = new GameManagementCtrl(this);
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

    componentWillMount() {
        console.log("DOES CONSTRUCTOR HAVE LOCATION?", this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0])
        this.controller.getGame(this.props.location.pathname.split("/").filter(s => s.length > 0).reverse()[0]).then(r =>
            this.controller.getAllUsers().then(r => this.controller.filterUsersByGame(this.state.SelectedGame))
        )

    }

    render() {
        const DashBoardComponent = this.state.ComponentFistma.currentState;
        return <>

            <Segment
                clearing
                className="top-info"
                loading={this.state.IsLoading}
            >  {this.state.SelectedGame &&
                <>
                    <Header as="h3">
                        <Label
                            ribbon
                            color="blue"
                        >
                            Game Detail
                        </Label>
                    </Header>

                    <Header as="h3">
                        <Icon name="calendar" />{this.state.SelectedGame.DatePlayed}
                    </Header>
                    <Header as="h3">
                        <Icon name="map" />{this.state.SelectedGame.Location}
                    </Header>
                    <Header as="h3">
                        <Icon name="user" />Facilitator: {this.state.SelectedGame.Facilitator.FirstName + " " + this.state.SelectedGame.Facilitator.LastName}
                    </Header>
                </>
                }
            </Segment>
            {this.state && this.state.SelectedGame && this.state.SelectedGame.Teams &&
                <>
                    <Segment clearing>
                        <Header floated="left"><Icon name="users" />Teams </Header>
                        <Button
                            icon="plus"
                            color="blue"
                            content="Add Team"
                            labelPosition="right"
                            onClick={e => this.controller.addTeamToGame(this.state.SelectedGame)}
                        >
                        </Button>
                    </Segment>
                    <Grid
                        padded
                        stackable
                        columns={3}
                    >
                        {this.state.FormIsSubmitting &&
                            <Dimmer active>
                                <Loader>Saving</Loader>
                            </Dimmer>
                        }
                        {this.state.SelectedGame.Teams.map((t, i) => {
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
                                                                    options={this.state.AvailablePlayers}
                                                                    placeholder='Choose Player'
                                                                    search
                                                                    selection
                                                                    fluid
                                                                    allowAdditions
                                                                    value={this.state.SelectedGame.Teams[i].Players[j]._id}
                                                                    onChange={(e, output) => {

                                                                        var playerToAdd: UserModel = this.state.Users.filter(p => {
                                                                            console.log(p._id, p._id == output.value)
                                                                            return p._id == output.value
                                                                        })[0] || null;

                                                                        if (playerToAdd) {
                                                                            this.state.SelectedGame.Teams[i].Players[j] = playerToAdd;
                                                                            this.controller.filterUsersByGame(this.state.SelectedGame)
                                                                            console.log(t.Players)
                                                                            p.EditMode = false;
                                                                        }
                                                                    }}
                                                                    onAddItem={e => this.controller.addPlayer(this.state.SelectedGame.Teams[i])}
                                                                />
                                                            }
                                                            {!p.EditMode && <Header as="h4">{p.FirstName} {p.LastName} {p.Email && <small><br/>{p.Email}</small>}</Header>}
                                                        </Column>
                                                        <Column width={3}>
                                                            {!p.EditMode &&
                                                                <>
                                                                    <Icon
                                                                        color="blue"
                                                                        name="edit"
                                                                        onClick={e => this.state.SelectedGame.Teams[i].Players[j].EditMode = true}
                                                                        style={{ marginTop: '7px' }}
                                                                    />
                                                                    <Icon
                                                                        color="red"
                                                                        name="trash"
                                                                        onClick={e => {
                                                                            this.state.SelectedGame.Teams[i].Players = this.state.SelectedGame.Teams[i].Players.filter(innerP => p._id != innerP._id)
                                                                            this.controller.filterUsersByGame(this.state.SelectedGame)
                                                                        }}
                                                                        style={{ marginTop: '7px' }}
                                                                    />
                                                                </>
                                                            }
                                                            {p.EditMode &&
                                                                <Icon
                                                                    color="red"
                                                                    name="cancel"
                                                                    onClick={e => this.state.SelectedGame.Teams[i].Players[j].EditMode = false}
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
                                                    onClick={e => this.controller.saveTeam(this.state.SelectedGame.Teams[i])}
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
                                                onClick={e => this.controller.saveTeam(this.state.SelectedGame.Teams[i])}
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
            {this.state.ModalObject && <UserModal
                User={this.state.ModalObject}
                CloseFunction={this.controller.closeModal.bind(this.controller)}
                SaveFunction={this.controller.saveUser.bind(this.controller)}
                Submitting={this.state.FormIsSubmitting}
            />}
        </>;
    }

}

export default withRouter(GameDetail);
{this.state.SelectedGame && <pre>{JSON.stringify(this.state.SelectedGame, null, 2)}</pre>}
