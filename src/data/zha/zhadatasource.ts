import { DataSource } from "../datasource";
/* eslint-disable @typescript-eslint/no-use-before-define */
import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant } from "custom-card-helpers";
import { Zag } from "../../model/Zag";
import { Zig } from "../../model/Zig";

const ZHA_DEVICES_REQUEST = "zha/devices";
const ZHA_MAP_DEVICES_REQUEST = "zha_map/devices";

interface ZHAEntityReference extends HassEntity {
  name: string;
  original_name?: string;
}
interface ZHADevice {
  name: string;
  ieee: string;
  nwk: string;
  lqi: string;
  rssi: string;
  last_seen: string;
  manufacturer: string;
  model: string;
  quirk_applied: boolean;
  quirk_class: string;
  entities: ZHAEntityReference[];
  manufacturer_code: number;
  device_reg_id: string;
  user_given_name?: string;
  power_source?: string;
  area_id?: string;
  device_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signature: any;
}

interface ZHAMAPNeighbor {
  depth: number;
  device_type: string;
  ieee: string;
  lqi: number;
  manufacturer: string;
  model: string;
  new_joins_accepted: string;
  nwk: string;
  offline: boolean;
  pan_id: string;
  relation: string;
  rx_on_when_idle: string;
  supported: boolean;
}
interface ZHAMapDevice {
  device_type: string;
  ieee: string;
  lqi: number;
  manufacturer: string;
  model: string;
  neighbours: Array<ZHAMAPNeighbor>; // sic
  nwk: string;
  offline: false;
}
interface ZHAMAPResponse {
  time: number;
  devices: Array<ZHAMapDevice>;
}
// Datasource used to read zigs & zags from from a system with zha/zha-map.
export class ZHADataSource implements DataSource {
  private _hass: HomeAssistant;

  constructor(hass: HomeAssistant) {
    this._hass = hass;
  }

  private _mapZags(
    zhaMapNeighbors: ZHAMAPResponse,
    zigs: Array<Zig>,
    zags: Array<Zag>
  ): void {
    // Zags: the array we want to populate.
    // Zigs: Known zigs.
    zags.length = 0;
    for (const device of zhaMapNeighbors.devices) {
      for (const neighbor of device.neighbours) {
        // If the relationship is unrecognised, then do not create a zag.
        // TODO - Consider making this optional based on configuration.
        if (neighbor.relation === "None_of_the_above") break;
        // If the neighbor is not in zigs then ignore it.
        const _zig = zigs.find((zig) => zig.ieee === neighbor.ieee);
        if (_zig) {
          zags.push(({
            from: device.ieee,
            to: neighbor.ieee,
            depth: neighbor.depth,
            relation: neighbor.relation,
            lqi_from: device.lqi,
            lqi_to: neighbor.lqi,
          } as unknown) as Zag);

          // Add some more info to the zig
          _zig.pan_id = neighbor.pan_id;
          _zig.new_joins_accepted = neighbor.new_joins_accepted;
          _zig.rx_on_when_idle = neighbor.rx_on_when_idle;
        }
      }
    }
  }

  // Map the data into the zig objects.
  private _mapZigs(zhaDevices: Array<ZHADevice>, zigs: Array<Zig>): void {
    zigs.length = 0;
    for (const device of zhaDevices) {
      zigs.push(({
        ieee: device.ieee,
        name: device.name,
        device_type: device.device_type,
        user_given_name: device.user_given_name,
        nwk: device.nwk,
        lqi: device.lqi,
        rssi: device.rssi,
        last_seen: device.last_seen,
        manufacturer: device.manufacturer,
        model: device.model,
        quirk_applied: device.quirk_applied,
        quirk_class: device.quirk_class,
        manufacturer_code: device.manufacturer_code,
        device_reg_id: device.device_reg_id,
        power_source: device.power_source,
        area_id: device.area_id,
      } as unknown) as Zig);
    }
  }

  // Fetch the device data using web sockets
  public async fetchData(zigs: Array<Zig>, zags: Array<Zag>): Promise<boolean> {
    const zhaDevices = await this._hass.callWS<Array<ZHADevice>>({
      type: ZHA_DEVICES_REQUEST,
    });

    this._mapZigs(zhaDevices, zigs);

    const zhaMapNeighbors = await this._hass.callWS<ZHAMAPResponse>({
      type: ZHA_MAP_DEVICES_REQUEST,
    });

    this._mapZags(zhaMapNeighbors, zigs, zags);

    return true;
  }
}
