import * as React from "react";
import { Grid, Button, TextArea, Input, Label, Form, Header, Icon, Radio, Checkbox, List } from 'semantic-ui-react'
const { Column, Row } = Grid;
import MessageModel from '../../shared/models/MessageModel';

interface QuestionBlockProps {
    Messages: MessageModel[],
    SelectFunc: (message: MessageModel) => void
}

export default class EditableQuestionBlock extends React.Component<QuestionBlockProps, { Messages: MessageModel }>
{
    constructor(props: QuestionBlockProps) {
        props = props || {
            Messages: null,
            SelectFunc: null
        }
        super(props);

    }

    private _stripHtml(htmlString){
        var tmp = document.createElement("DIV");
        tmp.innerHTML = htmlString;
        return tmp.textContent || tmp.innerText || "";
    }

    render() {
        return <>
            <List divided verticalAlign='middle'>
                {this.props.Messages && this.props.Messages.map(m => <List.Item>
                    <List.Content
                        onClick={e => this.props.SelectFunc(m)}
                    >
                        <List.Header>{m.Title || this._stripHtml(m.Content).slice(0, 40) + "..."}</List.Header>
                    </List.Content>
                </List.Item>)}
            </List>
        </>


    }

}