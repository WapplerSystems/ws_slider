<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class TinysliderFactory extends AbstractSliderFactory
{
    public function build(array $configuration, SliderDefinition $slider, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {
        $slider->setConfiguration($configuration);

        $options = [
            'container' => "#{$identifier}",
            'items' => 1,
            'slideBy' => 'page',
            'autoplay' => false,
            'autoplayButtonOutput' => true,
            'autoplayTimeout' => 5000,
            'autoplayHoverPause' => false,
            'controls' => true,
            'controlsText' => ['prev', 'next'],
            'controlsContainer' => false,
            'nav' => true,
            'navContainer' => false,
            'navAsThumbnails' => false,
            'arrowKeys' => false,
            'speed' => 300,
            'mouseDrag' => false,
            'touch' => true,
            'gutter' => 0,
            'edgePadding' => 0,
            'fixedWidth' => false,
            'autoWidth' => false,
            'autoHeight' => false,
            'responsive' => [],
            'lazyload' => false,
            'loop' => true,
            'rewind' => false,
            'center' => false,
            'startIndex' => 0,
            'swipeAngle' => 15,
            'animateIn' => '',
            'animateOut' => '',
            'animateDelay' => false,
            'disable' => false,
            'freezable' => true,
            'onInit' => null,
            'onTransitionStart' => null,
            'onTransitionEnd' => null,
            'onTouchStart' => null,
            'onTouchMove' => null,
            'onTouchEnd' => null,
            'onDragStart' => null,
            'onDragMove' => null,
            'onDragEnd' => null,
            'onIndexChanged' => null,
            'onResize' => null,
        ];

        // Konfiguration überschreibt Defaults
        if (isset($configuration['parameters']) && is_array($configuration['parameters'])) {
            foreach ($configuration['parameters'] as $key => $value) {
                $options[$key] = $value;
            }
        }

        $optionsJson = $this->js_encode($options);
        $js = "var {$identifier} = tns({$optionsJson});\n";
        $slider->setJavaScript($js);

        return $slider;
    }
}
