<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Utility\DebugUtility;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class SwiperFactory extends AbstractSliderFactory
{

    public function build(array $configuration, ?ServerRequestInterface $request = null): SliderDefinition
    {
        DebugUtility::debug($configuration);

        // javascript


        $slider = new SliderDefinition();



        return $slider;
    }
}
