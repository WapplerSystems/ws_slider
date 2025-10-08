<?php

declare(strict_types=1);


namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use WapplerSystems\WsSlider\Model\SliderDefinition;


interface SliderFactoryInterface
{

    public function build(
        array $configuration,
        SliderDefinition $slider,
        string $identifier,
        ?ServerRequestInterface $request = null
    ): SliderDefinition;
}
