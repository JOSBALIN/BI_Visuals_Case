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
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
import { VisualSettings } from "./settings";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewCategoricalColumn = powerbi.DataViewCategoricalColumn;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;

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

export class Visual implements IVisual {
  private host: IVisualHost;
  private svgRoot: Selection<SVGElement>;
  private container: Selection<SVGElement>;
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
    this.textValue = this.container.append("text").classed("textValue", true);
    this.textLabel = this.container.append("text").classed("textLabel", true);
  }

  public update(options: VisualUpdateOptions) {
    let dataView: DataView = options.dataViews[0];
    let width: number = options.viewport.width;
    let height: number = options.viewport.height;
    this.visualSettings =
      this.formattingSettingsService.populateFormattingSettingsModel(
        VisualSettings,
        options.dataViews
      );
    let visualFill: string = this.visualSettings.circle.fillColor.value.value;
    let toggleLegend: boolean = this.visualSettings.circle.toggleLegend.value;
    let toggleLog: boolean = this.visualSettings.circle.toggleLog.value;
    console.log(this.visualSettings.circle.fillColor.value.value);

    // Remove all existing circles to avoid infinite renders
    // Perhaps not ideal?
    d3.selectAll(".circle").remove();
    d3.selectAll(".legend-text").remove();
    d3.selectAll(".legend-rect").remove();

    var viewModel: CircleViewModel = this.createViewModel(options.dataViews[0]);

    this.svgRoot.attr("width", width).attr("height", height);

    function labelHover(event: Event, outputString: string) {
      let position = d3.pointer(event);

      hoverLabel
        .text(outputString)
        .attr("x", position[0])
        .attr("y", position[1])
        .attr("dy", 60)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .style("font-size", 20 + "px")
        .style("display", "")
        .attr("height", 50);

      let labelNode = hoverLabel.node().getBBox();

      hoverLabelFill
        .attr("x", labelNode.x - 8)
        .attr("y", labelNode.y - 8)
        .attr("width", labelNode.width + 16)
        .attr("height", labelNode.height + 16)
        .attr("fill", "rgba(0, 0, 0, 0.6)")
        .style("border", "1px solid black")
        .style("display", "")
        .attr("stroke", "black")
        .attr("stroke-width", "1px");
    }

    let responsiveRadius: number = Math.min(width, height) / 2.2;
    let fontSizeValue: number = width / 40;
    let logScale = d3
      .scaleLog()
      .domain([
        viewModel.dataPoints[0].value,
        viewModel.dataPoints[viewModel.dataPoints.length - 1].value,
      ])
      .range([10, 100])
      .base(10);

    for (var i = 0; i < viewModel.dataPoints.length; i++) {
      let dataPointValue: number = viewModel.dataPoints[i].value;
      let dataPointCat: string = viewModel.dataPoints[i].category;
      let defaultFilter: string = `brightness(${(i + 1) * 20}%)`;
      let hoverFilter: string = `brightness(${(i + 1) * 30}%)`;
      let visualCircle = this.container
        .append("circle")
        .classed("circle", true);
      let legendRect = this.container
        .append("rect")
        .classed("legend-rect", true);
      let legendText = this.container
        .append("text")
        .classed("legend-text", true);
      let radius = 1;
      if (i > 0) radius = dataPointValue / viewModel.dataPoints[0].value;

      if (toggleLog) radius = (110 - logScale(dataPointValue)) / 100;

      console.log(
        `I:${i}, DATA: ${
          dataPointValue / viewModel.dataPoints[0].value
        }, LOG: ${110 - logScale(dataPointValue)}`
      );

      visualCircle
        .style("fill", visualFill)
        .style("filter", defaultFilter)
        .style("stroke", "black")
        .style("stroke-width", 2)
        .attr("r", responsiveRadius * radius)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .on("mousemove", function (event) {
          dataPointHover(
            visualCircle,
            legendRect,
            hoverFilter,
            defaultFilter,
            event
          );
          labelHover(event, `${dataPointCat}, ${dataPointValue}`);
          // console.log(viewModel.dataPoints[i].value)
        })
        .on("mouseout", function (event) {
          dataPointHover(
            visualCircle,
            legendRect,
            hoverFilter,
            defaultFilter,
            event
          );
          hoverLabel.style("display", "none");
          hoverLabelFill.style("display", "none");
        });

      if (toggleLegend) {
        legendText
          .text(dataPointCat)
          .attr("x", "58px")
          .attr("y", (i + 1) * 40 + 24 + height / 10 + "px")
          .attr("fill", "black")
          .style("font-size", fontSizeValue + "px")
          .style("display", "")
          .attr("height", 50);

        legendRect
          .style("width", "30px")
          .style("stroke-width", "1px")
          .style("stroke", "black")
          .style("height", "30px")
          .style("x", "20px")
          .style("y", (i + 1) * 40 + height / 10 + "px")
          .style("fill", visualFill)
          .style("filter", `brightness(${(i + 1) * 20}%)`)
          .on("mousemove", function (event) {
            dataPointHover(
              visualCircle,
              legendRect,
              hoverFilter,
              defaultFilter,
              event
            );
          })
          .on("mouseout", function (event) {
            dataPointHover(
              visualCircle,
              legendRect,
              hoverFilter,
              defaultFilter,
              event
            );
          })
          .on("mousedown", function () {
            toggleCircleVis(visualCircle, legendRect, visualFill, hoverFilter);
          });
      }
    }

    // Shoddy workaround - refactor.
    let hoverLabelFill = this.container.append("rect");
    let hoverLabel = this.container.append("text").classed("hover-label", true);

    function toggleCircleVis(circle, legendRect, originalColor, hoverFilter) {
      if (circle.style("display") === "none") {
        circle.style("display", "");
        legendRect.style("fill", originalColor);
        legendRect.style("filter", hoverFilter);
      } else {
        circle.style("display", "none");
        legendRect.style("fill", "black");
        legendRect.style("filter", "brightness(100%)");
      }
    }

    function dataPointHover(
      circle,
      legendRect,
      hoverFilter,
      defaultFilter,
      event
    ) {
      if (event.type === "mousemove") {
        legendRect.style("filter", hoverFilter);
        circle.style("filter", hoverFilter);
      } else {
        legendRect.style("filter", defaultFilter);
        circle.style("filter", defaultFilter);
      }
    }
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(
      this.visualSettings
    );
  }

  public createViewModel(dataView: DataView): CircleViewModel {
    let categoricalDataView: DataViewCategorical = dataView.categorical;

    var categoryValues: PrimitiveValue[] = categoricalDataView.values[0].values;
    var categoryColumn: DataViewCategoricalColumn =
      categoricalDataView.categories[0];
    var categoryNames: PrimitiveValue[] =
      categoricalDataView.categories[0].values;

    var circleDataPoints: CircleDataPoint[] = [];

    // Iterate over values and categories
    for (var i = 0; i < categoryValues.length; i++) {
      // get category name and category value
      var category: string = <string>categoryNames[i];
      var categoryValue: number = <number>categoryValues[i];
      // add new data point to barchartDataPoints collection
      // console.log(`${category}: ${categoryValue}`);
      circleDataPoints.push({
        category: category,
        value: categoryValue,
      });
    }

    circleDataPoints.sort((x, y) => {
      return y.value - x.value;
    });

    return {
      dataPoints: circleDataPoints,
      circleName: "CircleName",
      measureName: "MeasureName",
    };
  }
}
