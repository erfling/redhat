import * as React from "react";
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input, Checkbox, Popup } from 'semantic-ui-react';
const { Row, Column } = Grid;
import UserModel, { RoleName } from "../../shared/models/UserModel";

interface UserModalProps{
    User: UserModel;
    CloseFunction: () => void;
    SaveFunction: ( user: UserModel ) => void;
    Submitting: boolean
}

export default class UserModal extends React.Component< UserModalProps, {} >
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

    constructor(props: UserModalProps) {
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
        return <>
                <Modal open={this.props.User != null} basic onClose={e => this.props.CloseFunction()}>
                    <Modal.Header icon="user"><Icon name="user"/>Create or Edit a User</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form inverted>
                                <Form.Field>
                                    <label>First Name</label>
                                    <Input
                                        value={(this.props.User as UserModel).FirstName}
                                        onChange={(e) => (this.props.User as UserModel).FirstName = (e.target as HTMLInputElement).value}
                                        placeholder="First Name"
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Last Name</label>
                                    <Input
                                        value={(this.props.User as UserModel).LastName}
                                        onChange={(e) => (this.props.User as UserModel).LastName = (e.target as HTMLInputElement).value}
                                        placeholder="Last Name"
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Email</label>
                                    <Input
                                        value={(this.props.User as UserModel).Email}
                                        onChange={(e) => (this.props.User as UserModel).Email = (e.target as HTMLInputElement).value}
                                        placeholder="Email"
                                    />
                                </Form.Field>
                                <div className="grouped fields">
                                    <Form.Field>
                                        <label>Role</label>
                                        <Checkbox
                                            radio
                                            label='Player'
                                            name='checkboxRadioGroup'
                                            value={RoleName.PLAYER}
                                            checked={this.props.User.Role === RoleName.PLAYER}
                                            onChange={() => {
                                                this.props.User.RoleChanged = false;
                                                this.props.User.Role = RoleName.PLAYER
                                            }}                                        
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Checkbox
                                            radio
                                            label='Facilitator'
                                            name='checkboxRadioGroup'
                                            value={RoleName.FACILITATOR}
                                            checked={this.props.User.Role === RoleName.FACILITATOR}
                                            onChange={() => {
                                                this.props.User.RoleChanged = false;
                                                this.props.User.Role = RoleName.FACILITATOR
                                            }}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Checkbox
                                            radio
                                            label='Admin'
                                            name='checkboxRadioGroup'
                                            value={RoleName.ADMIN}
                                            checked={this.props.User.Role === RoleName.ADMIN}
                                            onChange={() => {
                                                this.props.User.RoleChanged = true;
                                                this.props.User.Role = RoleName.ADMIN
                                            }}
                                        />
                                    </Form.Field>
                                </div>
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
                            onClick={e => this.props.CloseFunction()}
                        >
                        </Button>
                        <Button
                            inverted
                            color="blue"
                            icon='check'
                            labelPosition="right"
                            content='Save User'
                            loading={this.props.Submitting}
                            onClick={e => this.props.SaveFunction(this.props.User)}
                        ></Button>
                    </Modal.Actions>
                </Modal>
            }
            
        </>;
    }

}