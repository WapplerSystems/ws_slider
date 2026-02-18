<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class TinysliderFactory extends AbstractSliderFactory
{

    protected array $defaultOptions = [
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

    public function build(array $options, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {

        $options = $this->mergeOptions($options);
        $options['container'] = '#' . $identifier;

        $this->sliderPrototype->setOptions($options);

        $options['nonce'] = 'js:document.currentScript.nonce';

        $optionsJson = $this->js_encode($options);
        $js = "var {$identifier} = tns({$optionsJson});\n";
        $this->sliderPrototype->setJavaScript($js);

        return $this->sliderPrototype;
    }
}
