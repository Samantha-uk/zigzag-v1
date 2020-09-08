import { ZigzagCore } from "./zigzag-core";
import { customElement } from "lit-element";
import { localize } from "./localize/localize";

export const PANEL_VERSION = "0.1.0";

/* eslint no-console: 0 */
console.info(
  `%c  ZIGZAG-PANEL \n%c  ${localize("common.version")} ${PANEL_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);

@customElement("custom-panel-zigzag")
export class ZigzagPanel extends ZigzagCore {}

declare global {
  interface HTMLElementTagNameMap {
    "custom-panel-zigzag": ZigzagPanel;
  }
}
