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

        $renderer = $configuration['renderer'] ?? 'Default';
        $xlfFilename = strtolower($renderer);
        $parameters = $configuration['parameters'] ?? [];

        return LocalizationUtility::translate('LLL:EXT:ws_slider/Resources/Private/Language/' . $xlfFilename . '.xlf:settings.' . $parameterName) ?? $parameters[$parameterName] ?? null;
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
            $val = is_array($v) ? $this->js_encode($v) : json_encode($v);
            $out[] = $key . ':' . $val;
        }
        return '{' . implode(',', $out) . '}';
    }

}
