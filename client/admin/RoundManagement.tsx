import * as React from "react";
import {
  Grid,
  Segment,
  Header,
  Icon,
  Button,
  Form,
  Checkbox,
  Input,
  Accordion,
  Message,
  Modal,
} from "semantic-ui-react";
const { Row } = Grid;

import RoundController from "./RoundManagementCtrl";
import AdminViewModel from "../../shared/models/AdminViewModel";
import { IControllerDataStore } from "../../shared/base-sapien/client/BaseClientCtrl";
import BaseComponent from "../../shared/base-sapien/client/shared-components/BaseComponent";
import RoundModel from "../../shared/models/RoundModel";
import SubRoundModel from "../../shared/models/SubRoundModel";
import RoundChangeLookup from "../../shared/models/RoundChangeLookup";
import { debounce } from "lodash";
import { arrayMoveSetWeights } from "../../shared/SapienUtils";
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
    if (!this.state.Admin.EditedRCL)
      this.controller.getAllRoundChangeLookups().then((r) => {
        this.state.Admin.RoundChangeLookups = this.state.Admin.RoundChangeLookups.sort(
          (a, b) => a.MinSlideNumber - b.MinSlideNumber
        );
      });
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

  debouncedOnChange = debounce(function (action, value) {
    //action(value).bind(this.controller);
    this.controller.saveRoundChangeLookup(value);
  }, 300).bind(this);

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
              content="Add Round"
              labelPosition="right"
              floated="right"
              onClick={(e) => {
                const round = new RoundModel();
                round.Weight = rounds.length;
                this.state.Admin.EditedRound = round;
              }}
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
                        this.state.Admin.AccordionIdx === j && round.IsActive
                      }
                      index={j}
                      onClick={this.handleClick}
                    >
                      <div className="admin-controls">
                        <div>
                          <Icon name="dropdown" />
                          Round {j + 1}: {round.Name}{" "}
                          <Icon
                            name="edit"
                            onClick={() =>
                              (this.state.Admin.EditedRound = {
                                ...round,
                              } as RoundModel)
                            }
                          />
                        </div>
                        <div>
                          <Button
                            color="blue"
                            icon="plus"
                            content="Add SubRound"
                            labelPosition="right"
                            floated="right"
                            size="mini"
                            onClick={(e) => {
                              const sr = new SubRoundModel();
                              sr.Weight = round.SubRounds.length;
                              sr.RoundId = round._id;
                              sr.IsActive = true;
                              this.state.Admin.EditedSubRound = sr;
                            }}
                          ></Button>
                          {j !== 0 && (
                            <Icon
                              name="arrow up"
                              onClick={(e) => {
                                e.stopPropagation();
                                const sortedRounds = arrayMoveSetWeights(
                                  rounds,
                                  j,
                                  j - 1
                                ).map((r, i) => ({
                                  ...r,
                                  ...{ Label: i + 1 },
                                }));
                                sortedRounds.forEach((r) =>
                                  this.controller.saveRound(r)
                                );
                              }}
                            />
                          )}
                          {j !== rounds.length - 1 && (
                            <Icon
                              name="arrow down"
                              onClick={(e) => {
                                e.stopPropagation();
                                const sortedRounds = arrayMoveSetWeights(
                                  rounds,
                                  j,
                                  j + 1
                                ).map((r, i) => ({
                                  ...r,
                                  ...{ Label: i + 1 },
                                }));
                                sortedRounds.forEach((r) =>
                                  this.controller.saveRound(r)
                                );
                              }}
                            />
                          )}
                          <Button
                            size="mini"
                            loading={
                              this.state.Admin.SavingRoundId &&
                              this.state.Admin.SavingRoundId === round.id
                            }
                            color={round.IsActive ? "red" : "green"}
                            onClick={(e) => {
                              e.stopPropagation();
                              this.controller.saveRound({
                                ...round as RoundModel,
                                ...{ IsActive: !round.IsActive },
                              } as RoundModel);
                            }}
                          >
                            {round.IsActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Icon
                            name={!round.IsActive ? "cancel" : "check"}
                            color={!round.IsActive ? "red" : "green"}
                          />
                        </div>
                      </div>
                    </Accordion.Title>
                    <Accordion.Content
                      active={
                        this.state.Admin.AccordionIdx === j && round.IsActive
                      }
                    >
                      {this.state.Admin.AccordionIdx === j &&
                        round.SubRounds.map((subRound, k) => (
                          <Segment>
                            <div className="admin-controls">
                              <Header as="h4" style={{ paddingLeft: 0 }}>
                                <Header.Content>
                                  {subRound.Name}
                                  <Icon
                                    name="edit"
                                    onClick={() =>
                                      (this.state.Admin.EditedSubRound = {
                                        ...subRound,
                                      } as SubRoundModel)
                                    }
                                  />
                                </Header.Content>
                              </Header>
                              <div
                                style={{
                                  display: "flex",
                                }}
                              >
                                <Form.Field style={{ marginRight: "1em" }}>
                                  {k !== 0 && (
                                    <Icon
                                      name="arrow up"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const SubRounds = arrayMoveSetWeights(
                                          round.SubRounds,
                                          k,
                                          k - 1
                                        ).map((r, i) => r._id);
                                        console.log(SubRounds);
                                        //return
                                        this.controller.saveRound({
                                          ...round,
                                          ...{ SubRounds },
                                        } as RoundModel);
                                      }}
                                    />
                                  )}
                                  {k !== round.SubRounds.length - 1 && (
                                    <Icon
                                      name="arrow down"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const SubRounds = arrayMoveSetWeights(
                                          round.SubRounds,
                                          k,
                                          k + 1
                                        ).map((r, i) => r._id);
                                        console.log(SubRounds);
                                        //return
                                        this.controller.saveRound({
                                          ...round,
                                          ...{ SubRounds },
                                        } as RoundModel);
                                      }}
                                    />
                                  )}
                                </Form.Field>
                                <Form.Field style={{ marginRight: "1em" }}>
                                  <Button
                                    size="mini"
                                    loading={
                                      this.state.Admin.SavingSubRoundId &&
                                      this.state.Admin.SavingSubRoundId ===
                                        subRound.id
                                    }
                                    color={subRound.IsActive ? "red" : "green"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.controller.saveSubRound({
                                        ...subRound,
                                        ...{ IsActive: !subRound.IsActive },
                                      } as SubRoundModel);
                                    }}
                                  >
                                    {subRound.IsActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </Button>
                                  <Icon
                                    name={
                                      !subRound.IsActive ? "cancel" : "check"
                                    }
                                    color={!subRound.IsActive ? "red" : "green"}
                                  />
                                </Form.Field>

                                <Form.Field>
                                  <label>Change Round</label>
                                  <select
                                    value={subRound.RoundId}
                                    onChange={(e) => {
                                      subRound.RoundId = e.target.value;
                                      round.SubRounds = round.SubRounds.filter(
                                        (sr) => sr._id !== subRound._id
                                      );
                                      let newRound = rounds.find(
                                        (r) => r._id === e.target.value
                                      );
                                      if (newRound) {
                                        newRound.SubRounds = [
                                          ...newRound.SubRounds,
                                          subRound,
                                        ];
                                        console.log(newRound);
                                        this.controller.saveSubRound(subRound);
                                        this.controller.saveRound(round);
                                        this.controller.saveRound(newRound);
                                      }
                                    }}
                                  >
                                    {rounds.map((r) => (
                                      <option key={r._id} value={r._id}>
                                        {r.Name}
                                      </option>
                                    ))}
                                  </select>
                                </Form.Field>
                              </div>
                            </div>

                            <Header floated="left">
                              <Header.Content>
                                Slide ranges that affect this subround
                              </Header.Content>
                            </Header>
                            <Button
                              color="blue"
                              icon="plus"
                              onClick={() => {
                                const lu = new RoundChangeLookup();
                                lu.RoundId = round._id;
                                lu.SubRoundId = subRound._id;
                                lu.Round = round.Name.toUpperCase();
                                lu.SubRound = subRound.Name;
                                this.state.Admin.EditedRCL = lu;
                              }}
                            >
                              Add Slide Mapping
                            </Button>

                            {lookups
                              .filter(
                                (lookup) =>
                                  lookup.SubRound ===
                                  subRound.Name.toUpperCase()
                              )
                              .map((lookup, i) => (
                                <Segment>
                                  <Form>
                                    <Form.Field>
                                      <Button
                                        size="mini"
                                        loading={
                                          this.state.Admin.SavingLookupId &&
                                          this.state.Admin.SavingLookupId ===
                                            subRound.id
                                        }
                                        color={
                                          lookup.IsActive ? "red" : "green"
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          this.controller.saveRoundChangeLookup(
                                            {
                                              ...lookup,
                                              ...{ IsActive: !lookup.IsActive },
                                            } as RoundChangeLookup
                                          );
                                        }}
                                      >
                                        {lookup.IsActive
                                          ? "Deactivate"
                                          : "Activate"}
                                      </Button>
                                      <Icon
                                        name={
                                          !lookup.IsActive ? "cancel" : "check"
                                        }
                                        color={
                                          !lookup.IsActive ? "red" : "green"
                                        }
                                      />
                                    </Form.Field>
                                    <Form.Field key={i}>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.ShowRateUsers}
                                        onChange={() => {
                                          lookup.ShowRateUsers = !lookup.ShowRateUsers;
                                          this.debouncedOnChange(
                                            this.controller
                                              .saveRoundChangeLookup,
                                            {
                                              ...lookup,
                                              ...{
                                                ShowRateUsers:
                                                  lookup.ShowRateUsers,
                                              },
                                            }
                                          );
                                        }}
                                        label="Participants rate each other"
                                      />{" "}
                                    </Form.Field>
                                    <Form.Field>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.ShowFeedback}
                                        onChange={() => {
                                          lookup.ShowFeedback = !lookup.ShowFeedback;
                                          this.debouncedOnChange(
                                            this.controller
                                              .saveRoundChangeLookup,
                                            {
                                              ...lookup,
                                              ...{
                                                ShowFeedback:
                                                  lookup.ShowFeedback,
                                              },
                                            }
                                          );
                                        }}
                                        label="Shows team scores to participants"
                                      />
                                    </Form.Field>

                                    <Form.Field>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.ShowIndividualFeedback}
                                        onChange={() => {
                                          lookup.ShowIndividualFeedback =
                                            lookup.ShowIndividualFeedback;
                                          this.debouncedOnChange(
                                            this.controller
                                              .saveRoundChangeLookup,
                                            {
                                              ...lookup,
                                              ...{
                                                ShowIndividualFeedback: !lookup.ShowIndividualFeedback,
                                              },
                                            }
                                          );
                                        }}
                                        label="Shows individual scores and feedback to participants"
                                      />{" "}
                                    </Form.Field>
                                    <Form.Field>
                                      <Checkbox
                                        toggle={true}
                                        checked={lookup.SlideFeedback}
                                        label="Shows scores in slidedeck"
                                        onChange={() => {
                                          lookup.SlideFeedback =
                                            lookup.SlideFeedback;
                                          this.debouncedOnChange(
                                            this.controller
                                              .saveRoundChangeLookup,
                                            {
                                              ...lookup,
                                              ...{
                                                SlideFeedback:
                                                  lookup.SlideFeedback,
                                              },
                                            }
                                          );
                                        }}
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
                                                  this.debouncedOnChange(
                                                    this.controller
                                                      .saveRoundChangeLookup,
                                                    {
                                                      ...lookup,
                                                      ...{
                                                        MinSlideNumber: value,
                                                      },
                                                    }
                                                  );
                                                  //lookup.MinSlideNumber = value;
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
                                                  this.debouncedOnChange(
                                                    this.controller
                                                      .saveRoundChangeLookup,
                                                    {
                                                      ...lookup,
                                                      ...{
                                                        MaxSlideNumber: value,
                                                      },
                                                    }
                                                  );
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
          <Modal
            open={
              this.state.Admin.EditedRound !== undefined &&
              this.state.Admin.EditedRound !== null
            }
            basic
            onClose={(e) => this.controller.closeModal()}
          >
            <Modal.Header color="red">Create or Edit Round</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Form>
                  <Form.Field>
                    <Input
                      label="Name asdf"
                      value={
                        this.state.Admin.EditedRound &&
                        this.state.Admin.EditedRound.Name
                      }
                      onChange={(e, val) => {
                        console.log("HEY", e, val);
                        this.state.Admin.EditedRound.Name = val.value;
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
                onClick={(e) =>
                  (this.controller.dataStore.Admin.EditedRound = null)
                }
              ></Button>
              <Button
                inverted
                color="blue"
                icon="save"
                labelPosition="right"
                content="Save Round"
                loading={this.state.ApplicationState.FormIsSubmitting}
                onClick={(e) =>
                  this.controller.saveRound(this.state.Admin.EditedRound)
                }
              ></Button>
            </Modal.Actions>
          </Modal>

          <Modal
            open={
              this.state.Admin.EditedSubRound !== undefined &&
              this.state.Admin.EditedSubRound != null
            }
            basic
            onClose={(e) => this.controller.closeModal()}
          >
            <Modal.Header color="red">Create or Edit SubRound</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Form>
                  <Form.Field>
                    <Input
                      label="Name"
                      value={
                        this.state.Admin.EditedSubRound &&
                        this.state.Admin.EditedSubRound.Name
                      }
                      onChange={(e, val) =>
                        (this.state.Admin.EditedSubRound.Name = val.value)
                      }
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
                onClick={(e) =>
                  (this.controller.dataStore.Admin.EditedSubRound = null)
                }
              ></Button>
              <Button
                inverted
                color="blue"
                icon="save"
                labelPosition="right"
                content="Save SubRound"
                loading={this.state.ApplicationState.FormIsSubmitting}
                onClick={(e) =>
                  this.controller.saveSubRound(this.state.Admin.EditedSubRound)
                }
              ></Button>
            </Modal.Actions>
          </Modal>
          {this.state.Admin.EditedRCL && (
            <Modal
              open={
                this.state.Admin.EditedRCL !== undefined &&
                this.state.Admin.EditedRCL !== null
              }
              onClose={(e) => this.controller.closeModal()}
            >
              <Modal.Header color="red">
                Create or Edit Slide Mapping
              </Modal.Header>
              <Modal.Content style={{ overflow: "auto", maxHeight: '72vh' }}>
                <Modal.Description>
                  <Form>
                    <Form.Field>
                      <Checkbox
                        toggle={true}
                        checked={
                          this.state.Admin.EditedRCL &&
                          this.state.Admin.EditedRCL.ShowRateUsers
                        }
                        onChange={() => {
                          this.state.Admin.EditedRCL.ShowRateUsers = !this.state
                            .Admin.EditedRCL.ShowRateUsers;
                        }}
                        label="Participants rate each other"
                      />{" "}
                    </Form.Field>
                    <Form.Field>
                      <Checkbox
                        toggle={true}
                        checked={
                          this.state.Admin.EditedRCL &&
                          this.state.Admin.EditedRCL.ShowFeedback
                        }
                        onChange={() => {
                          this.state.Admin.EditedRCL.ShowFeedback = !this.state
                            .Admin.EditedRCL.ShowFeedback;
                        }}
                        label="Shows team scores to participants"
                      />
                    </Form.Field>

                    <Form.Field>
                      <Checkbox
                        toggle={true}
                        checked={
                          this.state.Admin.EditedRCL &&
                          this.state.Admin.EditedRCL.ShowIndividualFeedback
                        }
                        onChange={() => {
                          this.state.Admin.EditedRCL.ShowIndividualFeedback = this.state.Admin.EditedRCL.ShowIndividualFeedback;
                        }}
                        label="Shows individual scores and feedback to participants"
                      />{" "}
                    </Form.Field>
                    <Form.Field>
                      <Checkbox
                        toggle={true}
                        checked={
                          this.state.Admin.EditedRCL &&
                          this.state.Admin.EditedRCL.SlideFeedback
                        }
                        label="Shows scores in slidedeck"
                        onChange={() => {
                          this.state.Admin.EditedRCL.SlideFeedback = this.state.Admin.EditedRCL.SlideFeedback;
                        }}
                      />{" "}
                    </Form.Field>

                    <Grid columns={2}>
                      <Grid.Column mobile={16} tablet={4} computer={4}>
                        <Form.Field>
                          <Input
                            floated="left"
                            label="First slide:"
                            value={
                              this.state.Admin.EditedRCL &&
                              this.state.Admin.EditedRCL.MinSlideNumber
                            }
                            onChange={(event: any) => {
                              let value = null;
                              if (event.target.value) {
                                value = parseInt(event.target.value);
                                // Test for valid number
                                if (!isNaN(value)) {
                                  this.state.Admin.EditedRCL.MinSlideNumber = value;

                                  //this.state.Admin.EditedRCL.MinSlideNumber = value;
                                }
                              }
                            }}
                          />
                        </Form.Field>
                      </Grid.Column>
                      <Grid.Column mobile={16} tablet={16} computer={12}>
                        <iframe
                          src={`https://docs.google.com/presentation/d/e/2PACX-1vQ573FZ-_vIiJs6xrPoAV8Euqkb3FzpkGOH7tIs_Cwc1Cj330WwCStgiSDCwDAiVsqKnuIXBawO4kgG/embed?start=false&loop=false&delayms=60000#slide=${this.state.Admin.EditedRCL.MinSlideNumber}`}
                          width="350"
                          height="228"
                        ></iframe>
                      </Grid.Column>
                    </Grid>
                    <Grid columns={2}>
                      <Grid.Column mobile={16} tablet={4} computer={4}>
                        <Form.Field>
                          <Input
                            label="Last slide"
                            value={
                              this.state.Admin.EditedRCL &&
                              this.state.Admin.EditedRCL.MaxSlideNumber
                            }
                            onChange={(event: any) => {
                              let value = null;
                              if (event.target.value) {
                                value = parseInt(event.target.value);
                                // Test for valid number
                                if (!isNaN(value)) {
                                  this.state.Admin.EditedRCL.MaxSlideNumber = value;
                                }
                              }
                            }}
                          />
                        </Form.Field>
                      </Grid.Column>
                      <Grid.Column mobile={16} tablet={16} computer={12}>
                        <iframe
                          src={`https://docs.google.com/presentation/d/e/2PACX-1vQ573FZ-_vIiJs6xrPoAV8Euqkb3FzpkGOH7tIs_Cwc1Cj330WwCStgiSDCwDAiVsqKnuIXBawO4kgG/embed?start=false&loop=false&delayms=60000#slide=${this.state.Admin.EditedRCL.MaxSlideNumber}`}
                          width="350"
                          height="228"
                        ></iframe>
                      </Grid.Column>
                    </Grid>
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
                  onClick={(e) =>
                    (this.controller.dataStore.Admin.EditedRCL = null)
                  }
                ></Button>
                <Button
                  inverted
                  color="blue"
                  icon="save"
                  labelPosition="right"
                  content="Save Round"
                  loading={this.state.ApplicationState.FormIsSubmitting}
                  onClick={(e) =>
                    this.controller.saveRoundChangeLookup(
                      this.state.Admin.EditedRCL
                    )
                  }
                ></Button>
              </Modal.Actions>
            </Modal>
          )}
          <Message
            floating={true}
            className={`alert ${this.state.Admin.IsDirty ? " shown" : " down"}`}
            warning
            header="Changes Saving"
            icon="save"
          />

          <Message
            className={`alert ${this.state.Admin.IsClean ? " shown" : " down"}`}
            floating={true}
            success
            header="All Changes Saved"
            icon="check"
          />

          <Message
            className={`alert ${
              this.state.Admin.HasError ? " shown" : " hidden"
            }`}
            floating={true}
            negative
            header="There was an error saving your changes."
            icon="warning"
          />
        </div>
      );
    }

    return <Segment loading></Segment>;
  }
}
