<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\Model;

use Psr\Http\Message\ServerRequestInterface;

class SliderDefinition
{

    private string $javascript = '';


    public function render(?ServerRequestInterface $request = null): string
    {

        return '';
    }

    public function setJavaScript($javascript): void
    {
        $this->javascript = $javascript;
    }


}
