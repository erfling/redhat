import * as React from "react";
import { RoleName, JobName } from "../../../shared/models/UserModel";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
import QuestionModel from "../../../shared/models/QuestionModel";
import { IRoundDataStore } from '../../../shared/base-sapien/client/BaseRoundCtrl';
import EngineeringRoundCtrl from "./EngineeringRoundCtrl";
import BaseComponent from "../../../shared/base-sapien/client/shared-components/BaseComponent";


const { Button, Grid, Form, Dimmer, Loader } = Semantic;
const { Row, Column } = Grid;

class EngineeringSub extends BaseComponent<RouteComponentProps<any>, IRoundDataStore>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public static CLASS_NAME = "EngineeringSub";

    public static CONTROLLER = EngineeringRoundCtrl;
    
    controller: EngineeringRoundCtrl = EngineeringRoundCtrl.GetInstance();

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
        const thisSubRound = this.state.Round.SubRounds.filter(s => s.Name.toUpperCase() == EngineeringSub.CLASS_NAME.toUpperCase())[0]

        if (this.state) {
            return <>
                <h1>{this.state.ApplicationState.CurrentUser.Job}</h1>
               {thisSubRound && this.controller.getMessagesByJob(this.state.ApplicationState.CurrentUser.Job, thisSubRound._id).map(m => 
                    
                    <EditableContentBlock
                        IsEditable={this.state.ApplicationState.CurrentUser.Role == RoleName.ADMIN}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Message={m}
                    />

                )}


                {this.state.ApplicationState.CurrentUser.Job == JobName.MANAGER && thisSubRound != null && thisSubRound.Questions &&
                    <Form
                        style={{ width: '100%' }}
                    >
                        {thisSubRound.Questions.map((q, i) => {
                            q = Object.assign(new QuestionModel, q);
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
                                    loading={this.state.ApplicationState.FormIsSubmitting }
                                    onClick={e => {
                                        this.controller.SaveResponse(q.Response, q, thisSubRound)
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

export default withRouter(EngineeringSub);