import * as React from "react";
import {
  Modal,
  Button,
  Label,
  Header,
  Icon,
  Form,
  Input,
  Checkbox,
  Dropdown
} from "semantic-ui-react";

import { JobName } from "../../shared/models/UserModel";
import FacilitationRoundResponseMapping from "../../shared/models/FacilitationRoundResponseMapping";

interface TeamModalProps {
  Team: FacilitationRoundResponseMapping;
  CloseFunction: () => void;
  SaveFunction: (team: FacilitationRoundResponseMapping) => void;
  ValidationFunc: (team: FacilitationRoundResponseMapping) => (string | boolean) [];
  Submitting: boolean;
}

export default class TeamJobsMo extends React.Component< TeamModalProps,{ team: FacilitationRoundResponseMapping }> {
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

  constructor(props: TeamModalProps) {
    super(props);
    this.state = { team: props.Team };
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

    const { Team, CloseFunction, SaveFunction, Submitting, ValidationFunc } = this.props;


    const getValidationErrors = ( team: FacilitationRoundResponseMapping) => {
      return ValidationFunc(team).filter(e => typeof e == 'string').map(e => <p className="error">{e}</p>);
    }

    return (
      <>
        <Modal open={Team != null} basic onClose={e => CloseFunction()}>
          <Modal.Header color="red">
            <Icon name="remove user" />
            Set Roles
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              Set the in-game roles for this team
              <Form>
                {Team.Members &&
                  Team.Members.map((p, j) => {
                    return (
                      <Form.Field key={j}>
                        <h2
                            style={{
                                color: 'white',
                                marginBottom:0,
                                marginTop:'10px'
                            }}
                        >{p.FirstName} {p.LastName}</h2>
                        <span>
                          <select
                            onChange={e => {
                              let team = {...this.state.team} as FacilitationRoundResponseMapping;

                              team.Members = team.Members.map(player => {
                                if (player._id == p._id)
                                  player.Job == (e.target.value as JobName);
                                return player;
                              });

                              this.setState({ team });

                              ValidationFunc(team);

                            }}
                            value={p.Job}
                          >
                            {Object.keys(JobName).map(jn => (
                              <option>{JobName[jn]}</option>
                            ))}
                          </select>
                        </span>
                      </Form.Field>
                    );
                  })}
              </Form>
            </Modal.Description>
          </Modal.Content>

          {getValidationErrors(this.state.team)}

          <Modal.Actions>
            <Button
              inverted
              color="red"
              icon="cancel"
              labelPosition="right"
              content="Cancel"
              onClick={e => CloseFunction()}
            />
            <Button
              inverted
              color="blue"
              icon="user"
              labelPosition="right"
              content="Update Roles"
              loading={Submitting}
              onClick={e => SaveFunction(this.state.team)}
            />
          </Modal.Actions>
        </Modal>
        }
      </>
    );
  }
}
