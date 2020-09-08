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
