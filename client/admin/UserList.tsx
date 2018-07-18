import * as React from "react";
import { Grid, Table, Modal, Button, Segment, Label, Header, Icon, Form, Input, Checkbox, Popup } from 'semantic-ui-react';
const { Row, Column } = Grid;
import { RouteComponentProps, withRouter } from "react-router";
import UserManagementCtrl from './UserManagementCtrl';
import AdminViewModel from '../../shared/models/AdminViewModel';
import { RoleName } from "../../shared/models/UserModel";
import UserModal from "./UserModal";
import {IControllerDataStore} from '../../shared/base-sapien/client/BaseClientCtrl';

class UserList extends React.Component<RouteComponentProps<any>, IControllerDataStore & {Admin: AdminViewModel}>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "UserList";

    public static CONTROLLER = UserManagementCtrl;
    
    controller: UserManagementCtrl = UserManagementCtrl.GetInstance(this);

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



    //---------------------k-------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    componentWillMount() {
        //this.component.constructor.super(this.component.props).componentWillMount()
        this.controller.navigateOnClick(this.props.location.pathname);
        this.controller.getAllUsers();
    }

    render() {
        return <>
            {this.state.Admin.DeletionUser &&
                <Modal open={this.state.Admin.DeletionUser != null} basic onClose={e => this.controller.closeModal()}>
                    <Modal.Header color="red"><Icon name="remove user"/>Delete User</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            Are you sure you want to <strong>permanently delete {this.state.Admin.DeletionUser.FirstName + " " + this.state.Admin.DeletionUser.LastName}</strong>?
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            inverted
                            color='red'
                            icon='cancel'
                            labelPosition="right"
                            content="Cancel"
                            onClick={e => this.controller.dataStore.Admin.DeletionUser = null}
                        >
                        </Button>
                        <Button
                            inverted
                            color="orange"
                            icon='remove user'
                            labelPosition="right"
                            content='Permanently Delete User'
                            loading={this.state.ApplicationState.FormIsSubmitting}
                            onClick={e => this.controller.DeleteUser(this.state.Admin.DeletionUser)}
                        ></Button>
                    </Modal.Actions>
                </Modal>

            }
            {this.state.ApplicationState.ModalObject && <UserModal
                User={this.state.ApplicationState.ModalObject}
                CloseFunction={this.controller.closeModal.bind(this.controller)}
                SaveFunction={this.controller.saveUser.bind(this.controller)}
                Submitting={this.state.ApplicationState.FormIsSubmitting}
            />}
            <Segment 
                clearing
                style={{paddingBottom:0}}
            >
                    <Header
                        as="h1"
                        floated="left"
                    >
                        <Header.Content>
                            <Icon name="users"/>
                            Manage Users
                        </Header.Content>
                    </Header>
                    <Button color="blue"
                        icon="plus"
                        content="Add User"
                        labelPosition="right"
                        floated='right'
                        onClick={e => this.controller.createOrEditUser()}
                    >
                    </Button>
            </Segment>
            <Segment
                loading={this.state.ApplicationState.IsLoading}
            >
                <Table striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                <Label ribbon color="blue">Admins</Label>
                                Actions
                            </Table.HeaderCell>
                            <Table.HeaderCell>First Name</Table.HeaderCell>
                            <Table.HeaderCell>Last Name</Table.HeaderCell>
                            <Table.HeaderCell>Email</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.state.Admin.Users && this.state.Admin.Users.filter(u => u.Role == RoleName.ADMIN).map((u, i) =>
                            <Table.Row key={i}>
                                <Table.Cell textAlign="center">
                                    <Popup
                                        trigger={<Button
                                            color="blue"
                                            circular
                                            icon='edit'
                                            onClick={e => this.controller.createOrEditUser(u)}
                                        ></Button>}
                                        header={u.FirstName + " " + u.LastName}
                                        content="Edit User"
                                    />

                                    <Popup
                                        trigger={<Button
                                            color="red"
                                            circular
                                            icon='remove user'
                                            onClick={e => this.controller.dataStore.Admin.DeletionUser = u}
                                        ></Button>}
                                        header={u.FirstName + " " + u.LastName}
                                        content="Delete User"
                                    />                                    
                                    
                                    <Popup
                                        trigger={<Button
                                            circular
                                            icon='info'
                                        ></Button>}
                                        header={u.FirstName + " " + u.LastName}
                                        content="User Details"
                                    />         
                                </Table.Cell>
                                <Table.Cell>{u.FirstName}</Table.Cell>
                                <Table.Cell>{u.LastName}</Table.Cell>
                                <Table.Cell>{u.Email}</Table.Cell>
                            </Table.Row>
                        )}


                    </Table.Body>

                </Table>
            </Segment>
            <Segment
                loading={this.state.ApplicationState.IsLoading}
            >
                <Table striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                <Label 
                                    ribbon 
                                    color="blue">
                                    Players
                                </Label>
                                Actions
                            </Table.HeaderCell>
                            <Table.HeaderCell>First Name</Table.HeaderCell>
                            <Table.HeaderCell>Last Name</Table.HeaderCell>
                            <Table.HeaderCell>Email</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.state.Admin.Users && this.state.Admin.Users.filter(u => u.Role == RoleName.PLAYER).map((u, i) =>
                            <Table.Row key={i}>
                                <Table.Cell textAlign="center">
                                <Popup
                                        trigger={<Button
                                            color="blue"
                                            circular
                                            icon='edit'
                                            onClick={e => this.controller.createOrEditUser(u)}
                                        ></Button>}
                                        header={u.FirstName + " " + u.LastName}
                                        content="Edit User"
                                    />

                                    <Popup
                                        trigger={<Button
                                            color="red"
                                            circular
                                            icon='remove user'
                                            onClick={e => this.controller.dataStore.Admin.DeletionUser = u}
                                        ></Button>}
                                        header={u.FirstName + " " + u.LastName}
                                        content="Delete User"
                                    />                                    
                                    
                                    <Popup
                                        trigger={<Button
                                            circular
                                            icon='info'
                                        ></Button>}
                                        header={u.FirstName + " " + u.LastName}
                                        content="User Details"
                                    />
                                </Table.Cell>
                                <Table.Cell>{u.FirstName}</Table.Cell>
                                <Table.Cell>{u.LastName}</Table.Cell>
                                <Table.Cell>{u.Email}</Table.Cell>
                            </Table.Row>
                        )}


                    </Table.Body>

                </Table>
            </Segment>
        </>;
    }

}

export default withRouter(UserList);