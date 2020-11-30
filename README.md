# Zigzag v0.1.0 (Alpha Release)

Zigzag is a custom card/panel for [Home Assistant](https://www.home-assistant.io/)  that displays a graphical layout of Zigbee devices and the connections between them.

In Zigzag, Zigbee devices are known as Zigs and the connections between them as Zags.

Zigzag can be installed as a panel or a custom card.

## Prerequisites

- Home Assistant
- [ZHA](https://www.home-assistant.io/integrations/zha/) (A Home Assistant Zigbee Integration)
- [ZHA-MAP](https://github.com/zha-ng/zha-map#readme) A custom component that collects the Zag information.

*It is possible to use Zigzag without ZHA-MAP, however it is of limited value as no Zags will be displayed.*

## Installation

At present the installation of Zigzag is not automated.

You will need to:

- Create a **zigzag** directory inside your Home Assistant **www** directory.
- Copy zigzag-panel.js and/or zigzag-card.js from the **dist** directory of this repo into your zigzag folder.

### Zigzag as a panel

- Copy the contents of the **static/config.yaml** file in this repo to your caonfiguration.yaml file.
- Restart Home Assistant.
Zigzag should appear as an entry on the left of the display.

### Zigzag as a Custom Card
- Using the Lovelace Resources section (Configuration->Lovelace Dashboards -> Resources) add a new resource.
- 
- Url: /local/zigzag/zigzag-card.js
- Resource Type: JavaScript Module

You can now add a Zigzag custom card as described [here](https://www.home-assistant.io/lovelace/).

*Zigzag as a card works best when put in a view that has **panel mode** active.*


## Know Issues/Limitations

- Icon paths are hardcoded into the source.
- Icon size is currently set at 48px (Once the hardcoded icons are resolved, this can be addressed.)
- Text orientation on zag labels is fixed.
- Card Config editor is unfinished. (I could not get the hui-elements to load and I ran out of steam trying ...)
- Does not check for existence of zha or zha-map.
- Error handling needs to be … hardened.
- Only tested on a small Zigbee network.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[releases]: https://github.com/Samantha-uk/zigzag/releases
[releases-shield]: https://img.shields.io/github/release/Samantha-uk/zigzag.svg?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/Samantha-uk/zigzag.svg?style=for-the-badge
[commits-shield]: https://img.shields.io/github/commit-activity/y/Samantha-uk/zigzag.svg?style=for-the-badge
[commits]: https://github.com/Samantha-uk/zigzag/commits/master
[maintenance-shield]: https://img.shields.io/maintenance/yes/2020.svg?style=for-the-badge

## Related projects

### ZHA integration component for Home Assistant
[ZHA integration component for Home Assistant](https://www.home-assistant.io/integrations/zha/) is a reference implementation of the zigpy library as integrated into the core of **[Home Assistant](https://www.home-assistant.io)** (a Python based open source home automation software). There are also other GUI and non-GUI projects for Home Assistant's ZHA components which builds on or depends on its features and functions to enhance or improve its user-experience, some of those are listed and linked below.

### zha-map
**[zha-map](https://github.com/zha-ng/zha-map)** integration commponent for [Home Assistant](https://www.home-assistant.io) allow you to make a ZHA (Zigbee Home Automation) network topology map. **zha-network-visualization-card** relies on this data to visualize that map in Lovelace of Zigbee devices and the connections between them.

### ZHA Custom
[zha_custom](https://github.com/Adminiuga/zha_custom) is a custom component package for Home Assistant (with its ZHA component for zigpy integration) that acts as zigpy commands service wrapper, when installed it allows you to enter custom commands via to zigy to example change advanced configuration and settings that are not available in the UI.

### zha-network-visualization-card
**[zha-network-visualization-card](https://github.com/dmulcahey/zha-network-visualization-card)** is an  alternative custom lovelace element for [Home Assistant](https://www.home-assistant.io/) that visualizing your ZHA Zigbee network. Zigbee network mapping with zha-map can help you identify weak points like bad links between your devices. Like Zigzag, zha-network-visualization-card relies on the data provided by the [zha-map](https://github.com/zha-ng/zha-map) integration commponent.

### ZHA Network Card
[zha-network-card](https://github.com/dmulcahey/zha-network-card) is a another alternative custom Lovelace card for Home Assistant that displays ZHA component Zigbee network and device information in Home Assistant. This implementation leverages the ZHA websocket API to get ZHA device information instead.

### ZHA Device Exporter
[zha-device-exporter](https://github.com/dmulcahey/zha-device-exporter) is a custom component for Home Assistant to allow the ZHA component to export lists of Zigbee devices.

### ZHA Device Handlers
ZHA deviation handling in Home Assistant relies on the third-party [ZHA Device Handlers](https://github.com/zigpy/zha-device-handlers) project. Zigbee devices that deviate from or do not fully conform to the standard specifications set by the [Zigbee Alliance](https://www.zigbee.org) may require the development of custom [ZHA Device Handlers](https://github.com/zigpy/zha-device-handlers) (ZHA custom quirks handler implementation) to for all their functions to work properly with the ZHA component in Home Assistant. These ZHA Device Handlers for Home Assistant can thus be used to parse custom messages to and from non-compliant Zigbee devices. The custom quirks implementations for zigpy implemented as ZHA Device Handlers for Home Assistant are a similar concept to that of [Hub-connected Device Handlers for the SmartThings platform](https://docs.smartthings.com/en/latest/device-type-developers-guide/) as well as that of [zigbee-herdsman converters as used by Zigbee2mqtt](https://www.zigbee2mqtt.io/how_tos/how_to_support_new_devices.html), meaning they are each virtual representations of a physical device that expose additional functionality that is not provided out-of-the-box by the existing integration between these platforms.

### Zigpy
**[zigpy](https://github.com/zigpy/zigpy)** is [Zigbee protocol stack](https://en.wikipedia.org/wiki/Zigbee) integration project to implement the **[Zigbee Home Automation](https://www.zigbee.org/)** standard as a Python library. Zigbee Home Automation integration with zigpy allows you to connect one of many off-the-shelf Zigbee adapters using one of the available Zigbee radio library modules compatible with zigpy to control Zigbee devices. There is currently support for controlling Zigbee device types such as binary sensors (e.g. motion and door sensors), analog sensors (e.g. temperature sensors), lightbulbs, switches, and fans. Zigpy is tightly integrated with [Home Assistant](https://www.home-assistant.io)'s [ZHA component](https://www.home-assistant.io/components/zha/) and provides a user-friendly interface for working with a Zigbee network.
