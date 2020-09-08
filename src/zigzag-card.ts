import "./zigzag-config-editor";

import { LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import { TemplateResult, customElement, html } from "lit-element";

import { ZigzagCore } from "./zigzag-core";
import { localize } from "./localize/localize";

export const CARD_VERSION = "0.1.0";

/* eslint no-console: 0 */
console.info(
  `%c  ZIGZAG-CARD \n%c  ${localize("common.version")} ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).customCards = (window as any).customCards || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).customCards.push({
  type: "custom-card-zigzag",
  name: "Zigzag Card",
  description:
    "The Zigzag card displays a graphical view of your Zigbee network.",
});

@customElement("custom-card-zigzag")
export class ZigzagCard extends ZigzagCore implements LovelaceCard {
  public getCardSize(): number {
    return 8;
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./zigzag-config-editor");
    return document.createElement("zigzag-card-editor");
  }

  private showError(error: string): TemplateResult {
    const errorCard = document.createElement("hui-error-card") as LovelaceCard;
    errorCard.setConfig({
      type: "error",
      error,
      origConfig: this._config,
    });

    return html` ${errorCard} `;
  }

  private showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "custom-card-zigzag": ZigzagCard;
  }
}
