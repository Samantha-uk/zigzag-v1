// Copied from Home Assistant repos

import { ActionConfig, HomeAssistant } from "custom-card-helpers";

import { html } from "lit-element";

/** Return if a component is loaded. */
export const isComponentLoaded = (
  hass: HomeAssistant,
  component: string
): boolean => hass && hass.config.components.indexOf(component) !== -1;

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement["type"];
  config: ActionConfig;
}

export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
  image?: string;
}
export interface EntitiesEditorEvent {
  detail?: {
    entities?: EntityConfig[];
  };
  target?: EventTarget;
}

export const configElementStyle = html`
  <style>
    ha-switch {
      padding: 16px 0;
    }
    .side-by-side {
      display: flex;
    }
    .side-by-side > * {
      flex: 1;
      padding-right: 4px;
    }
    .suffix {
      margin: 0 8px;
    }
  </style>
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const installResizeObserver = async () => {
  if (typeof ResizeObserver !== "function") {
    window.ResizeObserver = (await import("resize-observer-polyfill")).default;
  }
};

// From: https://davidwalsh.name/javascript-debounce-function

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// eslint-disable-next-line @typescript-eslint/ban-types
export const debounce = <T extends Function>(
  func: T,
  wait: number,
  immediate = false
): T => {
  let timeout;
  // @ts-ignore
  return function (...args) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};
