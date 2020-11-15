import * as React from "react";
import {
  Grid,
  Table,
  Modal,
  Button,
  Segment,
  Label,
  Header,
  Icon,
  Form,
  Input,
  Checkbox,
  Popup,
  Pagination,
} from "semantic-ui-react";
const { Row, Column } = Grid;
import UserManagementCtrl from "./UserManagementCtrl";
import AdminViewModel from "../../shared/models/AdminViewModel";
import { RoleName } from "../../shared/models/UserModel";
import UserModalNew from "./UserModalNew";
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";

export default class UserList extends BaseComponent<
  any,
  IControllerDataStore & { Admin: AdminViewModel }
> {
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

  constructor(props: any) {
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

  componentDidMount() {
    super.componentDidMount();
    this.controller.getAllUsers();
  }

  render() {
    return (
      <>
        {this.state.Admin.DeletionUser && (
          <Modal
            open={this.state.Admin.DeletionUser != null}
            basic
            onClose={(e) => this.controller.closeModal()}
          >
            <Modal.Header color="red">
              <Icon name="remove user" />
              Delete User
            </Modal.Header>
            <Modal.Content>
              <Modal.Description>
                Are you sure you want to <strong>permanently</strong> delete{" "}
                {this.state.Admin.DeletionUser.FirstName +
                  " " +
                  this.state.Admin.DeletionUser.LastName}
                ?
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button
                inverted
                color="red"
                icon="cancel"
                labelPosition="right"
                content="Cancel"
                onClick={(e) =>
                  (this.controller.dataStore.Admin.DeletionUser = null)
                }
              ></Button>
              <Button
                inverted
                color="orange"
                icon="remove user"
                labelPosition="right"
                content="Permanently Delete User"
                loading={this.state.ApplicationState.FormIsSubmitting}
                onClick={(e) =>
                  this.controller.DeleteUser(this.state.Admin.DeletionUser)
                }
              ></Button>
            </Modal.Actions>
          </Modal>
        )}
        {this.state.ApplicationState.ModalObject && (
          <UserModalNew
            passedUser={this.state.ApplicationState.ModalObject}
            CloseFunction={this.controller.closeModal.bind(this.controller)}
            SaveFunction={this.controller.saveUser.bind(this.controller)}
            Submitting={this.state.ApplicationState.FormIsSubmitting}
          />
        )}
        <Segment clearing style={{ paddingBottom: 0 }}>
          <Header as="h1" floated="left">
            <Header.Content>
              <Icon name="users" />
              Manage Users
            </Header.Content>
          </Header>
          <Button
            color="blue"
            icon="plus"
            content="Add User"
            labelPosition="right"
            floated="right"
            onClick={(e) => this.controller.createOrEditUser()}
          ></Button>
        </Segment>
        <Segment loading={this.state.ApplicationState.IsLoading}>
          <Table striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <Label ribbon color="blue">
                    Admins
                  </Label>
                  Actions
                </Table.HeaderCell>
                <Table.HeaderCell>
                  First Name
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers(
                        "FirstName",
                        v.value,
                        RoleName.ADMIN
                      );
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Last Name
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers(
                        "LastName",
                        v.value,
                        RoleName.ADMIN
                      );
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Email
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers(
                        "Email",
                        v.value,
                        RoleName.ADMIN
                      );
                    }}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.state.Admin.AdminUsers &&
                this.state.Admin.AdminUsers.map((u, i) => (
                  <Table.Row key={i}>
                    <Table.Cell textAlign="center">
                      <Popup
                        trigger={
                          <Button
                            color="blue"
                            circular
                            icon="edit"
                            onClick={(e) => this.controller.createOrEditUser(u)}
                          ></Button>
                        }
                        header={u.FirstName + " " + u.LastName}
                        content="Edit User"
                      />
                      {u._id != this.state.ApplicationState.CurrentUser._id && (
                        <Popup
                          trigger={
                            <Button
                              color="red"
                              circular
                              icon="remove user"
                              onClick={(e) =>
                                (this.controller.dataStore.Admin.DeletionUser = u)
                              }
                            ></Button>
                          }
                          header={u.FirstName + " " + u.LastName}
                          content={
                            u._id != this.state.ApplicationState.CurrentUser._id
                              ? "Delete User"
                              : "You can't delete yourself."
                          }
                        />
                      )}

                      {u._id == this.state.ApplicationState.CurrentUser._id && (
                        <Popup
                          trigger={
                            <Button
                              color="red"
                              circular
                              icon="remove user"
                              style={{
                                cursor: "not-allowed",
                              }}
                            ></Button>
                          }
                          header={u.FirstName + " " + u.LastName}
                          content={
                            u._id != this.state.ApplicationState.CurrentUser._id
                              ? "Delete User"
                              : "You can't delete yourself."
                          }
                        />
                      )}
                    </Table.Cell>
                    <Table.Cell>{u.FirstName}</Table.Cell>
                    <Table.Cell>{u.LastName}</Table.Cell>
                    <Table.Cell>{u.Email}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </Segment>
        <Segment loading={this.state.ApplicationState.IsLoading}>
          <Table striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <Label ribbon color="blue">
                    Facilitators
                  </Label>
                  Actions
                </Table.HeaderCell>
                <Table.HeaderCell>
                  First Name
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers(
                        "FirstName",
                        v.value,
                        RoleName.FACILITATOR
                      );
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Last Name
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers(
                        "LastName",
                        v.value,
                        RoleName.FACILITATOR
                      );
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Email
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers(
                        "Email",
                        v.value,
                        RoleName.FACILITATOR
                      );
                    }}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.state.Admin.FacilitatorUsers &&
                this.state.Admin.FacilitatorUsers.map((u, i) => (
                  <Table.Row key={i}>
                    <Table.Cell textAlign="center">
                      <Popup
                        trigger={
                          <Button
                            color="blue"
                            circular
                            icon="edit"
                            onClick={(e) => this.controller.createOrEditUser(u)}
                          ></Button>
                        }
                        header={u.FirstName + " " + u.LastName}
                        content="Edit User"
                      />

                      <Popup
                        trigger={
                          <Button
                            color="red"
                            circular
                            icon="remove user"
                            onClick={(e) =>
                              (this.controller.dataStore.Admin.DeletionUser = u)
                            }
                          ></Button>
                        }
                        header={u.FirstName + " " + u.LastName}
                        content="Delete User"
                      />

                      <Popup
                        trigger={<Button circular icon="info"></Button>}
                        header={u.FirstName + " " + u.LastName}
                        content="User Details"
                      />
                    </Table.Cell>
                    <Table.Cell>{u.FirstName}</Table.Cell>
                    <Table.Cell>{u.LastName}</Table.Cell>
                    <Table.Cell>{u.Email}</Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
          </Table>
        </Segment>
        <Segment loading={this.state.ApplicationState.IsLoading}>
          <Table striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <Label ribbon color="blue">
                    Players
                  </Label>
                  Actions
                </Table.HeaderCell>

                <Table.HeaderCell>
                  First Name
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers("FirstName", v.value);
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Last Name
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers("LastName", v.value);
                    }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  Email
                  <br />
                  <Input
                    icon="search"
                    onChange={(e, v) => {
                      this.controller.FilterUsers("Email", v.value);
                    }}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.state.Admin.PlayerUsers &&
                this.state.Admin.PlayerUsers.filter(
                  (u) => u.Role == RoleName.PLAYER
                )
                  .slice(
                    this.state.Admin.CurrentPage * 25,
                    this.state.Admin.CurrentPage * 25 + 25
                  )
                  .map((u, i) => (
                    <Table.Row key={i}>
                      <Table.Cell textAlign="center">
                        <Popup
                          trigger={
                            <Button
                              color="blue"
                              circular
                              icon="edit"
                              onClick={(e) =>
                                this.controller.createOrEditUser(u)
                              }
                            ></Button>
                          }
                          header={u.FirstName + " " + u.LastName}
                          content="Edit User"
                        />

                        <Popup
                          trigger={
                            <Button
                              color="red"
                              circular
                              icon="remove user"
                              onClick={(e) =>
                                (this.controller.dataStore.Admin.DeletionUser = u)
                              }
                            ></Button>
                          }
                          header={u.FirstName + " " + u.LastName}
                          content="Delete User"
                        />

                        <Popup
                          trigger={<Button circular icon="info"></Button>}
                          header={u.FirstName + " " + u.LastName}
                          content="User Details"
                        />
                      </Table.Cell>
                      <Table.Cell>{u.FirstName}</Table.Cell>
                      <Table.Cell>{u.LastName}</Table.Cell>
                      <Table.Cell>{u.Email}</Table.Cell>
                    </Table.Row>
                  ))}
            </Table.Body>
          </Table>
          {this.state.Admin.CurrentPage.toString()}
          <Pagination
            defaultActivePage={1}
            totalPages={Math.round(this.state.Admin.PlayerUsers.length / 25)}
            onPageChange={(event, data) => {
              console.log(event, data);
              this.state.Admin.CurrentPage = Number(data.activePage);
            }}
          />
        </Segment>
      </>
    );
  }
}

//export default withRouter(UserList);
