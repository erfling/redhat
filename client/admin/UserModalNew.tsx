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
} from "semantic-ui-react";
const { Row, Column } = Grid;
import UserModel, { RoleName } from "../../shared/models/UserModel";

interface IUserModalProps {
  passedUser: UserModel;
  CloseFunction: () => void;
  SaveFunction: (user: UserModel) => void;
  Submitting: boolean;
}

class UserModalNew extends React.Component<
  IUserModalProps,
  { user: UserModel }
> {
  constructor(props: IUserModalProps) {
    super(props);
    this.state = { user: props.passedUser };
  }

  updateUser = (
    prop: keyof UserModel,
    value: string | boolean,
    oldUser: UserModel
  ) => {
    const newUser = { ...oldUser, ...{ [prop]: value } } as UserModel;
    this.setState({
      user: newUser,
    });
  };

  render() {
    const { user } = this.state;
    const { SaveFunction, CloseFunction, Submitting } = this.props;
    const { updateUser } = this;

    return (
      <>
        <Modal open={user != null} basic onClose={(e) => CloseFunction()}>
          <Modal.Header icon="user">
            <Icon name="user" />
            Create or Edit a User
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Form inverted>
                <Form.Field>
                  <label>First Name</label>
                  <Input
                    value={(user as UserModel).FirstName}
                    onChange={(e) =>
                      updateUser(
                        "FirstName",
                        (e.target as HTMLFormElement).value,
                        user
                      )
                    }
                    placeholder="First Name"
                  />
                </Form.Field>

                <Form.Field>
                  <label>Last Name</label>
                  <Input
                    value={(user as UserModel).LastName}
                    onChange={(e) =>
                      updateUser(
                        "LastName",
                        (e.target as HTMLFormElement).value,
                        user
                      )
                    }
                    placeholder="Last Name"
                  />
                </Form.Field>

                <Form.Field>
                  <label>Email</label>
                  <Input
                    value={(user as UserModel).Email}
                    onChange={(e) =>
                      updateUser(
                        "Email",
                        (e.target as HTMLFormElement).value,
                        user
                      )
                    }
                    placeholder="Email"
                  />
                </Form.Field>
                <div className="grouped fields">
                  <Form.Field>
                    <label>Role</label>
                    <Checkbox
                      radio
                      label="Player"
                      name="checkboxRadioGroup"
                      value={RoleName.PLAYER}
                      checked={user.Role === RoleName.PLAYER}
                      onChange={() => {
                        updateUser("Role", RoleName.PLAYER, user);
                        updateUser("RoleSaved", false, user);
                      }}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Checkbox
                      radio
                      label="Facilitator"
                      name="checkboxRadioGroup"
                      value={RoleName.FACILITATOR}
                      checked={user.Role === RoleName.FACILITATOR}
                      onChange={() => {
                        updateUser("Role", RoleName.FACILITATOR, user);
                        updateUser("RoleSaved", true, user);
                      }}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Checkbox
                      radio
                      label="Admin"
                      name="checkboxRadioGroup"
                      value={RoleName.ADMIN}
                      checked={user.Role === RoleName.ADMIN}
                      onChange={() => {
                        updateUser("Role", RoleName.ADMIN, user);
                        updateUser("RoleSaved", true, user);
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
              color="red"
              icon="cancel"
              labelPosition="right"
              content="Cancel"
              onClick={(e) => CloseFunction()}
            ></Button>
            <Button
              inverted
              color="blue"
              icon="check"
              labelPosition="right"
              content="Save User"
              loading={Submitting}
              onClick={(e) => SaveFunction(user)}
            ></Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

export default UserModalNew;
