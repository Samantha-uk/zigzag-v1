import {
  EditorTarget,
  EntitiesEditorEvent,
  configElementStyle,
} from "./ha/hasnippets";
import {
  HomeAssistant,
  LovelaceCardEditor,
  fireEvent,
} from "custom-card-helpers";
import {
  LitElement,
  PropertyValues,
  TemplateResult,
  customElement,
  html,
  internalProperty,
  property,
} from "lit-element";
import { assert, number, object, optional, string } from "superstruct";

import { ZigzagCardConfig as ZigzagConfig } from "./types";

const cardConfigStruct = object({
  type: string(),
  theme: optional(string()),
  thresholdLowerLQI: optional(number()),
  thresholdMiddleLQI: optional(number()),
  thresholdUpperLQI: optional(number()),
  colorLQIPoor: optional(string()),
  colorLQIModerate: optional(string()),
  colorLQIGood: optional(string()),
  colorLQIExcellent: optional(string()),
  iconNameCoordinator: optional(string()),
  iconNameRouter: optional(string()),
  iconNameEndDevice: optional(string()),
  iconNameUnknown: optional(string()),
  iconColorCoordinator: optional(string()),
  iconColorRouter: optional(string()),
  iconColorEndDevice: optional(string()),
  iconColorUnknown: optional(string()),
});

@customElement("zigzag-card-editor")
export class ZigzagCardEditor extends LitElement implements LovelaceCardEditor {
  @internalProperty() private _config?: ZigzagConfig;

  @internalProperty() private _helpers?: any;

  @property({ attribute: false }) public hass?: HomeAssistant;

  get _colorLQIExcellent(): string {
    return this._config!.colorLQIExcellent || "";
  }

  get _colorLQIGood(): string {
    return this._config!.colorLQIGood || "";
  }

  get _colorLQIModerate(): string {
    return this._config!.colorLQIModerate || "";
  }

  get _colorLQIPoor(): string {
    return this._config!.colorLQIPoor || "";
  }

  get _iconColorCoordinator(): string {
    return this._config!.iconColorCoordinator || "";
  }

  get _iconColorEndDevice(): string {
    return this._config!.iconColorEndDevice || "";
  }

  get _iconColorRouter(): string {
    return this._config!.iconColorRouter || "";
  }

  get _iconColorUnknown(): string {
    return this._config!.iconColorUnknown || "";
  }

  get _iconNameCoordinator(): string {
    return this._config!.iconNameCoordinator || "";
  }

  get _iconNameEndDevice(): string {
    return this._config!.iconNameEndDevice || "";
  }

  get _iconNameRouter(): string {
    return this._config!.iconNameRouter || "";
  }

  get _iconNameUnknown(): string {
    return this._config!.iconNameUnknown || "";
  }

  // Method ensures that the lovelace elements used are loaded.
  private async _loadHuiElements(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
    let _theme_select_editor = customElements.get("hui-theme-select-editor");
    if (!_theme_select_editor) {
      _theme_select_editor = document.createElement("hui-theme-select-editor");
    }
  }

  get _theme(): string {
    return this._config!.theme || "";
  }

  get _thresholdLowerLQI(): number {
    return this._config!.thresholdLowerLQI || 0;
  }

  get _thresholdMiddleLQI(): number {
    return this._config!.thresholdMiddleLQI || 0;
  }

  get _thresholdUpperLQI(): number {
    return this._config!.thresholdUpperLQI || 0;
  }

  private _valueChanged(ev: EntitiesEditorEvent): void {
    // Exit if no valid config or hass.
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target! as EditorTarget;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }

    if (target.configValue) {
      if (
        target.value === "" ||
        (target.type === "number" && isNaN(Number(target.value)))
      ) {
        this._config = { ...this._config };
        delete this._config[target.configValue!];
      } else {
        let value: any = target.value;
        if (target.type === "number") {
          value = Number(value);
        }
        this._config = { ...this._config, [target.configValue!]: value };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  protected firstUpdated(changedProps: PropertyValues): void {
    super.firstUpdated(changedProps);
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }
    // Braindead at the moment.
    return html`Please use the code editor to configure Zigzag.`;
/*     return html`
      ${configElementStyle}
      <div class="card-config">
        <div class="side-by-side">
          <ha-icon-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.icon"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value=${this._iconNameCoordinator}
            .configValue=${"iconNameCoordinator"}
            .placeholder=${this._iconNameCoordinator || "mdi:radio-tower"}
            @value-changed=${this._valueChanged}
          ></ha-icon-input>
          <paper-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.name"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value="${this._iconColorCoordinator}"
            .configValue=${"iconColorCoordinator"}
            .placeholder=${this._iconColorCoordinator || "blue"}
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>

        <div class="side-by-side">
          <ha-icon-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.icon"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value=${this._iconNameRouter}
            .configValue=${"iconNameRouter"}
            .placeholder=${this._iconNameRouter || "mdi:router"}
            @value-changed=${this._valueChanged}
          ></ha-icon-input>
          <paper-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.name"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value="${this._iconColorRouter}"
            .configValue="${"iconColorRouter"}"
            .placeholder=${this._iconColorRouter || "orange"}
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <div class="side-by-side">
          <ha-icon-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.icon"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value=${this._iconNameEndDevice}
            .configValue="${"iconNameEndDevice"}"
            .placeholder=${this._iconNameEndDevice || "mdi:zigbee"}
            @value-changed=${this._valueChanged}
          ></ha-icon-input>
          <paper-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.name"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value="${this._iconColorEndDevice}"
            .configValue="${"iconColorEndDevice"}"
            .placeholder=${this._iconColorEndDevice || "red"}
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <div class="side-by-side">
          <ha-icon-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.icon"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value=${this._iconNameUnknown}
            .configValue=${"iconNameUnknown"}
            .placeholder=${this._iconNameUnknown || "mdi:crosshairs-question"}
            @value-changed=${this._valueChanged}
          ></ha-icon-input>
          <paper-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.name"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value="${this._iconColorUnknown}"
            .configValue=${"iconColorUnknown"}
            .placeholder=${this._iconColorUnknown || "grey"}
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <hui-theme-select-editor
          .hass=${this.hass}
          .value="${this._theme}"
          .configValue="${"theme"}"
          @value-changed="${this._valueChanged}"
        ></hui-theme-select-editor>
      </div>
    `;
 */
  }

  public setConfig(config: ZigzagConfig): void {
    assert(config, cardConfigStruct);
    this._config = config;
    this._loadHuiElements();
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    super.shouldUpdate(changedProps);
    return true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zigzag-card-editor": ZigzagCardEditor;
  }
}
