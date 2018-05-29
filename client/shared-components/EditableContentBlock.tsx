import * as React from "react";
import ContentEditor from './ContentEditor';
import ContentBlock from '../../shared/models/ContentBlock';
import { Grid, Button, Icon } from 'semantic-ui-react'
const { Column, Row } = Grid;
import 'semantic-ui-css/semantic.min.css';
import RoundModel from "../../shared/models/RoundModel";
import { plainToClass } from 'class-transformer';
import ContentBlockModel from "../../shared/models/ContentBlock";

interface ContentBlockProps{ 
    Content: ContentBlock, 
    idx: number;
    onSaveHandler(content: ContentBlock, i: number):void;
    key: number; 
}

export default class EditableContentBlock extends React.Component<ContentBlockProps, { EditMode: boolean, CanEdit: boolean, Content: ContentBlock }>
{
    constructor() {
        super(
            { 
                Content: {
                    EditMode: false,
                    Header: null,
                    Body: null
                }, 
                idx: null,
                key: null,
                onSaveHandler: null
            }
        );

        this.state = { EditMode: false, CanEdit: true, Content: plainToClass(ContentBlock, this.props.Content) };
    }

    render() {
        return <>
                <Column
                    width={16}
                    onClick={() => this.setState(Object.assign({}, { EditMode: true }))}
                >
                    <h2
                        suppressContentEditableWarning={true}
                        className={this.state.EditMode ? "editable" : ""}
                        contentEditable={this.state.EditMode}
                        onInput={(e) => {
                            this.setState(Object.assign({}, this.state, {
                                
                                Content: {
                                    EditMode: this.props.Content.EditMode,
                                    Header: (e.target as HTMLElement).innerText,
                                    Body: this.state.Content.Body || this.props.Content.Body
                                }                            
                        }))}}
                    >{this.props.Content.Header} | {this.props.idx}</h2>
                    <p
                        suppressContentEditableWarning={true}
                        className={this.state.EditMode ? "editable" : ""}
                        contentEditable={this.state.EditMode}
                        onInput={(e) => {
                            this.setState(Object.assign({}, this.state, {
                                
                                Content: {
                                    EditMode: this.props.Content.EditMode,
                                    Header: this.state.Content.Header || this.props.Content.Header,
                                    Body: (e.target as HTMLElement).innerText
                                }                            
                        }))}}
                    >{this.props.Content.Body}</p>
                    
                </Column>

                {this.state.EditMode &&
                    <Column width={16}>
                        <Button
                            onClick={() => {
                                this.setState(Object.assign(this.state, { EditMode: false }))
                                this.props.onSaveHandler(this.state.Content, this.props.idx);
                            }}
                            color="green">
                            Save
                        </Button>
                        <Button
                            onClick={() => {
                                this.setState(Object.assign(this.state, { EditMode: false }))
                            }}
                            color="red">
                            Cancel
                        </Button>
                        <pre>{JSON.stringify(this.state.Content, null, 2)}</pre>
                        <pre>{JSON.stringify(this.props.Content, null, 2)}</pre>
                    </Column>

                }
        </>;
    }

}