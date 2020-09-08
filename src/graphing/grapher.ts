import { D3Grapher } from "./d3/d3grapher";
import { Zag } from "../model/Zag";
import { ZagDisplayConfig } from "./ZagDisplayConfig";
import { Zig } from "../model/Zig";
import { ZigDisplayConfig } from "./ZigDisplayConfig";

export enum GrapherType {
  VIS = "vis",
  D3 = "d3",
}

export interface Grapher {
  setData(zigs: Array<Zig>, zags: Array<Zag>): void;
  setSVGContainer(container: SVGSVGElement): void;
  updateConfig(
    zigDisplayConfig: ZigDisplayConfig,
    zagDisplayConfig: ZagDisplayConfig
  ): void;
  extractLayout(): Array<GrapherLayout>;
  injectLayout(_grapherLayout: Array<GrapherLayout>): void;
  resize(): void;
}

// Used to hold the layout of locked zigs to be saved externally
export interface GrapherLayout {
  id: string;
  x: number;
  y: number;
}

export class GrapherFactory {
  public static create(grapherType: string): Grapher | undefined {
    switch (grapherType) {
      case GrapherType.D3:
        return new D3Grapher();

      default:
        return undefined;
    }
  }
}
