import * as React from "react";
import { Grid, Button, TextArea, Input, Form} from 'semantic-ui-react'
const { Column, Row } = Grid;
//import 'semantic-ui-css/semantic.min.css';
import SubRoundModel from "../../shared/models/SubRoundModel";
import UserModel, { RoleName } from "../../shared/models/UserModel";

interface RoundContentProps {
    CurrentUser: UserModel,
    SubRound: SubRoundModel,
    onSaveHandler(content: any, subroundId: string, i: number): void;
}

export default class RoundContent extends React.Component<RoundContentProps, {}>
{
  
    render() {
        return <>
hey
        </>
    }

}

/**
 * 
            <pre>{JSON.stringify(this.state.Content, null, 2)}</pre>
            <pre>{JSON.stringify(this.props.Content, null, 2)}</pre>
 */