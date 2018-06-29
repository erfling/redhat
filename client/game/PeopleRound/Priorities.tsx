import * as React from "react";
import PeopleRoundCtrl from "./PeopleRoundCtrl";
import RoundModel from "../../../shared/models/RoundModel";
import { RoleName } from "../../../shared/models/UserModel";
import EditableQuestionBlock from '../../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import RoundContent from "../RoundContent";
import ValueObj from '../../../shared/entity-of-the-state/ValueObj';
import { withRouter, RouteComponentProps } from 'react-router-dom';
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
                <RoundContent
                    CurrentUser={this.state.CurrentUser}
                    SubRound={thisSubRound}
                    onSaveHandler={this.controller.updateContent.bind(this.controller)}
                    onRemoveHandler={this.controller.removeRoundContent.bind(this.controller)}
                    onAddContent={this.controller.addRoundContent.bind(this.controller)}
                />

                {this.state.CurrentUser.IsLeader && thisSubRound != null && thisSubRound.Questions && 
                    <Form
                        style={{width:'100%'}}
                    >                
                        {thisSubRound.Questions.map((q, i) => {
                            return <>
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
                                    </>
                            }
                        )}
                        <pre>{thisSubRound.Responses && JSON.stringify(thisSubRound, null, 2)}</pre>
                    </Form>
                    
                }
            </>;
        } else {
            return <Segment loading></Segment>
        }
    }

}

export default withRouter(Priorities);
