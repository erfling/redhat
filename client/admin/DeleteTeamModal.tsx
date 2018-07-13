import * as React from "react";
import { Modal, Button, Label, Header, Icon, Form, Input, Checkbox, Dropdown } from 'semantic-ui-react';
import UserManagementCtrl from './UserManagementCtrl';
import TeamModel from "../../shared/models/TeamModel";
import { DateInput } from 'semantic-ui-calendar-react';

interface GameModalProps{
    Team: TeamModel;
    CloseFunction: () => void;
    SaveFunction: ( team: TeamModel ) => void;
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
        const { Team, CloseFunction, SaveFunction, Submitting } = this.props
        return <>
                <Modal open={Team != null} basic onClose={e => CloseFunction()}>
                    <Modal.Header color="red"><Icon name="remove user"/>Delete Team</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            Are you sure you want to <strong>permanently delete this team?</strong>?
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
                            color="orange"
                            icon='remove user'
                            labelPosition="right"
                            content='Permanently Delete Team'
                            loading={Submitting}
                            onClick={e => SaveFunction(Team)}
                        ></Button>
                    </Modal.Actions>
                </Modal>
            }
            
        </>;
    }

}