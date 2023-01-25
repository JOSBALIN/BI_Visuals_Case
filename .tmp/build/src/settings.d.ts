import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
export declare class CircleSettings extends FormattingSettingsCard {
    fillColor: formattingSettings.ColorPicker;
    toggleLegend: formattingSettings.ToggleSwitch;
    toggleLog: formattingSettings.ToggleSwitch;
    circleThickness: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
export declare class VisualSettings extends FormattingSettingsModel {
    static parse(dataView: powerbi.DataView): VisualSettings;
    circle: CircleSettings;
    cards: FormattingSettingsCard[];
}
