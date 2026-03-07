<?php

declare(strict_types=1);

namespace WapplerSystems\WsSlider\Source;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use Psr\Http\Message\ServerRequestInterface;

/**
 */
#[AutoconfigureTag('wsslider.source')]
interface SliderSourceInterface
{
    /**
     *
     * @return string
     */
    public function getName(): string;

    /**
     *
     * @return array
     */
    public function getSliderItems(ServerRequestInterface $request): array;

}
