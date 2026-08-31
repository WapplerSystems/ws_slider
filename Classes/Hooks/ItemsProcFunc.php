<?php

namespace WapplerSystems\WsSlider\Hooks;


use TYPO3\CMS\Backend\Utility\BackendUtility as BackendUtilityCore;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use WapplerSystems\WsSlider\Service\TypoScriptService;
use WapplerSystems\WsSlider\Source\SliderSourceRegistry;
use WapplerSystems\WsSlider\Utility\TemplateLayout;

/**
 * Userfunc to render alternative label for media elements
 */
class ItemsProcFunc
{


    public function __construct(readonly private TypoScriptService $typoScriptService,
                                readonly TemplateLayout            $templateLayout,
                                readonly SliderSourceRegistry      $sliderSourceRegistry,
    )
    {
    }

    /**
     * Itemsproc function to extend the selection of templateLayouts in the plugin
     *
     * @param array &$config configuration array
     */
    public function userTemplateLayout(array $config, $pObj): void
    {
        $currentColPos = $config['row']['colPos'] ?? 0;
        $pageId = $this->getPageId($config['row']['pid'] ?? 0);
        if ($pageId <= 0) {
            return;
        }

        $currentRenderer = $config['row']['tx_wsslider_renderer'][0] ?? '';
        $rendererTyposcriptPath = (string)($config['config']['rendererTyposcriptPath'] ?? '');

        if ($currentRenderer === '' && $rendererTyposcriptPath !== '') {
            $typoscript = $this->typoScriptService->getTypoScript($pageId, null, 0, [], $config['site'] ?? null);
            $defaultRenderer = TypoScriptService::getTypoScriptValueByPath($typoscript, $rendererTyposcriptPath);
            if (is_string($defaultRenderer) && $defaultRenderer !== '') {
                $currentRenderer = $defaultRenderer;
            }
        }

        if ($currentRenderer === '') {
            return;
        }

        $templateLayouts = $this->templateLayout->getAvailableTemplateLayouts($pageId);
        $templateLayouts = $this->reduceTemplateLayouts($templateLayouts, $currentColPos, $currentRenderer);

        foreach ($templateLayouts as $layout) {
            $config['items'][] = [
                'label' => $this->getLanguageService()->sL($layout[0]),
                'value' => $layout[1],
            ];
        }
    }

    public function sources(array $config, $pObj): void
    {
        foreach ($this->sliderSourceRegistry->getSources() as $source) {
            $config['items'][] = [
                'label' => $source->getName(),
                'value' => get_class($source),
            ];
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
    protected function reduceTemplateLayouts($templateLayouts, $currentColPos, $currentRenderer): array
    {
        $currentColPos = (int)$currentColPos;
        $restrictions = [];
        $allLayouts = [];
        foreach ($templateLayouts as $key => $layout) {
            if (is_array($layout[0])) {
                if (isset($layout[0]['allowedColPos']) && \str_ends_with($layout[1], '.')) {
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
            if (isset($layout[3]['renderers']) && $currentRenderer !== null && !str_contains($layout[3]['renderers'], $currentRenderer)) {
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
    protected function removeNonValidOrderFields(array &$config, $tableName): void
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
     * @return array|null
     */
    protected function getContentElementRow($uid): ?array
    {
        return BackendUtilityCore::getRecord('tt_content', $uid);
    }

    /**
     * Get page id, if negative, then it is a "after record"
     *
     * @param int $pid
     * @return int
     */
    protected function getPageId($pid): int
    {
        $pid = (int)$pid;

        if ($pid > 0) {
            return $pid;
        }

        if ($pid === 0) {
            return 0;
        }

        // Negative pid means "insert after the content element with this uid".
        // The record may be gone (e.g. while previewing a history/undo diff), so guard the lookup.
        $row = BackendUtilityCore::getRecord('tt_content', abs($pid), 'uid,pid');

        return (int)($row['pid'] ?? 0);
    }


    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

}
