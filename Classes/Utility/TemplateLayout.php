<?php

namespace WapplerSystems\WsSlider\Utility;


use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\SingletonInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * TemplateLayout utility class
 */
class TemplateLayout implements SingletonInterface
{

    /**
     * Get available template layouts for a certain page
     *
     * @param int $pageUid
     * @return array
     */
    public function getAvailableTemplateLayouts($pageUid)
    {
        $templateLayouts = [];

        // Add TsConfig values
        foreach ($this->getTemplateLayoutsFromTsConfig($pageUid) as $template) {
            if (GeneralUtility::isFirstPartOfStr($template[1], '--div--')) {
                $optGroupParts = GeneralUtility::trimExplode(',', $template[1], true, 2);
                $title = $optGroupParts[1];
                $templateKey = $optGroupParts[0];
                $templateLayouts[] = [$title, $templateKey];
            } else {
                $templateLayouts[] = $template;
            }

        }

        return $templateLayouts;
    }

    /**
     * Get template layouts defined in TsConfig
     *
     * @param $pageUid
     * @return array
     */
    protected function getTemplateLayoutsFromTsConfig($pageUid)
    {
        $templateLayouts = [];
        $pagesTsConfig = BackendUtility::getPagesTSconfig($pageUid);
        if (isset($pagesTsConfig['tx_wsslider.']['templateLayouts.']) && is_array($pagesTsConfig['tx_wsslider.']['templateLayouts.'])) {
            $templateLayoutsTemp = $pagesTsConfig['tx_wsslider.']['templateLayouts.'];
            foreach ($templateLayoutsTemp as $name => $value) {
                if (is_string($value)) {
                    $template = [$name, $value];
                    if (isset($templateLayoutsTemp[$name.'.']) && is_array($templateLayoutsTemp[$name.'.'])) {
                        $template[3] = $templateLayoutsTemp[$name.'.'];
                    }
                    $templateLayouts[] = $template;
                }
            }
        }
        return $templateLayouts;
    }
}
