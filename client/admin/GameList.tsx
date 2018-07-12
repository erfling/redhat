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
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';
import GameModal from './GameModal'

class GameList extends React.Component<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel, ShowGameModal: boolean}>
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
            {this.state.ShowGameModal &&
                <GameModal
                    Game={new GameModel()}
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

export default withRouter(GameList);