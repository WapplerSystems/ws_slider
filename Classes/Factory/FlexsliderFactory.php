<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class FlexsliderFactory extends AbstractSliderFactory
{

    protected array $defaultOptions = [
        'selector' => '.slides > li',
        'animation' => 'fade',
        'easing' => 'swing',
        'direction' => 'horizontal',
        'reverse' => false,
        'animationLoop' => true,
        'smoothHeight' => false,
        'startAt' => 0,
        'slideshow' => true,
        'slideshowSpeed' => 7000,
        'animationSpeed' => 600,
        'initDelay' => 0,
        'randomize' => false,
        'fadeFirstSlide' => true,
        'pauseOnAction' => true,
        'pauseOnHover' => false,
        'pauseInvisible' => true,
        'useCSS' => true,
        'touch' => true,
        'video' => false,
        'controlNav' => true,
        'directionNav' => true,
        'keyboard' => true,
        'multipleKeyboard' => false,
        'mousewheel' => false,
        'pausePlay' => false,
        'controlsContainer' => '',
        'manualControls' => '',
        'customDirectionNav' => '',
        'sync' => '',
        'asNavFor' => '',
        'itemWidth' => 0,
        'itemMargin' => 0,
        'minItems' => 3,
        'maxItems' => 6,
        'move' => 0,
    ];



    public function build(array $options, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {

        $options = $this->mergeOptions($options);

        $this->sliderPrototype->setOptions($options);

        $optionsJson = $this->js_encode($options);
        $js = "jQuery('#{$identifier}').flexslider({$optionsJson});\n";
        $this->sliderPrototype->setJavaScript($js);

        return $this->sliderPrototype;
    }
}
