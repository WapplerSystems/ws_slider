# ws_slider TYPO3 Extension

[![Crowdin](https://badges.crowdin.net/typo3-extension-ws_slider/localized.svg)](https://crowdin.com/project/typo3-extension-ws_slider)

## Universal slider / carousel extension

A TYPO3 content element that provides a configurable slider/carousel with support for multiple rendering engines. Each renderer has its own FlexForm settings and TypoScript constants, allowing global defaults that editors can override per element.

### Supported renderers

| Renderer | Library | Site Set name |
|---|---|---|
| [Swiper](https://swiperjs.com/) | Swiper.js | `wapplersystems/ws-slider-swiper` |
| [FlexSlider 2](http://flexslider.woothemes.com/) | FlexSlider | `wapplersystems/ws-slider-flexslider` |
| [TinySlider 2](https://ganlanyuan.github.io/tiny-slider/) | Tiny Slider | `wapplersystems/ws-slider-tinyslider` |
| [Slick](https://kenwheeler.github.io/slick/) | Slick | `wapplersystems/ws-slider-slick` |
| [Bootstrap](https://getbootstrap.com/docs/5.3/components/carousel/) | Bootstrap 5 | `wapplersystems/ws-slider-bootstrap` |

### Requirements

- TYPO3 v14
- PHP 8.2+
- `fluid_styled_content`

## Installation

```bash
composer require wapplersystems/ws-slider
```

## Configuration

### 1. Include the Site Set

Add the base Site Set `wapplersystems/ws-slider` **and** the Site Set for the renderer(s) you want to use (e.g. `wapplersystems/ws-slider-swiper`) in your site configuration.

### 2. TypoScript constants

Each renderer ships global TypoScript constants (e.g. `plugin.tx_wsslider.settings.renderer.swiper.*`). These serve as default values for all slider elements using that renderer.

### 3. Per-element settings

Editors can override any constant via the FlexForm settings of the content element. A checkbox controls whether the global default or a custom value is used. The current default value is always visible as a placeholder.

![Screenshot of FlexForm settings](https://raw.githubusercontent.com/svewap/ws_slider/master/Documentation/Images/OwlSettings.png)

### 4. Presets

Presets allow storing a named set of slider settings in the database (`tx_wsslider_domain_model_preset`). Editors can select a preset instead of configuring each option individually.

## Templating

Override the Fluid templates located in `Resources/Private/Templates/` via TypoScript `templateRootPaths` as usual.

## Video tutorial

A German video tutorial on installation and configuration: [YouTube](https://youtu.be/Kvfwmei7PWc)

## Authors

* [Sven Wappler](https://github.com/svewap)
* Contributors

## Links

- [Documentation](https://docs.typo3.org/typo3cms/extensions/ws_slider/)
- [Composer package](https://packagist.org/packages/wapplersystems/ws-slider)
- [TER](https://extensions.typo3.org/extension/ws_slider)
- [Crowdin (translations)](https://crowdin.com/project/typo3-extension-ws_slider)
