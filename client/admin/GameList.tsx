import * as React from "react";
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input, Dropdown, Popup } from 'semantic-ui-react';
const { Row, Column } = Grid;
import GameManagementCtrl from './GameManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import UserModel from "../../shared/models/UserModel";
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import GameModal from './GameModal'
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

export default class GameList extends BaseComponent<any, IControllerDataStore & {Admin: AdminViewModel, ShowGameModal: boolean}>
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
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Location</Table.HeaderCell>
                            <Table.HeaderCell>Facilitator</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.state.Admin.Games && this.state.Admin.Games.map((g, i) =>
                            <Table.Row key={i}>
                                <Table.Cell>
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
