/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;


export class CircleSettings extends FormattingSettingsCard {
  public fillColor = new formattingSettings.ColorPicker({
    name: "fillColor",
    displayName: "Fill",
    value: { value: "#01b8aa" },
  });

  public toggleLegend = new formattingSettings.ToggleSwitch({
    name: "toggleLegend",
    displayName: "Legend",
    value:true
  })

  public toggleLog = new formattingSettings.ToggleSwitch({
    name: "toggleLog",
    displayName: "Logarithm (base 10)",
    value:false
  })





  public circleThickness = new formattingSettings.NumUpDown({
    name: "circleThickness",
    displayName: "Thickness",
    value: 2,
  });

  public name: string = "circle";
  public displayName: string = "Graph options";
  public slices: FormattingSettingsSlice[] = [
    this.toggleLegend,
    this.toggleLog,
    this.fillColor,
  ];
}

export class VisualSettings extends FormattingSettingsModel {
  static parse(dataView: powerbi.DataView): VisualSettings {
    throw new Error("Method not implemented.");
  }
  public circle: CircleSettings = new CircleSettings();
  public cards: FormattingSettingsCard[] = [this.circle];
}
