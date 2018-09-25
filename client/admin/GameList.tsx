import * as React from "react";
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input, Dropdown, Popup } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { withRouter, Redirect } from "react-router";
import GameManagementCtrl from './GameManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import UserModel from "../../shared/models/UserModel";
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import GameModal from './GameModal'
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import { Link } from "react-router-dom";

class GameList extends BaseComponent<any, IControllerDataStore & {Admin: AdminViewModel, ShowGameModal: boolean}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "GameList"; //alias for navigation
    
    public static CONTROLLER = GameManagementCtrl;
    
    controller: GameManagementCtrl = GameManagementCtrl.GetInstance(this);

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
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

    componentDidMount () {
        super.componentDidMount();
        this.controller.getAllGames();
        this.controller.getAllUsers();
    }

    render() {
        const DashBoardComponent = this.controller.ComponentFistma.currentState;
        return <>
            {this.state.ShowGameModal && this.state.ApplicationState.ModalObject && 
                <GameModal
                    Game={this.state.ApplicationState.ModalObject}
                    Users={this.state.Admin.Users}
                    CloseFunction={this.controller.closeModal.bind(this.controller)}
                    SaveFunction={this.controller.saveGame.bind(this.controller)}
                    Submitting= {this.state.ApplicationState.FormIsSubmitting}
                />
            }
            {this.state.Admin.DeletionGame &&
                    <Modal open={this.state.Admin.DeletionGame != null} basic onClose={e => this.controller.closeModal()}>
                        <Modal.Header color="red"><Icon name="remove user"/>Delete User</Modal.Header>
                        <Modal.Content>
                            <Modal.Description>
                                Are you sure you want to <strong>permanently delete the game scheduled for {this.state.Admin.DeletionGame.DatePlayed}</strong>?
                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                inverted
                                color='red'
                                icon='cancel'
                                labelPosition="right"
                                content="Cancel"
                                onClick={e => this.controller.dataStore.Admin.DeletionGame = null}
                            >
                            </Button>
                            <Button
                                inverted
                                color="orange"
                                icon='remove user'
                                labelPosition="right"
                                content='Permanently Delete Game'
                                loading={this.state.ApplicationState.FormIsSubmitting}
                                onClick={e => this.controller.DeleteGame(this.state.Admin.DeletionGame)}
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
                loading={this.state.ApplicationState.IsLoading}
            >
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                            <Table.HeaderCell>
                                Date
                                <br/>
                                <Input
                                    icon="search"
                                    onChange={(e, v) => {
                                        this.controller.FilterGames("DatePlayed", v.value)
                                    }}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                Location
                                <br/>
                                <Input
                                    icon="search"
                                    onChange={(e, v) => {
                                        this.controller.FilterGames("Location", v.value)
                                    }}
                                />
                            </Table.HeaderCell>
                            
                            <Table.HeaderCell>PIN</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.state.Admin.FilteredGames && this.state.Admin.FilteredGames.filter(g => !g.IsContentEditable).map((g, i) =>
                            <Table.Row key={i}>
                                <Table.Cell>
                                    <Popup
                                        trigger={<Button
                                            color="blue"
                                            circular
                                            icon='info'
                                            onClick={e => {
                                                this.controller.navigateToGameDetail(g);
                                                <Redirect to={'/admin/gamedetail/' + g._id} />
                                            }}
                                        >
                                        </Button>}
                                        header="Game Details"
                                        content="Add teams, players, etc."
                                    />
                                    <Popup
                                        trigger={<Button
                                            color="blue"
                                            circular
                                            icon='play'
                                            onClick={e => {
                                                this.controller.facilitateGame(g);
                                                <Redirect to={'/facilitator/base/' + g._id} />
                                            }}
                                        >
                                        </Button>}
                                        header="Facilitate this game"
                                    />

                                </Table.Cell>
                                
                                <Table.Cell>{g.DatePlayed}</Table.Cell>
                                <Table.Cell>{g.Location}</Table.Cell>
                                <Table.Cell>{g.GamePIN}</Table.Cell>
                            </Table.Row>
                        )}


                    </Table.Body>

                </Table>
            </Segment>
        </>;
    }

}

export default withRouter(GameList);