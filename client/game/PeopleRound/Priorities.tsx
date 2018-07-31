import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";
import Decisions from '-!svg-react-loader?name=Icon!../../img/decisions.svg';
import FeedBackWrapper from "../FeedBackWrapper";

const { Button, Grid, Menu, Segment, Form, Dimmer, Loader, Header, Table } = Semantic;
const { Row, Column } = Grid;

export default class Priorities extends BaseComponent<any, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "Priorities";

    public static CONTROLLER = PeopleRoundCtrl;

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance();

    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(props: any) {
        super(props);
        
        this.controller.ParentController = PeopleRoundCtrl.GetInstance();
        this.state = this.controller.dataStore;
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

    render() {
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == Priorities.CLASS_NAME.toUpperCase())[0];
        
        if (this.state) {
            return <>
                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER && thisSubRound != null && thisSubRound.Questions &&
                    <div
                        className={(this.state.ApplicationState.ShowQuestions ? 'show ' : 'hide ') + (this.state.ApplicationState.MobileWidth ? "mobile-messages decisions" : "wide-messages decisions")}
                    >
                        <Form
                            style={{ width: '100%' }}
                        >

                            <Header>
                                <Decisions
                                    className="ui circular image"
                                    style={{ width: '40px' }} 
                                />
                                Decisions
                            </Header>

                            {thisSubRound.Questions.map((q, i) => {
                                return <Row
                                    key={"question-" + i.toString()}
                                >
                                    <EditableQuestionBlock
                                        Question={q}
                                        idx={i}
                                        key={i}
                                        SubRoundId={thisSubRound._id}
                                        onChangeHander={r => {
                                            console.log(r);
                                            this.controller.updateResponse(q, r)
                                        }}
                                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                    />
                                    <Button
                                        content='Submit'
                                        icon='checkmark'
                                        labelPosition='right'
                                        color="blue"
                                        loading={q.Response ? q.Response.IsSaving : false}
                                        onClick={e => {
                                            this.controller.Save1AResponse(q.Response, q, thisSubRound)
                                        }}
                                    />
                                </Row>

                            }
                            )}
                        </Form>
                    </div>
                }

                
                {this.state.ApplicationState.ShowRateUsers && this.state.RatingQuestions && <div
                    className={'show ' + (this.state.ApplicationState.MobileWidth ? "mobile-messages decisions" : "wide-messages decisions")}
                >
                    <Form
                        style={{ width: '100%' }}
                    >
                        <Header>
                            <Decisions
                                className="ui circular image"
                                style={{ width: '40px' }}
                            />
                            Decisions
                            </Header>

                        {this.state.RatingQuestions.map((q, i) => {
                            return <Row
                                key={"question-" + i.toString()}
                            >
                                <EditableQuestionBlock
                                    Question={q}
                                    idx={i}
                                    key={i}
                                    SubRoundId={thisSubRound._id}
                                    onChangeHander={r => {
                                        console.log(r);
                                        this.controller.updateResponse(q, r)
                                    }}
                                    IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                />
                                <Button
                                    content='Submit'
                                    icon='checkmark'
                                    labelPosition='right'
                                    color="blue"
                                    loading={q.Response ? q.Response.IsSaving : false}
                                    onClick={e => {
                                        this.controller.SaveResponse(q.Response, q, thisSubRound)
                                    }}
                                />
                            </Row>
                        }
                        )}
                    </Form>
                </div>
                }
                
                {thisSubRound && this.state.ApplicationState.SelectedMessage && !this.state.ApplicationState.ShowFeedback && !this.state.ApplicationState.ShowFeedback &&
                    <EditableContentBlock
                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Message={this.state.ApplicationState.SelectedMessage}
                    />
                }

            </>;
        } else {
            return <Segment loading>
                <Loader>Loading</Loader>
            </Segment>
        }
    }

}