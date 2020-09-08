import {
  CSSResult,
  LitElement,
  PropertyValues,
  TemplateResult,
  css,
  html,
  internalProperty,
  property,
} from "lit-element";
import { DataSource, DataSourceFactory } from "./data/datasource";
import { Grapher, GrapherFactory, GrapherLayout } from "./graphing/grapher";
import { HomeAssistant, getLovelace } from "custom-card-helpers";
import { debounce, installResizeObserver } from "./ha/hasnippets";

import { Zag } from "./model/Zag";
import { ZagDisplayConfig } from "./graphing/ZagDisplayConfig";
import { Zig } from "./model/Zig";
import { ZigDisplayConfig } from "./graphing/ZigDisplayConfig";
import { ZigzagCardConfig as ZigzagConfig } from "./types";
import { localize } from "./localize/localize";

// LOCAL CONSTANTS
const grapherSVGContainerID = "grapherContainer";

export abstract class ZigzagCore extends LitElement {
  @internalProperty() protected _config?: ZigzagConfig;

  // Used to generate the zigzag network graph.
  private _dataSource!: DataSource;

  // Used to indicate if we are in edit mode
  private _editMode = false;

  private _grapher!: Grapher;

  // Used to obtain the zig & zag data.
  private _initialised = false;

  private _resizeObserver?: ResizeObserver;

  private _svgElement: HTMLElement | null = null;

  // Collection of zig objects (A Zigbee device).
  private _zags: Array<Zag> = [];

  // Collection of zag objects (A connection between zigs).
  private _zigLayout: Array<GrapherLayout> = [];

  // Used to reflect if we have had a successful initialisation of the zigzag card.
  private _zigs: Array<Zig> = [];

  @property({ attribute: false }) public hass!: HomeAssistant;

  private async _attachObserver(_svgElement: HTMLElement): Promise<void> {
    if (!this._resizeObserver) {
      await installResizeObserver();
      this._resizeObserver = new ResizeObserver(
        debounce(() => this._resize(), 250, false)
      );
      // Watch for changes in size
      this._resizeObserver.observe(_svgElement);
    }
  }

  private _initaliseDatastore(): boolean {
    const _dataSource = DataSourceFactory.create(this.hass, "zha");
    if (_dataSource) {
      this._dataSource = _dataSource;
      return true;
    }
    return false;
  }

  private _initaliseGrapher(): boolean {
    // Create a new Grapher
    const _grapher = GrapherFactory.create("d3");

    if (_grapher) {
      this._grapher = _grapher;
      return true;
    }

    return false;
  }

  private _initialise(): boolean {
    // Guard against double initialisation.
    if (this._initialised) {
      return true;
    }

    // Check to see if we can find the html element where the graph is to be displayed.
    if (this.shadowRoot) {
      this._svgElement = this.shadowRoot.getElementById(grapherSVGContainerID);

      if (this._svgElement !== null && this._svgElement !== undefined) {
        // Initalise the Grapher.
        this._grapher.setSVGContainer(
          (this._svgElement as unknown) as SVGSVGElement
        );
        this._grapher.updateConfig(
          new ZigDisplayConfig(),
          new ZagDisplayConfig()
        );

        // Load the data.
        // eslint-disable-next-line prettier/prettier
        this._dataSource
          .fetchData(this._zigs, this._zags)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .then((_loaded) => {
            this._grapher.setData(this._zigs, this._zags);

            // Inject the zig layout if there is one
            if (Array.isArray(this._zigLayout)) {
              this._grapher.injectLayout(this._zigLayout);
              this._zigLayout = [];
            }

            this._initialised = true;
          });
        this._attachObserver(this._svgElement.parentElement as HTMLElement);
        this.requestUpdate();
      }
    }
    return this._initialised;
  }

  private _resize() {
    if (this._grapher) {
      this._grapher.resize();
    }
  }

  private async _restoreZigLayout(): Promise<void> {
    // Ask for the zigzag-layout
    const _result = await this.hass!.callWS<{
      value: Array<GrapherLayout> | null;
    }>({
      type: "frontend/get_user_data",
      key: "zigzag-layout",
    });

    if (_result.value) {
      // If we are initalised then we inject the layout.
      if (this._initialised) {
        this._grapher.injectLayout(_result.value);
      } else {
        // otherwise we store it to be injected later.
        this._zigLayout = _result.value;
      }
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (getLovelace()) {
      this._editMode = getLovelace().editMode;
    }

    if (this._editMode) return;

    if (!this._initaliseDatastore() || !this._initaliseGrapher()) {
      // TODO - raise an error.
    }

    this._restoreZigLayout();
  }

  public async disconnectedCallback(): Promise<void> {
    super.disconnectedCallback();
    this._initialised = false;

    if (this._editMode) return;
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();

      if (this._grapher) {
        const _layout: Array<GrapherLayout> = this._grapher.extractLayout();

        // Store Zigzag data
        await this.hass!.callWS({
          type: "frontend/set_user_data",
          key: "zigzag-layout",
          value: _layout,
        });
      }
    }
  }

  // Called the first time the zigzag card is put into the DOM.
  protected firstUpdated(changedProps: PropertyValues): void {
    super.firstUpdated(changedProps);
    if (this._editMode) return;
    if (this._initialise()) {
      // TODO - How to handle failure.
    }
  }

  public static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFallback: string[]
  ): ZigzagConfig {
    if (!hass || !entities || !entitiesFallback) {
      return { type: "custom-card-zigzag" };
    }
    return { type: "custom:custom-card-zigzag" };
  }

  protected render(): TemplateResult | void {
    // TODO - Replace the embedded mdi icons with ones from home assistant <ha-svg-icon>.
    // TODO - Clean up the html template and remove this the next line.
    /* eslint-disable lit/no-invalid-html */
    if (this._editMode) {
      return html`<div id="edit-mode">
        No Zigzag graph is displayed in edit mode
      </div>`;
    }

    return html`
      <div style="height: 100%; width: 100%;">
        <svg
          class="grapherContainer"
          id="${grapherSVGContainerID}"
          style="height:100%; width:100%; background-image: url('/local/zigzag/background.svg'); background-repeat: no-repeat;"
        >
          <defs>
            <symbol id="icon-mdi:zigbee">
              <?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="48"
                height="48"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4.06,6.15C3.97,6.17 3.88,6.22 3.8,6.28C2.66,7.9 2,9.87 2,12A10,10 0 0,0 12,22C15,22 17.68,20.68 19.5,18.6L17,18.85C14.25,19.15 11.45,19.19 8.66,18.96C7.95,18.94 7.24,18.76 6.59,18.45C5.73,18.06 5.15,17.23 5.07,16.29C5.06,16.13 5.12,16 5.23,15.87L7.42,13.6L15.03,5.7V5.6H10.84C8.57,5.64 6.31,5.82 4.06,6.15M20.17,17.5C20.26,17.47 20.35,17.44 20.43,17.39C21.42,15.83 22,14 22,12A10,10 0 0,0 12,2C9.22,2 6.7,3.13 4.89,4.97H5.17C8.28,4.57 11.43,4.47 14.56,4.65C15.5,4.64 16.45,4.82 17.33,5.17C18.25,5.53 18.89,6.38 19,7.37C19,7.53 18.93,7.7 18.82,7.82L9.71,17.19L9,17.95V18.06H13.14C15.5,18 17.84,17.81 20.17,17.5Z"
                />
              </svg>
            </symbol>
            <symbol id="icon-mdi:radio-tower">
              <?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="48"
                height="48"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12,10A2,2 0 0,1 14,12C14,12.5 13.82,12.94 13.53,13.29L16.7,22H14.57L12,14.93L9.43,22H7.3L10.47,13.29C10.18,12.94 10,12.5 10,12A2,2 0 0,1 12,10M12,8A4,4 0 0,0 8,12C8,12.5 8.1,13 8.28,13.46L7.4,15.86C6.53,14.81 6,13.47 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12C18,13.47 17.47,14.81 16.6,15.86L15.72,13.46C15.9,13 16,12.5 16,12A4,4 0 0,0 12,8M12,4A8,8 0 0,0 4,12C4,14.36 5,16.5 6.64,17.94L5.92,19.94C3.54,18.11 2,15.23 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12C22,15.23 20.46,18.11 18.08,19.94L17.36,17.94C19,16.5 20,14.36 20,12A8,8 0 0,0 12,4Z"
                />
              </svg>
            </symbol>
            <symbol id="icon-mdi:router">
              <?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="48"
                height="48"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2M12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20M13 13V16H15L12 19L9 16H11V13M5 13H8V15L11 12L8 9V11H5M11 11V8H9L12 5L15 8H13V11M19 11H16V9L13 12L16 15V13H19"
                />
              </svg>
            </symbol>
            <symbol id="icon-mdi:crosshairs-question">
              <?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="48"
                height="48"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3.05 13H1V11H3.05C3.5 6.83 6.83 3.5 11 3.05V1H13V3.05C17.17 3.5 20.5 6.83 20.95 11H23V13H20.95C20.5 17.17 17.17 20.5 13 20.95V23H11V20.95C6.83 20.5 3.5 17.17 3.05 13M12 5C8.13 5 5 8.13 5 12S8.13 19 12 19 19 15.87 19 12 15.87 5 12 5M11.13 17.25H12.88V15.5H11.13V17.25M12 6.75C10.07 6.75 8.5 8.32 8.5 10.25H10.25C10.25 9.28 11.03 8.5 12 8.5S13.75 9.28 13.75 10.25C13.75 12 11.13 11.78 11.13 14.63H12.88C12.88 12.66 15.5 12.44 15.5 10.25C15.5 8.32 13.93 6.75 12 6.75Z"
                />
              </svg>
              <symbol id="icon-mdi:lock">
                <?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
                  />
                </svg>
              </symbol>
            </symbol>
          </defs>
        </svg>
      </div>
    `;
  }

  public setConfig(config: ZigzagConfig): void {
    if (!config || config.show_error) {
      throw new Error(localize("common.invalid_configuration"));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = { ...config };
  }

  // Called when connectedCallback is invoked.
  protected shouldUpdate(): boolean {
    // TODO - Change so we only update if required. */
    return true;
  }

  // TODO - Use the Lovelace UI styles.
  public static get styles(): CSSResult {
    return css`
      svg.zig {
        overflow: visible;
      }

      circle.zig-background {
        fill: var(--primary-background-color);
        stroke-width: 2;
        stroke: var(--secondary-background-color);
      }

      svg.highlight circle.zig-background {
        fill: var(--primary-background-color);
        stroke-width: 2;
        stroke: var(--secondary-background-color);
      }

      text.zig-label {
        font-family: inherit;
        font-weight: var(--paper-font-code2_-_font-weight);
        fill: var(--primary-text-color);
      }

      .zag {
        stroke-width: 2;
      }

      .zig-lock {
        opacity: 50%;
      }

      text.zag-label {
        font-family: inherit;
        font-style: italic;
        fill: var(--secondary-text-color);
      }

      .zags.dim > .zag:not(.highlight) {
        opacity: 0.2;
      }

      .zigs.dim > .zig:not(.highlight) .zig-icon {
        opacity: 0.2;
      }

      .zigs.dim > .zig:not(.highlight) .zig-lock {
        opacity: 0.2;
      }
    `;
  }
}
