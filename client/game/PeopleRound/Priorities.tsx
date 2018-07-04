import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { RoleName } from "../../../shared/models/UserModel";
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import EditableContentBlock from '../../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import * as Semantic from 'semantic-ui-react';
const { Button, Grid, Menu, Segment, Form } = Semantic;
const { Row, Column } = Grid;


class Priorities extends React.Component<RouteComponentProps<any>, RoundModel>
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    controller: PeopleRoundCtrl = PeopleRoundCtrl.GetInstance();

    public static CLASS_NAME = "Priorities";

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
        const thisSubRound = this.state.SubRounds.filter(s => s.Name.toUpperCase() == Priorities.CLASS_NAME.toUpperCase())[0]
        console.log("SUBROUND>>>>>>>>>>>>>>>>>>>>>", thisSubRound)
        if (this.state) {
            return <>
                {!this.state.CurrentUser.IsLeader && thisSubRound &&

                    <EditableContentBlock
                        IsEditable={this.state.CurrentUser.Role == RoleName.ADMIN}
                        IsLeader={this.state.CurrentUser.IsLeader}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Content={thisSubRound.IndividualContributorContent}
                    />
                }

                {this.state.CurrentUser.IsLeader && thisSubRound &&

                    <EditableContentBlock
                        IsEditable={this.state.CurrentUser.Role == RoleName.ADMIN}
                        IsLeader={this.state.CurrentUser.IsLeader}
                        SubRoundId={thisSubRound._id}
                        onSaveHandler={this.controller.updateContent.bind(this.controller)}
                        Content={thisSubRound.LeaderContent}
                    />
                }

                {this.state.CurrentUser.IsLeader && thisSubRound != null && thisSubRound.Questions &&
                    <Form
                        style={{ width: '100%' }}
                    >
                        {thisSubRound.Questions.map((q, i) => {
                            return <Row
                                    key={"question-" + i.toString()}
                                >
                                <EditableQuestionBlock
                                    Question={q}
                                    idx={i}
                                    key={i}
                                    SubRoundId={thisSubRound._id}
                                    onSaveHandler={this.controller.updateContent.bind(this.controller)}
                                    onRemoveHandler={this.controller.removeRoundContent.bind(this.controller)}
                                    IsEditable={this.state.CurrentUser.Role == RoleName.ADMIN}
                                />
                                <Button
                                    content='Save'
                                    icon='checkmark'
                                    labelPosition='right'
                                    onClick={e => {
                                        this.controller.Save1AResponse(q.PossibleAnswers, q, thisSubRound)
                                    }}
                                />
                            </Row>
                        }
                        )}
                    </Form>

                }
            </>;
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Priorities);
