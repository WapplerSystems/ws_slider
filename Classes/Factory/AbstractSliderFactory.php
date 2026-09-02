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

    /**
     * Resolves a single option. A value configured via TypoScript or FlexForm always wins;
     * only when nothing is configured the localized default from the renderer's XLF file is used.
     *
     * $parameterName may be a dotted path ("a11y.prevSlideMessage") which is looked up both as a
     * literal key and as a nested path inside $configuration.
     */
    protected function getParameter(array $configuration, string $parameterName): ?string
    {
        $configured = $this->lookupOption($configuration, $parameterName);
        if (is_scalar($configured) && trim((string)$configured) !== '') {
            return (string)$configured;
        }

        return LocalizationUtility::translate(
            'LLL:EXT:ws_slider/Resources/Private/Language/' . $this->getRendererKey() . '.xlf:options.' . $parameterName
        );
    }

    /**
     * Lowercase renderer key ("swiper", "flexslider", ...) derived from the factory class name.
     */
    protected function getRendererKey(): string
    {
        $shortName = substr(strrchr(static::class, '\\') ?: '\\' . static::class, 1);

        return strtolower(substr($shortName, 0, -strlen('Factory')));
    }

    /**
     * @return mixed The value behind a literal or dotted key, or null
     */
    protected function lookupOption(array $configuration, string $path): mixed
    {
        if (array_key_exists($path, $configuration)) {
            return $configuration[$path];
        }

        $current = $configuration;
        foreach (explode('.', $path) as $segment) {
            if (!is_array($current) || !array_key_exists($segment, $current)) {
                return null;
            }
            $current = $current[$segment];
        }

        return $current;
    }

    protected function mergeOptions(array $options)
    {
        return array_merge($this->defaultOptions, $options);
    }

    protected function js_encode($array)
    {
        // A PHP list must be rendered as a JS array, not as an object.
        $isList = array_is_list($array);

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
            $out[] = $isList ? (string)$val : $key . ':' . $val;
        }
        return $isList ? '[' . implode(',', $out) . ']' : '{' . implode(',', $out) . '}';
    }

}
