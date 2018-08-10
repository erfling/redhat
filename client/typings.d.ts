declare module "*.svg" {
    const content: any;
    export default content;
}

declare module "semantic-ui-calendar-react" {
    export const DateInput: any;
}

declare module "react-vis"{
    const reactVis:any;
    interface ISunburst{
        animation: any;//={{damping: 20, stiffness: 300}}
        data: any;//={ mapDataForSunburst(data) }
        colorType: string;
        colorRange: string[]
        style: any;                                            
        height: number;
        width: number;
        hideRootNode: boolean;
        title: string;
        getLabel: (label:any) => {};
        onValueMouseOver: (v:{x: number, y: number}) => {};
        onValueMouseOut: (v:{x: number, y: number}) => {};
    }
    export const Sunburst:any;
    export const XYPlot:any;
    export const XAxis:any;
    export const YAxis:any;
    export const HorizontalGridLines:any;
    export const VerticalGridLines:any;
    export const LineSeries:any;
    export const RadialChart: any;
    export const VerticalBarSeries: any;
    export const MarkSeries: any;
    export const LabelSeries: any;

    interface IDiscreteColorLegend{
        color?: string;
        disabled?: boolean;
        title?: boolean;
        onClick?: (e:any) => {};
        onMouseEnter?: (e:any) => {};
        onMouseLeave?: (e:any) => {};
        orientation?: (e:any) => {};
    }
    export const DiscreteColorLegend: any;
    export const Hint:any;
    export const DiscreteColorLegendItem: any;
    export default reactVis;
}