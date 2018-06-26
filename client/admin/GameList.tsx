import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input, Dropdown, Popup } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter } from "react-router";
import GameManagementCtrl from './GameManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import GameModel from "../../shared/models/GameModel";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from 'moment';
import UserModel, { RoleName } from "../../shared/models/UserModel";

class GameList extends React.Component<RouteComponentProps<any>, AdminViewModel & ICommonComponentState>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: GameManagementCtrl = new GameManagementCtrl(this);

    //alias for navigation
    public static CLASS_NAME = "GameList";

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

    componentWillMount () {
        //this.component.constructor.super(this.component.props).componentWillMount()
        this.controller.navigateOnClick(this.props.location.pathname);
        this.controller.getAllGames();
        this.controller.getAllUsers();
    }

    render() {
        const DashBoardComponent = this.controller.ComponentFistma.currentState;
        return <>
            {this.state.ModalObject &&
                <Modal open={this.state.ModalOpen} basic onClose={e => this.controller.closeModal()}>
                    <Modal.Header><Icon name="game"/>Create or Edit a Game</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form inverted>
                            <Form.Field>
                                    <label>PIN (remove this soon)</label>
                                    <Input
                                        value={(this.state.ModalObject as GameModel).GamePIN}
                                        onChange={(e) => (this.state.ModalObject as GameModel).GamePIN = parseInt((e.target as HTMLInputElement).value)}
                                        placeholder="GamePIN"
                                    />
                                </Form.Field><Form.Field>
                                    <label>Location</label>
                                    <Input
                                        value={(this.state.ModalObject as GameModel).Location}
                                        onChange={(e) => (this.state.ModalObject as GameModel).Location = (e.target as HTMLInputElement).value}
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
                                        value={this.controller.dataStore.ModalObject.DatePlayed}
                                        iconPosition="left"
                                        dateFormat="MM/DD/YYYY"
                                        onChange={(e, output) => {
                                            console.log("CALLENDAR THING: ", output)
                                            this.controller.dataStore.ModalObject.DatePlayed = output.value;
                                        }} />
                                </Form.Field>
                                <Form.Field>
                                    <label>Facilitator</label>
                                    {this.state.Users && 
                                        <Dropdown 
                                            placeholder='Select Facilitator' 
                                            fluid 
                                            search 
                                            selection
                                            value={(this.state.ModalObject as GameModel).Facilitator._id}
                                            onChange={(e, output) => {
                                                console.log("SELECTION", output)
                                                this.controller.dataStore.ModalObject.Facilitator._id = output.value
                                            }}
                                            options={this.state.Users.filter(u => u.Role == RoleName.ADMIN).map((u,i) => {
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
                            loading={this.state.FormIsSubmitting}
                            onClick={e => this.controller.saveGame(this.state.ModalObject)}
                        ></Button>
                    </Modal.Actions>
                </Modal>
            }
            <Segment 
                clearing
                style={{paddingBottom:0}}
            >
                    <Header
                        as="h1"
                        floated="left"
                    >
                        <Header.Content>
                            <Icon name="game"/>
                            Manage Games
                        </Header.Content>
                    </Header>
                    <Button color="blue"
                        icon="plus"
                        content="Add Game"
                        labelPosition="right"
                        floated='right'
                        onClick={e => this.controller.createOrEditGame()}
                    >
                    </Button>
            </Segment>
            <Segment
                loading={this.state.IsLoading}
            >
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Location</Table.HeaderCell>
                            <Table.HeaderCell>Facilitator</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.state.Games && this.state.Games.map((g, i) =>
                            <Table.Row key={i}>
                                <Table.Cell>
                                    <Popup
                                        trigger={<Button
                                            color="blue"
                                            circular
                                            icon='edit'
                                            onClick={e => this.controller.createOrEditGame(g)}
                                        ></Button>}
                                        header="Edit Game"
                                    />

                                    <Popup
                                        trigger={<Button
                                            color="blue"
                                            circular
                                            icon='info'
                                            onClick={e => this.controller.navigateToGameDetail(g)}
                                        ></Button>}
                                        header="Game Details"
                                        content="Add teams, players, etc."
                                    />

                                </Table.Cell>
                                
                                <Table.Cell>{g.DatePlayed}</Table.Cell>
                                <Table.Cell>{g.Location}</Table.Cell>
                                <Table.Cell>{g.Facilitator && Object.assign(new UserModel(), g.Facilitator).Name}</Table.Cell>
                            </Table.Row>
                        )}


                    </Table.Body>

                </Table>
            </Segment>
        </>;
    }

}

export default withRouter(GameList);