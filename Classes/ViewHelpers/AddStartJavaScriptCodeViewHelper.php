<?php

namespace WapplerSystems\WsSlider\ViewHelpers;


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
     * @var \TYPO3\CMS\Core\Page\PageRenderer
     */
    protected $pageRenderer;

    /**
     * @var \TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface
     */
    protected $configurationManager;

    /**
     * @param \TYPO3\CMS\Core\Page\PageRenderer $pageRenderer
     */
    public function injectPageRenderer(\TYPO3\CMS\Core\Page\PageRenderer $pageRenderer)
    {
        $this->pageRenderer = $pageRenderer;
    }

    /**
     * @param \TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface $configurationManager
     * @return void
     */
    public function injectConfigurationManager(\TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface $configurationManager)
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

        $block = [];
        if ($this->arguments['variableName'] !== null) {
            $block[] = 'var ' . str_replace('-', '', $this->arguments['variableName']) . ';';
        }

        if ($this->arguments['useJQuery']) {
            $block[] = 'jQuery(document).ready(function() {';
            if ($this->arguments['variableName'] !== null) {
                $block[] = str_replace('-', '', $this->arguments['variableName']) . ' = ';
            }
            $block[] = 'jQuery("' . $this->arguments['selector'] . '").' . $this->arguments['functionName'] . '(' . json_encode($parameters) . ');';
            $block[] = '});';
        } else {
            if ($this->arguments['variableName'] !== null) {
                $block[] = str_replace('-', '', $this->arguments['variableName']) . ' = ';
            }
            $block[] = $this->arguments['functionName'] . '(';
            $block[] = json_encode($parameters);
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

}
