<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class BootstrapFactory extends AbstractSliderFactory
{

    protected array $defaultOptions = [
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


    public function build(array $options, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {

        $options = $this->mergeOptions($options);

        $this->sliderPrototype->setOptions($options);

        return $this->sliderPrototype;
    }
}
