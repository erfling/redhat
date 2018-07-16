import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import { RoleName } from "../../../shared/models/UserModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import QuestionModel from "../../../shared/models/QuestionModel";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';

const { Button, Grid, Form, Dimmer, Loader } = Semantic;
const { Row, Column } = Grid;


class Hiring extends React.Component<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance();

    public static CLASS_NAME = "Hiring";

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



    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    render() {
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == Hiring.CLASS_NAME.toUpperCase())[0]

        if (this.state) {
            return <>
                {!this.state.ApplicationState.CurrentUser.IsLeader && thisSubRound &&

                    <EditableContentBlock
                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                        IsLeader={this.state.ApplicationState.CurrentUser.IsLeader}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Content={thisSubRound.IndividualContributorContent}
                    />
                }

                {this.state.ApplicationState.CurrentUser.IsLeader && thisSubRound &&

                    <EditableContentBlock
                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                        IsLeader={this.state.ApplicationState.CurrentUser.IsLeader}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Content={thisSubRound.LeaderContent}
                    />
                }

                {this.state.ApplicationState.CurrentUser.IsLeader && thisSubRound != null && thisSubRound.Questions &&
                    <Form
                        style={{ width: '100%' }}
                    >
                        {thisSubRound.Questions.map((q, i) => {
                            q = Object.assign(new QuestionModel(), q);
                            return <Row
                                key={"question-" + i.toString()}
                            >
                                <EditableQuestionBlock
                                    Question={q}
                                    idx={i}
                                    key={i}
                                    SubRoundId={thisSubRound._id}
                                    onChangeHander={r => {
                                        this.controller.updateResponse(q, r)
                                    }}
                                    IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                                />
                                <Button
                                    content='Save'
                                    icon='checkmark'
                                    labelPosition='right'
                                    color='blue'
                                    loading={q.Response ? q.Response.IsSaving : false}
                                    onClick={e => {
                                        this.controller.Save1BResponse(q.Response, q, thisSubRound)
                                    }}
                                />
                            </Row>
                        }
                        )}
                    </Form>

                }
            </>;
        } else {
            return <Dimmer active>
                <Loader>Loading</Loader>
            </Dimmer>
        }
    }

}

export default withRouter(Hiring);