import * as React from "react";
import { Modal, Button, Label, Header, Icon, Form, Input, Checkbox, Dropdown } from 'semantic-ui-react';
import UserManagementCtrl from './UserManagementCtrl';
import UserModel, { RoleName } from "../../shared/models/UserModel";
import GameModel from "../../shared/models/GameModel";
import { DateInput } from 'semantic-ui-calendar-react';

interface GameModalProps{
    Game: GameModel;
    Users: UserModel[];
    CloseFunction: () => void;
    SaveFunction: ( game: GameModel ) => void;
    Submitting: boolean
}

export default class GameModal extends React.Component< GameModalProps, {} >
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: GameModalProps) {
        super(props);
    }


    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------



    //---------------------k-------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    render() {
        const {  Game,  CloseFunction, SaveFunction, Submitting, Users } = this.props
        return <>
                <Modal open={Game != null} basic onClose={e => CloseFunction()}>
                    <Modal.Header><Icon name="game" />{Game._id != null ? "Edit" : "Create" } Game</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form inverted>
                                <Form.Field>
                                    <label>PIN (remove this soon)</label>
                                    <Input
                                        value={Game.GamePIN}
                                        onChange={(e) => Game.GamePIN = parseInt((e.target as HTMLInputElement).value)}
                                        placeholder="GamePIN"
                                    />
                                </Form.Field><Form.Field>
                                    <label>Location</label>
                                    <Input
                                        value={Game.Location}
                                        onChange={(e) => Game.Location = (e.target as HTMLInputElement).value}
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
                                        value={Game.DatePlayed}
                                        iconPosition="left"
                                        dateFormat="MM/DD/YYYY"
                                        onChange={(e, output) => {
                                            Game.DatePlayed = output.value;
                                        }} />
                                </Form.Field>
                                <Form.Field>
                                    <label>Facilitator</label>
                                    {Users &&
                                        <Dropdown
                                            placeholder='Select Facilitator'
                                            fluid
                                            search
                                            selection
                                            value={Game.Facilitator._id}
                                            onChange={(e, output) => {
                                                Game.Facilitator._id = output.value
                                            }}
                                            options={Users.filter(u => u.Role == RoleName.ADMIN).map((u, i) => {
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
                            onClick={e => CloseFunction()}
                        >
                        </Button>
                        <Button
                            inverted
                            color="blue"
                            icon='check'
                            labelPosition="right"
                            content='Save Game'
                            loading={Submitting}
                            onClick={e => SaveFunction(Game)}
                        ></Button>
                    </Modal.Actions>
                </Modal>
            }
            
        </>;
    }

}