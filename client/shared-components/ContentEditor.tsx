import * as React from "react";
export default class ContentEditor extends React.Component<{Content: string;}>
{
    
    render() {
        return  <>
            <div contentEditable={true}>{this.props.Content}</div>
        </>;
    }

}