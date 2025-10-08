<?php

namespace WapplerSystems\WsSlider\ViewHelpers;


use TYPO3\CMS\Core\Page\AssetCollector;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractTagBasedViewHelper;

/**
 *
 * A view helper for adding inline JS Code
 *
 * @author Sven Wappler <typo3YYYY@wapplersystems.de>
 */
class AddStartJavaScriptCodeViewHelper extends AbstractTagBasedViewHelper
{

    public function __construct(
        protected AssetCollector $assetCollector
    ) {
        parent::__construct();
    }

    /**
     * Initialize
     */
    public function initializeArguments()
    {
        $this->registerArgument('variableName', 'string', '', false);
        $this->registerArgument('functionName', 'string', '', true);
        $this->registerArgument('defaultParameters', 'array', '', false, []);
        $this->registerArgument('useJQuery', 'boolean', '', false, false);
        $this->registerArgument('useNewOperator', 'boolean', '', false, false);
        $this->registerArgument('selectorAsFirstParameter', 'boolean', '', false, false);
        $this->registerArgument('selector', 'string', '', false, '');
        $this->registerArgument('overrideParameters', 'array', '', false, []);
        $this->registerArgument('name', 'string', 'Name argument - see PageRenderer documentation', true);
    }

    /**
     * Render
     *
     * @return string
     * @throws \JsonException
     */
    public function render() : string
    {

        $parameters = $this->arguments['defaultParameters'];
        if (!is_array($parameters)) {
            $parameters = [];
        }
        if (is_array($this->arguments['overrideParameters'])) {
            ArrayUtility::mergeRecursiveWithOverrule($parameters, $this->arguments['overrideParameters'], true, false);
        }

        $parameters = $this->prepareParameters($parameters);

        $block = [];
        if ($this->arguments['variableName'] !== null) {
            $block[] = 'var ' . str_replace('-', '', $this->arguments['variableName']) . ';';
        }

        if ($this->arguments['useJQuery']) {
            $block[] = 'jQuery(document).ready(function() {';
            if ($this->arguments['variableName'] !== null) {
                $block[] = str_replace('-', '', $this->arguments['variableName']) . ' = ';
            }
            $block[] = 'jQuery("' . $this->arguments['selector'] . '").' . $this->arguments['functionName'] . '(' . json_encode($parameters, JSON_THROW_ON_ERROR) . ');';
            $block[] = '});';
        } else {
            if ($this->arguments['variableName'] !== null) {
                $block[] = str_replace('-', '', $this->arguments['variableName']) . ' = ';
            }
            if ($this->arguments['useNewOperator']) {
                $block[] = 'new ';
            }
            $block[] = $this->arguments['functionName'] . '(';
            if ($this->arguments['selectorAsFirstParameter']) {
                $block[] = '"' .$this->arguments['selector'] . '",';
            }
            $block[] = json_encode($parameters, JSON_THROW_ON_ERROR);
            $block[] = ')';
        }

        $html = implode('', $block);

        $this->assetCollector->addInlineJavaScript($this->arguments['name'], $html);

        return '';
    }


    private function prepareParameters($parameters)
    {
        $a = [];
        $removeKeys = (($parameters['_removeArrayKeys'] ?? false) && $parameters['_removeArrayKeys'] === True);
        unset($parameters['_removeArrayKeys']);
        foreach ($parameters as $key => $param) {
            if (is_array($param)) {
                $param = $this->prepareParameters($param);
            }
            if ($removeKeys) {
                $a[] = $this->clearParameter($param);
            } else {
                $a[$key] = $this->clearParameter($param);
            }
        }

        return $a;
    }

    private function clearParameter($param) : mixed {
        return match ($param) {
            'FALSE', 'false' => false,
            'TRUE', 'true' => true,
            default => $param,
        };
    }

}
