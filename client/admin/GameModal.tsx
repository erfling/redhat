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
  Dropdown,
} from "semantic-ui-react";
import UserModel, { RoleName } from "../../shared/models/UserModel";
import GameModel from "../../shared/models/GameModel";
import { DateInput } from "semantic-ui-calendar-react";

interface GameModalProps {
  Game: GameModel;
  Users: UserModel[];
  CloseFunction: () => void;
  SaveFunction: (game: GameModel) => void;
  Submitting: boolean;
}

export default class GameModal extends React.Component<
  GameModalProps,
  { Game: GameModel }
> {
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
    this.state = { Game: props.Game };
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

  updateGame = (
    prop: keyof GameModel,
    value: string | boolean,
    oldGame: GameModel
  ) => {
    const newGame = { ...oldGame, ...{ [prop]: value } } as GameModel;
    this.setState({
      Game: newGame,
    });
  };

  render() {
    return (
      <>
        <Modal
          open={this.props.Game != null}
          basic
          onClose={(e) => this.props.CloseFunction()}
        >
          <Modal.Header>
            <Icon name="game" />
            {this.props.Game._id != null ? "Edit" : "Create"} Game
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Form inverted>
                <Form.Field>
                  <label>Location</label>
                  <Input
                    value={this.state.Game.Location}
                    onChange={(e) => {
                      this.updateGame(
                        "Location",
                        (e as any).target.value,
                        this.state.Game
                      );
                    }}
                    placeholder="Location"
                  />
                </Form.Field>
                <Form.Field
                  onClick={(e) => {
                    setTimeout(() => {
                      let popup = document.querySelector("#suirCalendarPopup");
                      (popup.parentNode as HTMLDivElement).style.display =
                        "none";

                      if (popup) {
                        (popup.parentNode as HTMLDivElement).style.filter =
                          "none";
                        (popup.parentNode as HTMLDivElement).style[
                          "-webkit-filter"
                        ] = "none";
                        (popup.parentNode as HTMLDivElement).style.display =
                          "block";
                      }
                    }, 1);
                  }}
                >
                  <label>Start Date</label>
                  <DateInput
                    name="date"
                    placeholder="Date"
                    value={this.state.Game.DatePlayed}
                    iconPosition="left"
                    dateFormat="MM/DD/YYYY"
                    onChange={(e, output) => {
                      this.updateGame(
                        "DatePlayed",
                        output.value,
                        this.state.Game
                      );
                    }}
                  />
                </Form.Field>
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
              onClick={(e) => this.props.CloseFunction()}
            ></Button>
            <Button
              inverted
              color="blue"
              icon="check"
              labelPosition="right"
              content="Save Game"
              loading={this.props.Submitting}
              onClick={(e) => this.props.SaveFunction(this.state.Game)}
            ></Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

/**<Form.Field>
                                    <label>PIN (remove this soon)</label>
                                    <Input
                                        value={this.props.Game.GamePIN}
                                        onChange={(e) => this.props.Game.GamePIN = parseInt((e.target as HTMLInputElement).value)}
                                        placeholder="GamePIN"
                                    />
                                </Form.Field> */
