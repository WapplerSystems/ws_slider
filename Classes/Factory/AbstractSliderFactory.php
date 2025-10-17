<?php

declare(strict_types=1);


namespace WapplerSystems\WsSlider\Factory;


abstract class AbstractSliderFactory implements SliderFactoryInterface
{


    protected function getParameter(array $configuration, string $parameterName) {



    }

    protected function js_encode($array)
    {
        $out = [];
        foreach ($array as $k => $v) {
            $key = preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $k) ? $k : json_encode($k);
            $val = is_array($v) ? $this->js_encode($v) : json_encode($v);
            $out[] = $key . ':' . $val;
        }
        return '{' . implode(',', $out) . '}';
    }

}
