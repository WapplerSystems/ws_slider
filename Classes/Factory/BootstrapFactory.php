<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class BootstrapFactory extends AbstractSliderFactory
{
    public function build(array $configuration, SliderDefinition $slider, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {
        $slider->setConfiguration($configuration);

        $options = [
            'interval' => 5000,
            'keyboard' => true,
            'pause' => 'hover',
            'ride' => false,
            'touch' => true,
            'wrap' => true,
            'control' => true,
            'indicators' => true,
            'title' => true,
            'description' => true,
            'startAt' => 0,
        ];

        // Konfiguration überschreibt Defaults
        if (isset($configuration['parameters']) && is_array($configuration['parameters'])) {
            foreach ($configuration['parameters'] as $key => $value) {
                $options[$key] = $value;
            }
        }

        // Bootstrap Carousel erwartet bestimmte Optionen als Datenattribute oder JS-Optionen
        $jsOptions = [
            'interval' => (int)$options['interval'],
            'keyboard' => (bool)$options['keyboard'],
            'pause' => $options['pause'],
            'ride' => $options['ride'],
            'touch' => (bool)$options['touch'],
            'wrap' => (bool)$options['wrap'],
        ];
        $jsOptionsJson = $this->js_encode($jsOptions);
        $js = "var {$identifier} = new bootstrap.Carousel(document.getElementById('{$identifier}'), {$jsOptionsJson});\n";
        $slider->setJavaScript($js);
        // Die folgenden Optionen bleiben im Konfigurationsarray erhalten
        return $slider;
    }
}
