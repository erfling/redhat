import * as React from "react";
import FiStMa from '../../shared/entity-of-the-state/FiStMa';
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter } from "react-router";
import GameManagementCtrl from './GameManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import ICommonComponentState from '../../shared/base-sapien/client/ICommonComponentState';
import DecisionIcon from '-!svg-react-loader?name=Icon!../img/decisions.svg';
import GameModel from "../../shared/models/GameModel";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from 'moment';

class GameList extends React.Component<RouteComponentProps<any>, AdminViewModel & ICommonComponentState>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------
    controller: GameManagementCtrl;



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

    render() {
        const DashBoardComponent = this.state.ComponentFistma.currentState;
        return <>
            {this.state.ModalObject &&
                <Modal open={this.state.ModalOpen} dimmer="blurring" onClose={e => this.controller.closeModal()}>
                    <Modal.Header>Create a Game</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Header>Default Profile Image</Header>
                            <Form>
                                <Form.Field>
                                    <label>Location</label>
                                    <Input
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
                                    
                                </Form.Field>
                            </Form>
                            <pre>{this.state && JSON.stringify(this.state.ModalObject, null, 2)}</pre>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='black'>
                            Nope
                    </Button>
                        <Button
                            color="blue"
                            icon='check' 
                            labelPosition="right"
                            content='All Done' 
                            onClick={e => this.controller.closeModal()}
                        ></Button>
                    </Modal.Actions>
                </Modal>
            }
            {this.state.CurrentUser && <h2>Welcome to you, my friend {this.state.CurrentUser.FirstName}</h2>}
            <Segment>
                Manage Games
                <Button color="blue"
                    onClick={e => this.controller.createOrEditGame()}
                >
                    Add Game
                </Button>
            </Segment>
            <Segment>
                {this.state.IsLoading && <h2>Loading Games</h2>}
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Header</Table.HeaderCell>
                            <Table.HeaderCell>Header</Table.HeaderCell>
                            <Table.HeaderCell>Header</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.state.Games && this.state.Games.map((g, i) =>
                            <Table.Row key={i}>
                                <Table.Cell>
                                    <Label ribbon>First</Label>
                                </Table.Cell>
                                <Table.Cell>{g.Location}</Table.Cell>
                                <Table.Cell>Cell</Table.Cell>
                            </Table.Row>
                        )}


                    </Table.Body>

                </Table>
            </Segment>
        </>;
    }

}

export default withRouter(GameList);

/**
 * <DateInput
                                        name="date"
                                        placeholder="Date"
                                        value={((this.state.ModalObject as GameModel).DatePlayed).toDateString()}
                                        iconPosition="left"
                                        onChange={(e, output) => { console.log("CALLENDAR THING: ", e.value, e.name, output) 
                                            this.controller.dataStore.ModalObject.DatePlayed = new Date(output.value);
                                        }} />
 */