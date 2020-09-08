import { HomeAssistant } from "custom-card-helpers";
import { ZHADataSource } from "./zha/zhadatasource";
import { Zag } from "../model/Zag";
import { Zig } from "../model/Zig";

enum DataSourceType {
  ZHA = "zha",
  DECONZ = "deconz",
  ZWAVE = "zwave",
}

export interface DataSource {
  fetchData(zigs: Array<Zig>, zags: Array<Zag>): Promise<boolean>;
}

export class DataSourceFactory {
  public static create(
    hass: HomeAssistant,
    dataSourceType: string
  ): DataSource | undefined {
    switch (dataSourceType) {
      case DataSourceType.ZHA:
        return new ZHADataSource(hass);

      default:
        return undefined;
    }
  }
}
