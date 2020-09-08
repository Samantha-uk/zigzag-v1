// Note: This uses the latest release of D3 v5.
// At the time the typescript definitions for D3 v6 were not available.
import type { Grapher, GrapherLayout } from "../grapher";
import * as d3 from "d3";

import { Zig, ZigRole } from "../../model/Zig";
import { ZagDisplayConfig } from "../ZagDisplayConfig";
import { ZigDisplayConfig } from "../ZigDisplayConfig";

import type { Zag } from "../../model/Zag";

interface ZigDatum extends d3.SimulationNodeDatum, Zig {}
interface ZagDatum extends d3.SimulationLinkDatum<ZigDatum> {
  zags: Array<Zag>;
}

type ZigSelection = d3.Selection<SVGSVGElement, ZigDatum, d3.BaseType, null>;
type ZagSelection = d3.Selection<SVGSVGElement, ZagDatum, d3.BaseType, null>;

// Hold per instance info that can be passed into callbacks and static methods.
interface D3SVG {
  // Width of the container.
  _width: number;
  // Height of the container.
  _height: number;
  // Handle to the SVG element holding the graph.
  _SVGContainer: SVGSVGElement;
  // D3 selection of the contents of the outer SVG.
  _outerSVGSelection: d3.Selection<d3.BaseType, null, null, undefined>;
  // Handle to the <g> of class zigs.
  _zigG: d3.Selection<d3.BaseType, null, null, undefined>;
  // Handle to the <g> of class zags.
  _zagG: d3.Selection<d3.BaseType, null, null, undefined>;
  // The D3 datum array of zigs.
  _d3ZigDatums: Array<ZigDatum>;
  // The D3 datum array of zags.
  _d3ZagDatums: Array<ZagDatum>;
  // The D3 force simulation.
  _simulation: d3.Simulation<ZigDatum, ZagDatum>;
}

// Various constants used to configure the D3 simulation
const _d3AlphaRestartValue = 0.3;
const _d3AlphaMin = 0.01;
const _d3AlphaDecay = 0.04;
const _d3RepelRadius = 2;

export class D3Grapher implements Grapher {
  private _d3svg = <D3SVG>{};

  private static _iconSize = 48;

  private static _zagDisplayConfig: ZagDisplayConfig;

  private static _zigDisplayConfig: ZigDisplayConfig;

  constructor() {
    this._d3svg._d3ZigDatums = [];
    this._d3svg._d3ZagDatums = [];
  }

  // Return a color for the zag based on the LQI of the target zig.
  private static _calcZagColor(lqi: number): string {
    const thresholdScale = d3
      .scaleThreshold<number, string>()
      .domain([
        this._zagDisplayConfig.thresholdLowerLQI,
        this._zagDisplayConfig.thresholdMiddleLQI,
        this._zagDisplayConfig.thresholdUpperLQI,
      ])
      .range([
        this._zagDisplayConfig.colorLQIPoor,
        this._zagDisplayConfig.colorLQIModerate,
        this._zagDisplayConfig.colorLQIGood,
        this._zagDisplayConfig.colorLQIExcellent,
      ]);
    // Ensure the color is of an acceptable format
    return d3.color(thresholdScale(lqi))?.toString() as string;
  }

  // Return a color for the zig based on its device type.
  private static _calcZigColor(deviceType: string): string {
    switch (deviceType) {
      case ZigRole.Coordinator:
        return this._zigDisplayConfig.iconColorCoordinator;

      case ZigRole.Router:
        return this._zigDisplayConfig.iconColorRouter;

      case ZigRole.EndDevice:
        return this._zigDisplayConfig.iconColorEndDevice;
    }

    return this._zigDisplayConfig.iconColorUnknown;
  }

  // Return the icon name for the zig based on its device_type.
  private static _calcZigIcon(deviceType: string): string {
    switch (deviceType) {
      case ZigRole.Coordinator:
        return D3Grapher._zigDisplayConfig.iconNameCoordinator;

      case ZigRole.Router:
        return D3Grapher._zigDisplayConfig.iconNameRouter;

      case ZigRole.EndDevice:
        return D3Grapher._zigDisplayConfig.iconNameEndDevice;
    }

    return D3Grapher._zigDisplayConfig.iconNameUnknown;
  }

  // Ensure a co-ordinate falls within a min & max
  private static _constrainWithinBoundary(
    coordinate: number,
    low: number,
    high: number
  ): number {
    return Math.max(low, Math.min(high - low, coordinate));
  }

  private static _createZagLabels(zagSelection: ZagSelection) {
    // Labels for uni zigs.
    // TODO - ensure the label orientation is correct.
    zagSelection
      .filter((_zagD: ZagDatum) => _zagD.zags.length === 1)
      .append("text")
      .classed("zag-label", true)
      .append("textPath")
      .attr("href", (_zagD: ZagDatum) => `#zagPath-${_zagD.index}-uni`)
      .style("text-anchor", "end")
      .attr("startOffset", "80%")
      .text((_zagD: ZagDatum) => _zagD.zags[0].relation);

    // The first label for a bi zag.
    zagSelection
      .filter((_zagD: ZagDatum) => _zagD.zags.length === 2)
      .append("text")
      .classed("zag-label", true)
      .append("textPath")
      .attr("href", (_zagD: ZagDatum) => `#zagPath-${_zagD.index}-bi`)
      .style("text-anchor", "end")
      .attr("startOffset", "40%")
      .text((_zagD: ZagDatum) => _zagD.zags[0].relation);

    // The second label for a bi zag.
    zagSelection
      .filter((_zagD: ZagDatum) => _zagD.zags.length === 2)
      .append("text")
      .classed("zag-label", true)
      .append("textPath")
      .attr("href", (_zagD: ZagDatum) => `#zagPath-${_zagD.index}-bi`)
      .style("text-anchor", "end")
      .attr("startOffset", "90%")
      .text((_zagD: ZagDatum) => _zagD.zags[1].relation);
  }

  // Create single or double lines for zags.
  private static _createZagLines(zagSelection: ZagSelection) {
    // For all the zags with unidirectional links - uni-zags.
    zagSelection
      .filter((_zagD: ZagDatum) => _zagD.zags.length === 1)
      .append<SVGPathElement>("path")
      .classed("zag", true)
      .attr("id", (_zagD: ZagDatum) => `zagPath-${_zagD.index}-uni`)
      .style("stroke", (_zagD: ZagDatum) =>
        D3Grapher._calcZagColor(_zagD.zags[0].lqi_to)
      )
      .style("fill", "none");

    // For zags with bidirectional links - bi-zags.
    zagSelection
      .filter((_zagD: ZagDatum) => _zagD.zags.length === 2)
      .append<SVGPathElement>("path")
      .classed("zag", true)
      .attr("id", (_zagD: ZagDatum) => `zagPath-${_zagD.index}-bi`)
      .style("stroke", (_zagD: ZagDatum) =>
        D3Grapher._calcZagColor(_zagD.zags[0].lqi_to)
      )
      .style("fill", "none");
  }

  private static _createZigContents(zigSelection: ZigSelection) {
    // Create a circular background for the zig.
    // cx & cy are relative to the zig svg.
    zigSelection
      .append<SVGCircleElement>("circle")
      .classed("zig-background", true)
      .attr("r", D3Grapher._iconSize / 2 - 1)
      .attr("cx", D3Grapher._iconSize / 2)
      .attr("cy", D3Grapher._iconSize / 2);

    // Create the zig icon.
    zigSelection
      .append<SVGUseElement>("use")
      .classed("zig-icon", true)
      .attr(
        "href",
        (zig: d3.SimulationNodeDatum) =>
          "#icon-" + D3Grapher._calcZigIcon((zig as ZigDatum).device_type)
      )
      .style("fill", (zig: d3.SimulationNodeDatum) =>
        D3Grapher._calcZigColor((zig as ZigDatum).device_type)
      );

    // Create a hidden lock icon.
    zigSelection
      .append<SVGUseElement>("use")
      .classed("zig-lock", true)
      .attr("href", "#icon-mdi:lock")
      .attr("x", D3Grapher._iconSize / 2)
      .attr("y", D3Grapher._iconSize / 2)
      .attr("visibility", "hidden");

    // Create the zig label.
    zigSelection
      .append<SVGTextElement>("text")
      .classed("zig-label", true)
      .attr("dx", D3Grapher._iconSize / 2)
      .attr("dy", D3Grapher._iconSize + 10)
      .text((d: ZigDatum) => (d.user_given_name ? d.user_given_name : d.name))
      .style("text-anchor", "middle");
  }

  private static _importZigzags(
    zigs: Array<Zig>,
    zags: Array<Zag>,
    d3svg: D3SVG
  ) {
    // Create the zig & zag object structures d3 requires.
    zigs.forEach((_zig: Zig) => {
      // d3 requires a unique id for each ZigDatum so we will add it.
      d3svg._d3ZigDatums.push({ ..._zig, id: _zig.ieee });
    });

    zags.forEach((_zagToAdd: Zag) => {
      // Check to see if we already have a ZagDatum for the opposite direction
      let _existingZagD: ZagDatum | undefined = d3svg._d3ZagDatums.find(
        (_zagD: ZagDatum) =>
          _zagD.zags[0].from === _zagToAdd.to &&
          _zagD.zags[0].to === _zagToAdd.from
      );

      // If nothing found then create a new one and add it
      if (!_existingZagD) {
        _existingZagD = {
          source: _zagToAdd.from,
          target: _zagToAdd.to,
          zags: [],
        };
        d3svg._d3ZagDatums.push(_existingZagD);
      }

      // Add the zag to the ZagDatum
      _existingZagD.zags.push(_zagToAdd);
    });
  }

  private static _initaliseSimulation(d3svg: D3SVG) {
    // Create and configure the d3 simulation/force model.
    d3svg._simulation = d3
      .forceSimulation(d3svg._d3ZigDatums)
      .alphaMin(_d3AlphaMin)
      .alphaDecay(_d3AlphaDecay)
      .force(
        "link",
        d3.forceLink(d3svg._d3ZagDatums).id((zig) => (zig as ZigDatum).id)
      )
      .force("center", d3.forceCenter())
      .force("repel", d3.forceCollide());

    D3Grapher._updateForces(d3svg);
  }

  // Double clicking will unlock a zig.
  private static _setupUnlockZig(zigSelection: ZigSelection) {
    zigSelection.on("dblclick", (zigNode: ZigDatum) => {
      // Clearing fx & fy removes its fixed position.
      zigNode.fx = null;
      zigNode.fy = null;

      // Hide the lock icon.
      zigSelection
        .filter((zig) => zig === zigNode)
        .select(".zig-lock")
        .attr("visibility", "hidden");
    });
  }

  // Dragging a zig will modify the layout and also lock the zig into position.
  private static _setupZigDrag(zigSelection: ZigSelection, d3svg: D3SVG) {
    // Setup the drag event handlers for the zig.
    zigSelection.call(
      d3
        .drag<SVGSVGElement, ZigDatum>()
        .on("start", (_zigDtoDrag: ZigDatum) => {
          // We set the fx & fy to stop the simulation shifting the zig.
          _zigDtoDrag.fx = d3.event.x;
          _zigDtoDrag.fy = d3.event.y;

          // Unhide the lock icon.
          zigSelection
            .filter((_zigD: ZigDatum) => _zigD === _zigDtoDrag)
            .select(".zig-lock")
            .attr("visibility", "visible");
        })
        .on("drag", (_zigD: ZigDatum) => {
          // As we drag, we want to update the fixed coordinates of the zig.
          _zigD.fx = D3Grapher._constrainWithinBoundary(
            d3.event.x,
            D3Grapher._iconSize,
            d3svg._width
          );
          _zigD.fy = D3Grapher._constrainWithinBoundary(
            d3.event.y,
            D3Grapher._iconSize,
            d3svg._height
          );

          // We need to recalculate the layout by restarting the simulation.
          d3svg._simulation.restart();
        })
        .on("end", () => {
          d3svg._simulation.alpha(_d3AlphaRestartValue).restart();
        })
    );
  }

  // Mousing over a zig will highlight the zig and any connected zigs & zags.
  private static _setupZigMouseover(
    zigSelection: ZigSelection,
    zagSelection: ZagSelection,
    d3svg: D3SVG
  ) {
    // Setup mouse highlight behaviour for the zigs.
    zigSelection
      .on("mouseenter", (zigNode: ZigDatum) => {
        // Set highlight class on the zig
        d3.select<SVGSVGElement, ZigDatum>(d3.event.currentTarget).classed(
          "highlight",
          true
        );

        // Set highlight on any connected zags & the zig at the other end.
        zagSelection
          .filter((zagNode: ZagDatum) => {
            if (zagNode.source === zigNode) {
              zigSelection
                .filter((zig) => zig === zagNode.target)
                .classed("highlight", true);
              return true;
            }
            if (zagNode.target === zigNode) {
              zigSelection
                .filter((zig) => zig === zagNode.source)
                .classed("highlight", true);
              return true;
            }
            return false;
          })
          .classed("highlight", true);
        d3svg._zigG.classed("dim", true); //  Dim everything that is not highlight.
        d3svg._zagG.classed("dim", true); //  Dim everything that is not highlight.
      })

      .on("mouseleave", () => {
        // Clear highlight class on everything
        d3svg._outerSVGSelection
          .selectAll(".highlight")
          .classed("highlight", false);
        d3svg._zigG.classed("dim", false); //  Undim everything.
        d3svg._zagG.classed("dim", false); //  Undim everything.
      });
  }

  private static _updateForces(d3svg: D3SVG) {
    if (d3svg._simulation !== undefined) {
      d3svg._simulation
        .force<d3.ForceCenter<ZigDatum>>("center")
        ?.x(d3svg._width / 2)
        .y(d3svg._height / 2);

      d3svg._simulation
        .force<d3.ForceCollide<ZigDatum>>("repel")
        ?.radius(D3Grapher._iconSize * _d3RepelRadius);

      d3svg._simulation.alpha(_d3AlphaRestartValue).restart();
    }
  }

  // Update the positions of all the zags.
  private static _updatePositionOfZags(zagSelection: ZagSelection) {
    // distance of control point from mid-point of line:
    const _offsetCP = 50;

    zagSelection.select("path").attr("d", (_zagD: ZagDatum) => {
      // If we have two zags then it is a bi-zag so we draw two curves.
      if (_zagD.zags.length === 2) {
        // We need to calculate the position of the control point
        // adapted from https://stackoverflow.com/questions/49274176/how-to-create-a-curved-svg-path-between-two-points/49286885#49286885

        // mid-point of line
        const _mpx =
          (((_zagD.source as ZigDatum).x as number) +
            ((_zagD.target as ZigDatum).x as number)) *
          0.5;
        const _mpy =
          (((_zagD.source as ZigDatum).y as number) +
            ((_zagD.target as ZigDatum).y as number)) *
          0.5;

        // angle of perpendicular to line:
        const _theta =
          Math.atan2(
            ((_zagD.target as ZigDatum).y as number) -
              ((_zagD.source as ZigDatum).y as number),
            ((_zagD.target as ZigDatum).x as number) -
              ((_zagD.source as ZigDatum).x as number)
          ) -
          Math.PI / 2;

        // location of control point:
        const _cp1x = _mpx + _offsetCP * Math.cos(_theta);
        const _cp1y = _mpy + _offsetCP * Math.sin(_theta);
        const _cp2x = _mpx - _offsetCP * Math.cos(_theta);
        const _cp2y = _mpy - _offsetCP * Math.sin(_theta);

        return `M${(_zagD.source as ZigDatum).x as number},${
          (_zagD.source as ZigDatum).y as number
        } Q${_cp1x},${_cp1y} ${(_zagD.target as ZigDatum).x as number},${
          (_zagD.target as ZigDatum).y as number
        } Q${_cp2x},${_cp2y} ${(_zagD.source as ZigDatum).x as number},${
          (_zagD.source as ZigDatum).y as number
        }`;
      }

      // Otherwise it is a uni zag we draw a single straight line.
      return `M${(_zagD.source as ZigDatum).x as number},${
        (_zagD.source as ZigDatum).y as number
      } L${(_zagD.target as ZigDatum).x as number},${
        (_zagD.target as ZigDatum).y as number
      }`;
    });
  }

  // Update the positions of all the zigs.
  private static _updatePositionOfZigs(
    zigSelection: ZigSelection,
    d3svg: D3SVG
  ) {
    // x & y for the zig container (svg) are offset by half the icon size to allow
    // all the elements within the svg to be drawn using +ve coordinates.
    zigSelection
      .attr("x", (zigNode: ZigDatum) => {
        // Ensure d.x does not fall outside the boundary.
        zigNode.x = D3Grapher._constrainWithinBoundary(
          zigNode.x as number,
          D3Grapher._iconSize,
          d3svg._width
        );
        return zigNode.x - D3Grapher._iconSize / 2;
      })
      .attr("y", (zigNode: ZigDatum) => {
        // Ensure d.y does not fall outside the boundary.
        zigNode.y = D3Grapher._constrainWithinBoundary(
          zigNode.y as number,
          D3Grapher._iconSize,
          d3svg._height
        );
        return zigNode.y - D3Grapher._iconSize / 2;
      });
  }

  // Provide the layout data, intended to be used to persist the layout externally.
  public extractLayout(): Array<GrapherLayout> {
    // Return the coordinates of all locked zigs.
    const _zigLayout: Array<GrapherLayout> = [];
    this._d3svg._d3ZigDatums.forEach((_zigD: ZigDatum) => {
      // if fx & fy then the zig is locked and we will include it in the returned layout data.
      if (_zigD.fx && _zigD.fy) {
        _zigLayout.push({ id: _zigD.id, x: _zigD.fx, y: _zigD.fy });
      }
    });
    return _zigLayout;
  }

  // Inject the layout data and update zigs.
  public injectLayout(layout: Array<GrapherLayout>): void {
    try {
      for (const _zigPosition of layout) {
        const _zigToLock: ZigDatum | undefined = this._d3svg._d3ZigDatums!.find(
          (_zigD) => _zigD.id === _zigPosition.id
        );
        // If we have found the zig.
        if (_zigToLock !== undefined) {
          // Update the fx & fy positions of the zig.
          _zigToLock.fx = _zigPosition.x;
          _zigToLock.fy = _zigPosition.y;
        }
      }

      // Show the locked indicator for all locked zigs.
      this._d3svg._zigG
        .selectAll<SVGSVGElement, ZigDatum>(".zig")
        .filter(
          (_zigD: ZigDatum) => _zigD.fx !== undefined && _zigD.fx !== null
        )
        .select(".zig-lock")
        .attr("visibility", "visible");

      // Restart the simulation so that the graph is redrawn.
      this._d3svg._simulation.alpha(_d3AlphaRestartValue).restart();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(
        "Zigzag encoutered a problem restoring the layout data: D3Grapher -> injectLayout",
        layout,
        err
      );
    }
  }

  // If the container has been resized we need to modify some of the simulation settings and restart.
  public resize(): void {
    if (this._d3svg._outerSVGSelection) {
      const _newWidth = this._d3svg._SVGContainer.getBoundingClientRect().width;
      const _newHeight = this._d3svg._SVGContainer.getBoundingClientRect()
        .height;

      if (
        this._d3svg._width !== _newWidth ||
        this._d3svg._height !== _newHeight
      ) {
        this._d3svg._width = _newWidth;
        this._d3svg._height = _newHeight;

        if (this._d3svg._simulation) {
          D3Grapher._updateForces(this._d3svg);
        }
      }
    }
  }

  // TODO - Modify so that the existing zig & zags are updated rather than rebuilt.
  public setData(zigsIn: Array<Zig>, zagsIn: Array<Zag>): void {
    D3Grapher._importZigzags(zigsIn, zagsIn, this._d3svg);

    // Setup the force simulation.
    D3Grapher._initaliseSimulation(this._d3svg);

    // d3.join the zags to the zag data.
    // Each Zag is joined to an svg element.
    // We do not need to set the coordinate attributes as these will be applied in the simulation tick.
    const _zagSelection: ZagSelection = this._d3svg._zagG
      .selectAll<SVGSVGElement, ZagDatum>(".zag")
      .data<ZagDatum>(this._d3svg._d3ZagDatums)
      .join<SVGSVGElement>("svg")
      .classed("zag", true);

    _zagSelection.call(D3Grapher._createZagLines);

    _zagSelection.call(D3Grapher._createZagLabels);

    // d3.join the zigs to the zig data.
    // Each zig is joined to an svg use element.
    // We do not need to set the coordinate attributes as these will be applied in the simulation tick.
    const _zigSelection: ZigSelection = this._d3svg._zigG
      .selectAll<SVGSVGElement, ZigDatum>(".zig")
      .data<ZigDatum>(this._d3svg._d3ZigDatums, (_zig: ZigDatum) => _zig.id)
      .join<SVGSVGElement>("svg")
      .classed("zig", true);

    // Add the background, icon and label to zigs.
    _zigSelection.call(D3Grapher._createZigContents);

    // Un stick a zig when we double click on it.
    _zigSelection.call(D3Grapher._setupUnlockZig);

    // Setup the zig mouseover -> highlighting event handling.
    _zigSelection.call(
      D3Grapher._setupZigMouseover,
      _zagSelection,
      this._d3svg
    );

    // Setup the drag event handling.
    _zigSelection.call(D3Grapher._setupZigDrag, this._d3svg);

    // When the simulation ticks, we update the zigs & zags.
    if (this._d3svg._simulation)
      this._d3svg._simulation.on("tick", () => {
        _zigSelection.call(D3Grapher._updatePositionOfZigs, this._d3svg);
        _zagSelection.call(D3Grapher._updatePositionOfZags, this._d3svg);
      });
  }

  // Set the SVG container that the Grapher will render into.
  public setSVGContainer(container: SVGSVGElement): void {
    this._d3svg._SVGContainer = container;

    // D3 select the grapher container.
    this._d3svg._outerSVGSelection = d3.select(container as d3.BaseType);

    // Store the initial size of our container.
    this._d3svg._width = container.getBoundingClientRect().width;
    this._d3svg._height = container.getBoundingClientRect().height;

    this._d3svg._zagG = this._d3svg._outerSVGSelection
      .append("g" as string)
      .classed("zags", true);

    this._d3svg._zigG = this._d3svg._outerSVGSelection
      .append("g" as string)
      .classed("zigs", true);
  }

  // Update the display configuration.
  public updateConfig(
    zigDisplayConfig: ZigDisplayConfig,
    zagDisplayConfig: ZagDisplayConfig
  ): void {
    D3Grapher._zigDisplayConfig = zigDisplayConfig;
    D3Grapher._zagDisplayConfig = zagDisplayConfig;
  }
}
