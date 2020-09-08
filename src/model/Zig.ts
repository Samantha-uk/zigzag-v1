export enum ZigRole {
  Coordinator = "Coordinator",
  Router = "Router",
  EndDevice = "EndDevice",
  Unknown = "Unknown",
}

export enum zigPower {
  Mains = "Mains",
  Battery = "Battery",
  Unknown = " Unknown",
}

export interface Zig {
  id: string;
  role: ZigRole.Unknown;
  name: string;
  ieee: string;
  nwk?: string;
  lqi: number;
  rssi: number;
  manufacturer: string;
  manufacturer_code: string;
  model: string;
  device_type: string;
  power_source?: string;
  last_seen: string;
  quirk_applied: boolean;
  quirk_class: string;
  device_reg_id: string;
  user_given_name?: string;
  area_id?: string;
  signature?: string;
  pan_id?: string; // From zha-map
  rx_on_when_idle?: string; // From zha-map
  new_joins_accepted?: string; // From zha-map
}
