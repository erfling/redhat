import * as React from "react";
import EditableContentBlock from '../../shared/base-sapien/client/shared-components/EditableContentBlock';
import EditableQuestionBlock from '../../shared/base-sapien/client/shared-components/EditableQuestionBlock';
import { Grid, Button, TextArea, Input, Form} from 'semantic-ui-react'
const { Column, Row } = Grid;
//import 'semantic-ui-css/semantic.min.css';
import SubRoundModel from "../../shared/models/SubRoundModel";
import ResponseModel from "../../shared/models/ResponseModel";
import ContentBlock from "../../shared/models/ContentBlock";
import { plainToClass } from 'class-transformer';
import UserModel, { RoleName } from "../../shared/models/UserModel";
import ValueObj from "../../shared/entity-of-the-state/ValueObj";

interface RoundContentProps {
    CurrentUser: UserModel,
    SubRound: SubRoundModel,
    onSaveHandler(content: ContentBlock, subroundId: string, i: number): void;
    onRemoveHandler(isLeader: boolean, i: number): void;
    onAddContent(thisSubRound: SubRoundModel, RoundId: string, IsLeader:boolean): void;
}

export default class RoundContent extends React.Component<RoundContentProps, {}>
{
  
    render() {
        return <>

                {!this.props.CurrentUser.IsLeader && this.props.SubRound != null && this.props.SubRound.IndividualContributorContent && this.props.SubRound.IndividualContributorContent.map((c, i) => {
                        return <EditableContentBlock
                            IsEditable={this.props.CurrentUser.Role == RoleName.ADMIN}
                            IsLeader={this.props.CurrentUser.IsLeader}
                            SubRoundId={this.props.SubRound._id}
                            onSaveHandler={this.props.onSaveHandler}
                            onRemoveHandler={this.props.onRemoveHandler}
                            Content={c}
                            key={i}
                            idx={i}
                        />
                    }
                )}

                {this.props.CurrentUser.IsLeader && this.props.SubRound != null && this.props.SubRound.LeaderContent && this.props.SubRound.LeaderContent.map((c, i) => {
                        return <EditableContentBlock
                            IsEditable={this.props.CurrentUser.Role == RoleName.ADMIN}
                            IsLeader={this.props.CurrentUser.IsLeader}
                            SubRoundId={this.props.SubRound._id}
                            onSaveHandler={this.props.onSaveHandler}
                            onRemoveHandler={this.props.onRemoveHandler}
                            Content={c}
                            key={i}
                            idx={i}
                        />
                    }
                )}
                

                <Row>
                    <Button
                        color="blue"
                        onClick={() => this.props.onAddContent(this.props.SubRound, this.props.SubRound._id, this.props.CurrentUser.IsLeader)}
                    >Add Content</Button>
                </Row>
               
        </>
    }

}

/**
 * 
            <pre>{JSON.stringify(this.state.Content, null, 2)}</pre>
            <pre>{JSON.stringify(this.props.Content, null, 2)}</pre>
 */