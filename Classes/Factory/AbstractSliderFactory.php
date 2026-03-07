<?php

declare(strict_types=1);


namespace WapplerSystems\WsSlider\Factory;


use TYPO3\CMS\Extbase\Utility\LocalizationUtility;
use WapplerSystems\WsSlider\Model\SliderDefinition;

abstract class AbstractSliderFactory implements SliderFactoryInterface
{

    protected array $defaultOptions = [];


    protected SliderDefinition $sliderPrototype;

    public function setPrototype(SliderDefinition $sliderPrototype)
    {
        $this->sliderPrototype = $sliderPrototype;
    }

    public function setConfiguration($configuration): void
    {
        $this->sliderPrototype->setConfiguration($configuration);
    }

    protected function getParameter(array $configuration, string $parameterName) {

        $className = get_class($this);
        $className = substr($className, 32, -7);
        $xlfFilename = strtolower($className);
        $parameters = $configuration['parameters'] ?? [];
        return LocalizationUtility::translate('LLL:EXT:ws_slider/Resources/Private/Language/' . $xlfFilename . '.xlf:options.' . $parameterName) ?? $parameters[$parameterName] ?? null;
    }

    protected function mergeOptions(array $options)
    {
        return array_merge($this->defaultOptions, $options);
    }

    protected function js_encode($array)
    {
        $out = [];
        foreach ($array as $k => $v) {
            $key = preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', (string)$k) ? $k : json_encode($k);
            if (is_array($v)) {
                $val = $this->js_encode($v);
            } else {
                if (is_string($v) && str_starts_with($v,'js:')) {
                    $val = substr($v, 3);
                } else if (is_string($v) && str_starts_with($v,'num:')) {
                        $val = (int)substr($v, 4);
                } else if (is_string($v) && str_starts_with($v,'bool:')) {
                    $val = (bool)substr($v, 5);
                } else if (is_numeric($v) && is_string($v) && str_contains($v,'.')) {
                    $val = (float)$v;
                } else if (is_numeric($v)) {
                    $val = (int)$v;
                } else if (is_string($v) && $v === '') {
                    continue; // TODO: find solution for empty strings, currently they are just ignored, but maybe they should be passed as empty strings to the js side
                } else {
                    $val = json_encode($v);
                }
            }
            $out[] = $key . ':' . $val;
        }
        return '{' . implode(',', $out) . '}';
    }

}
