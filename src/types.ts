import type { LovelaceCardConfig } from "custom-card-helpers";

export interface ZigzagCardConfig extends LovelaceCardConfig {
  type: string;
  theme?: string;
  thresholdLowerLQI?: number;
  thresholdMiddleLQI?: number;
  thresholdUpperLQI?: number;
  colorLQIPoor?: string;
  colorLQIModerate?: string;
  colorLQIGood?: string;
  colorLQIExcellent?: string;
  iconNameCoordinator?: string;
  iconNameRouter?: string;
  iconNameEndDevice?: string;
  iconNameUnknown?: string;
  iconColorCoordinator?: string;
  iconColorRouter?: string;
  iconColorEndDevice?: string;
  iconColorUnknown?: string;
}
