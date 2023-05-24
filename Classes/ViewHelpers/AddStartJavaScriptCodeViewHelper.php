<?php

namespace WapplerSystems\WsSlider\ViewHelpers;


use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractTagBasedViewHelper;

/**
 *
 * A view helper for adding inline JS Code
 *
 * @author Sven Wappler <typo3YYYY@wapplersystems.de>
 */
class AddStartJavaScriptCodeViewHelper extends AbstractTagBasedViewHelper
{


    /**
     * Initialize
     */
    public function initializeArguments()
    {
        $this->registerArgument('variableName', 'string', '', false);
        $this->registerArgument('functionName', 'string', '', true);
        $this->registerArgument('defaultParameters', 'array', '', false, []);
        $this->registerArgument('useJQuery', 'boolean', '', false, false);
        $this->registerArgument('selector', 'string', '', false, '');
        $this->registerArgument('overrideParameters', 'array', '', false, []);
        $this->registerArgument('name', 'string', 'Name argument - see PageRenderer documentation', true);
        $this->registerArgument('compress', 'boolean', 'Compress argument - see PageRenderer documentation', false, true);
        $this->registerArgument('forceOnTop', 'boolean', 'ForceOnTop argument - see PageRenderer documentation', false, false);
    }

    /**
     * @var PageRenderer
     */
    protected $pageRenderer;

    /**
     * @var ConfigurationManagerInterface
     */
    protected $configurationManager;

    /**
     * @param PageRenderer $pageRenderer
     */
    public function injectPageRenderer(PageRenderer $pageRenderer)
    {
        $this->pageRenderer = $pageRenderer;
    }

    /**
     * @param ConfigurationManagerInterface $configurationManager
     * @return void
     */
    public function injectConfigurationManager(ConfigurationManagerInterface $configurationManager)
    {
        $this->configurationManager = $configurationManager;
    }


    /**
     * Returns TRUE if what we are outputting may be cached
     *
     * @return boolean
     */
    protected function isCached()
    {
        $userObjType = $this->configurationManager->getContentObject()->getUserObjectType();
        return ($userObjType !== ContentObjectRenderer::OBJECTTYPE_USER_INT);
    }


    /**
     * Render
     *
     * @param string $block
     */
    public function render()
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
            $block[] = $this->arguments['functionName'] . '(';
            $block[] = json_encode($parameters, JSON_THROW_ON_ERROR);
            $block[] = ')';
        }

        $html = implode('', $block);

        if ($this->isCached()) {
            $this->pageRenderer->addJsFooterInlineCode(
                $this->arguments['name'],
                $html,
                $this->arguments['compress'],
                $this->arguments['forceOnTop']
            );
        } else {
            // additionalFooterData not possible in USER_INT
            $GLOBALS['TSFE']->additionalFooterData[md5($this->arguments['name'])] = GeneralUtility::wrapJS($html);
        }
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
