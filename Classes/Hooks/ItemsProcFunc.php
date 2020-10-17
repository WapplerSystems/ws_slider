<?php

namespace WapplerSystems\WsSlider\Hooks;


use TYPO3\CMS\Backend\Utility\BackendUtility as BackendUtilityCore;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use WapplerSystems\WsSlider\Utility\TemplateLayout;

/**
 * Userfunc to render alternative label for media elements
 */
class ItemsProcFunc
{

    /** @var TemplateLayout $templateLayoutsUtility */
    protected $templateLayoutsUtility;

    public function __construct()
    {
        $this->templateLayoutsUtility = GeneralUtility::makeInstance(TemplateLayout::class);
    }

    /**
     * Itemsproc function to extend the selection of templateLayouts in the plugin
     *
     * @param array &$config configuration array
     */
    public function userTemplateLayout(array $config, $pObj)
    {
        $currentColPos = $config['row']['colPos'];
        $pageId = $this->getPageId($config['row']['pid']);
        $currentRenderer = $config['row']['tx_wsslider_renderer'][0] ?? '';
        $rendererTyposcriptPath = $config['config']['rendererTyposcriptPath'];
        $defaultRenderer = $this->getTypoScriptValue($rendererTyposcriptPath);
        if ($currentRenderer === '' && $defaultRenderer !== '') $currentRenderer = $defaultRenderer;

        if ($currentRenderer === '') return;

        if ($pageId > 0) {
            $templateLayouts = $this->templateLayoutsUtility->getAvailableTemplateLayouts($pageId);

            $templateLayouts = $this->reduceTemplateLayouts($templateLayouts, $currentColPos, $currentRenderer);
            foreach ($templateLayouts as $layout) {
                $additionalLayout = [
                    self::getLanguageService()->sL($layout[0]),
                    $layout[1]
                ];
                array_push($config['items'], $additionalLayout);
            }
        }
    }

    /**
     * Reduce the template layouts by the ones that are not allowed in given colPos and renderer
     *
     * @param array $templateLayouts
     * @param int $currentColPos
     * @param string $currentRenderer
     * @return array
     */
    protected function reduceTemplateLayouts($templateLayouts, $currentColPos, $currentRenderer)
    {
        $currentColPos = (int)$currentColPos;
        $restrictions = [];
        $allLayouts = [];
        foreach ($templateLayouts as $key => $layout) {
            if (is_array($layout[0])) {
                if (isset($layout[0]['allowedColPos']) && StringUtility::endsWith($layout[1], '.')) {
                    $layoutKey = substr($layout[1], 0, -1);
                    $restrictions[$layoutKey] = GeneralUtility::intExplode(',', $layout[0]['allowedColPos'], true);
                }
            } else {
                $allLayouts[$key] = $layout;
            }
        }
        if (!empty($restrictions)) {
            foreach ($restrictions as $restrictedIdentifier => $restrictedColPosList) {
                if (!in_array($currentColPos, $restrictedColPosList, true)) {
                    unset($allLayouts[$restrictedIdentifier]);
                }
            }
        }
        /* renderer check */
        foreach ($templateLayouts as $key => $layout) {
            if (isset($layout[3]['renderers']) && strpos($layout[3]['renderers'], $currentRenderer) === false) {
                unset($allLayouts[$key]);
            }
        }


        return $allLayouts;
    }



    /**
     * Remove not valid fields from ordering
     *
     * @param array $config tca items
     * @param string $tableName table name
     */
    protected function removeNonValidOrderFields(array &$config, $tableName)
    {
        $allowedFields = array_keys($GLOBALS['TCA'][$tableName]['columns']);

        foreach ($config['items'] as $key => $item) {
            if ($item[1] != '' && !in_array($item[1], $allowedFields)) {
                unset($config['items'][$key]);
            }
        }
    }


    /**
     * Get tt_content record
     *
     * @param int $uid
     * @return array
     */
    protected function getContentElementRow($uid)
    {
        return BackendUtilityCore::getRecord('tt_content', $uid);
    }

    /**
     * Get page id, if negative, then it is a "after record"
     *
     * @param int $pid
     * @return int
     */
    protected function getPageId($pid)
    {
        $pid = (int)$pid;

        if ($pid > 0) {
            return $pid;
        }

        $row = BackendUtilityCore::getRecord('tt_content', abs($pid), 'uid,pid');
        return $row['pid'];
    }


    private function getTypoScriptValue($path)
    {

        $tsArray = GeneralUtility::makeInstance(ObjectManager::class)
            ->get(ConfigurationManagerInterface::class)
            ->getConfiguration(
                ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT
            );

        $segments = GeneralUtility::trimExplode('.',$path);

        $lastSegment = array_pop($segments);
        foreach ($segments as $segment) {
            if (isset($tsArray[$segment.'.'])) {
                $tsArray = $tsArray[$segment.'.'];
            } else {
                return null;
            }
        }
        if (isset($tsArray[$lastSegment])) return $tsArray[$lastSegment];

        return null;
    }


    /**
     * @return \TYPO3\CMS\Core\Localization\LanguageService
     */
    protected static function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

}
