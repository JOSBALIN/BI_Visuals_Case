import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
export interface CircleDataPoint {
    category: string;
    value: number;
}
export interface CircleViewModel {
    dataPoints?: CircleDataPoint[];
    circleColor?: string;
    circleName?: string;
    measureName?: string;
}
export declare class Visual implements IVisual {
    private host;
    private svgRoot;
    private container;
    private textValue;
    private textLabel;
    private visualSettings;
    private formattingSettingsService;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    getFormattingModel(): powerbi.visuals.FormattingModel;
    createViewModel(dataView: DataView): CircleViewModel;
}
