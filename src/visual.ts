/*
 *  Power BI Visual CLI
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

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
import { VisualSettings } from "./settings";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { interpolateRgb, Numeric } from "d3";

export interface CircleDataPoint {
  value: number;
}

export class Visual implements IVisual {
  private host: IVisualHost;
  private svgRoot: Selection<SVGElement>;
  private container: Selection<SVGElement>;
  private circle: Selection<SVGElement>;
  private textValue: Selection<SVGElement>;
  private textLabel: Selection<SVGElement>;

  private visualSettings: VisualSettings;
  private formattingSettingsService: FormattingSettingsService;

  constructor(options: VisualConstructorOptions) {
    this.formattingSettingsService = new FormattingSettingsService();
    this.svgRoot = d3
      .select(options.element)
      .append("svg")
      .classed("circleCard", true);
    this.container = this.svgRoot.append("g").classed("container", true);
    this.circle = this.container.append("circle").classed("circle", true);
    this.textValue = this.container.append("text").classed("textValue", true);
    this.textLabel = this.container.append("text").classed("textLabel", true);
  }
  
  public update(options: VisualUpdateOptions) {
    let dataView: DataView = options.dataViews[0];
    let width: number = options.viewport.width;
    let height: number = options.viewport.height;
    console.log(options)

    

        function open(){
          console.log("ayy")
          window.open(
            'http://en.wikipedia.org',
            '_blank' // <- This is what makes it open in a new window.
          );
        }
    
    this.svgRoot
    .attr("width", width)
    .attr("height", height)
    .on('click', function() {
      open()
    });
    let radius: number = Math.min(width, height) / 2.2;

    this.visualSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualSettings, options.dataViews);
    this.visualSettings.circle.circleThickness.value = Math.max(0, this.visualSettings.circle.circleThickness.value);
    this.visualSettings.circle.circleThickness.value = Math.min(10, this.visualSettings.circle.circleThickness.value);


  
    
    // TOTAL
    // GOAL
    // Min (to reach one color)
    // Max (to reach another color)
    // Coloring is based on total's proximity to goal
    // Color is dependant on min and max.
    // The closer (total / goal) * 100 is to the percent of max, the closer it moves towards color max threshold
    // The closer (total / goal) * 100 is to the percent of min, the closer it moves towards the color min threshold

    // this.visualSettings.circle.circleThresholdMax.value = parseInt(String(dataView.single.value)); // casting to string before parseInt. Refactor in future.

    // (parseInt(String(dataView.single.value)) / this.visualSettings.circle.circleThresholdGoal.value)

    let interpolatedPercent: number = 0.5

    let interpolatedColor = interpolateRgb(this.visualSettings.circle.circleColor.value.value, "blue")(interpolatedPercent);

    this.circle
    .style("fill", this.visualSettings.circle.circleColor.value.value)
      .style("stroke", "black")
      .style("stroke-width", this.visualSettings.circle.circleThickness.value)
      .attr("r", radius)
      .attr("cx", width / 2)
      .attr("cy", height / 2);
    let fontSizeValue: number = Math.min(width, height) / 5;
    this.textValue
      .text(<string>dataView.single.value)
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font-size", fontSizeValue + "px");
    let fontSizeLabel: number = fontSizeValue / 4;
    this.textLabel
      .text(dataView.metadata.columns[0].displayName)
      .attr("x", "50%")
      .attr("y", height / 2)
      .attr("dy", fontSizeValue / 1.2)
      .attr("text-anchor", "middle")
      .style("font-size", fontSizeLabel + "px");
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.visualSettings
    );
  }
}
