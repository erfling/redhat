/// ./node_modules/jodit-react/build/jodit-react
declare module "jodit-react"{
    import * as React from "react"
    import * as joditReact from 'jodit-react'

    export interface JoditProps {
        content: string;
        onChange(value: string): void;
        config: any;
    }
    
    export default class JoditEditor extends React.Component<JoditProps, any> {
        constructor(props: JoditProps, context: any);
        render(): JSX.Element;
    }

}
