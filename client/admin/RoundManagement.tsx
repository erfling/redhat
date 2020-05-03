import * as React from "react";
import {
  Grid,
  Sidebar,
  Menu,
  Segment,
  Header,
  Icon,
  Button,
  Form,
  Checkbox,
  Input,
  Image,
  Accordion,
  Divider,
  Container,
} from "semantic-ui-react";
const { Row, Column } = Grid;
import {
  RouteComponentProps,
  withRouter,
  Switch,
  Route,
  Redirect,
} from "react-router";
import RoundController from "./RoundManagementCtrl";
import AdminViewModel from "../../shared/models/AdminViewModel";
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import UserList from "./UserList";
import GameList from "./GameList";
import { RoleName } from "../../shared/models/UserModel";
import GameDetail from "./GameDetail";
import RoundModel from "../../shared/models/RoundModel";

export default class RoundManagement extends BaseComponent<
  any,
  IControllerDataStore & { Admin: AdminViewModel }
> {
  //----------------------------------------------------------------------
  //
  //  Properties
  //
  //----------------------------------------------------------------------

  public static CLASS_NAME = "RoundManagement";

  public static CONTROLLER = RoundController;

  controller: RoundController = RoundController.GetInstance(this);

  //----------------------------------------------------------------------
  //
  //  Constructor
  //
  //----------------------------------------------------------------------

  constructor(props: any) {
    super(props);

    this.state = this.controller.dataStore;
    this.controller.getAllRoundChangeLookups();
    this.controller.getAllRounds();
    //this
  }

  //----------------------------------------------------------------------
  //
  //  Event Handlers
  //
  //----------------------------------------------------------------------

  handleClick = (e, titleProps: { active: boolean; index: number }) => {
    this.state.Admin.AccordionIdx = titleProps.active ? -1 : titleProps.index;
  };

  //----------------------------------------------------------------------
  //
  //  Methods
  //
  //----------------------------------------------------------------------

  render() {
    if (
      this.state &&
      this.state.ApplicationState &&
      this.state.Admin.Rounds &&
      this.state.Admin.RoundChangeLookups
    ) {
      const lookups = this.state.Admin.RoundChangeLookups;
      const rounds = this.state.Admin.Rounds;

      return (
        <div>
          <Segment clearing style={{ paddingBottom: 0 }}>
            <Header as="h1" floated="left">
              <Header.Content>Manage Rounds</Header.Content>
            </Header>
            <Button
              color="blue"
              icon="plus"
              content="Add Game"
              labelPosition="right"
              floated="right"
              onClick={(e) => {}}
            ></Button>
          </Segment>

          <Segment
            loading={
              !this.state.Admin.RoundChangeLookups ||
              !this.state.Admin.RoundChangeLookups.length ||
              !this.state.Admin.Rounds ||
              !this.state.Admin.Rounds.length
            }
          >
            <Row>
              <Accordion styled style={{ width: "100%" }}>
                {rounds.map((round, j) => (
                  <>
                    <Accordion.Title
                      active={
                        this.state.Admin.AccordionIdx === j && round.Active
                      }
                      index={j}
                      onClick={this.handleClick}
                    >
                        <Icon name="dropdown" />
                        Round {j + 1}: {round.Name}{" "}
                        <Button
                          size="mini"
                          loading={
                            this.state.Admin.SavingRoundId &&
                            this.state.Admin.SavingRoundId === round.id
                          }
                          color={round.Active ? "red" : "green"}
                          onClick={(e) => {
                            e.stopPropagation();
                            this.controller.saveRound({
                              ...round,
                              ...{ Active: !round.Active },
                            } as RoundModel);
                          }}
                        >
                          {round.Active ? "Deactivate" : "Activate"}
                        </Button>
                        <Icon
                          name={!round.Active ? "cancel" : "check"}
                          color={!round.Active ? "red" : "green"}
                        />
                    </Accordion.Title>
                    <Accordion.Content
                      active={
                        this.state.Admin.AccordionIdx === j && round.Active
                      }
                    >
                      {this.state.Admin.AccordionIdx === j &&
                        round.SubRounds.map((subRound) => (
                          <Segment>
                            <Header as="h4">
                              <Header.Content>{subRound.Name}</Header.Content>
                            </Header>
                            {lookups
                              .filter(
                                (lookup) =>
                                  lookup.SubRound ===
                                  subRound.Name.toUpperCase()
                              )
                              .map((lookup, i) => (
                                <Segment>
                                  <h3>
                                    Slide ranges that affect this subround
                                  </h3>
                                  <Form>
                                    <Form.Field key={i}>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.ShowRateUsers}
                                        onChange={() =>
                                          (lookup.ShowRateUsers = !lookup.ShowRateUsers)
                                        }
                                        label="Participants rate each other"
                                      />{" "}
                                    </Form.Field>
                                    <Form.Field>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.ShowFeedback}
                                        onChange={() =>
                                          (lookup.ShowFeedback = !lookup.ShowFeedback)
                                        }
                                        label="Shows team scores to participants"
                                      />
                                    </Form.Field>

                                    <Form.Field>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.ShowIndividualFeedback}
                                        onChange={() =>
                                          (lookup.ShowIndividualFeedback = !lookup.ShowIndividualFeedback)
                                        }
                                        label="Shows individual scores and feedback to participants"
                                      />{" "}
                                    </Form.Field>
                                    <Form.Field>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.SlideFeedback}
                                        label="Shows scores in slidedeck"
                                        onChange={() =>
                                          (lookup.SlideFeedback = !lookup.SlideFeedback)
                                        }
                                      />{" "}
                                    </Form.Field>

                                    <Grid columns={2}>
                                      <Grid.Column
                                        mobile={16}
                                        tablet={4}
                                        computer={4}
                                      >
                                        <Form.Field>
                                          <Input
                                            floated="left"
                                            label="First slide:"
                                            value={lookup.MinSlideNumber}
                                            onChange={(event: any) => {
                                              let value = null;
                                              if (event.target.value) {
                                                value = parseInt(
                                                  event.target.value
                                                );
                                                // Test for valid number
                                                if (!isNaN(value)) {
                                                  lookup.MinSlideNumber = value;
                                                }
                                              }
                                            }}
                                          />
                                        </Form.Field>
                                      </Grid.Column>
                                      <Grid.Column
                                        mobile={16}
                                        tablet={16}
                                        computer={12}
                                      >
                                        <iframe
                                          src={`https://docs.google.com/presentation/d/e/2PACX-1vQ573FZ-_vIiJs6xrPoAV8Euqkb3FzpkGOH7tIs_Cwc1Cj330WwCStgiSDCwDAiVsqKnuIXBawO4kgG/embed?start=false&loop=false&delayms=60000#slide=${lookup.MinSlideNumber}`}
                                          width="350"
                                          height="228"
                                        ></iframe>
                                      </Grid.Column>
                                    </Grid>
                                    <Grid columns={2}>
                                      <Grid.Column
                                        mobile={16}
                                        tablet={4}
                                        computer={4}
                                      >
                                        <Form.Field>
                                          <Input
                                            label="Last slide"
                                            value={lookup.MaxSlideNumber}
                                            onChange={(event: any) => {
                                              let value = null;
                                              if (event.target.value) {
                                                value = parseInt(
                                                  event.target.value
                                                );
                                                // Test for valid number
                                                if (!isNaN(value)) {
                                                  lookup.MaxSlideNumber = value;
                                                }
                                              }
                                            }}
                                          />
                                        </Form.Field>
                                      </Grid.Column>
                                      <Grid.Column
                                        mobile={16}
                                        tablet={16}
                                        computer={12}
                                      >
                                        <iframe
                                          src={`https://docs.google.com/presentation/d/e/2PACX-1vQ573FZ-_vIiJs6xrPoAV8Euqkb3FzpkGOH7tIs_Cwc1Cj330WwCStgiSDCwDAiVsqKnuIXBawO4kgG/embed?start=false&loop=false&delayms=60000#slide=${lookup.MaxSlideNumber}`}
                                          width="350"
                                          height="228"
                                        ></iframe>
                                      </Grid.Column>
                                    </Grid>
                                  </Form>
                                </Segment>
                              ))}
                          </Segment>
                        ))}
                    </Accordion.Content>
                  </>
                ))}
              </Accordion>
            </Row>
          </Segment>
        </div>
      );
    }

    return <Segment loading></Segment>;
  }
}

// {this.state && this.state.Users && <h1>{this.state.Users.length} Users</h1>}game: ComponentsVO.Game,
//admin: ComponentsVO.Admin,
//login: ComponentsVO.Login
//{this.state && this.state.Games && <h1>{this.state.Games.length} Games</h1>}
