<?php

namespace WapplerSystems\WsSlider\Hooks;


use TYPO3\CMS\Backend\Utility\BackendUtility as BackendUtilityCore;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use WapplerSystems\WsSlider\Service\TypoScriptService;
use WapplerSystems\WsSlider\Source\SliderSourceRegistry;
use WapplerSystems\WsSlider\Utility\TemplateLayout;

/**
 */
class DisplayCondition
{


    public function __construct(readonly SliderSourceRegistry $sliderSourceRegistry,
    )
    {
    }


    public function displaySources(): bool
    {
        return $this->sliderSourceRegistry->hasSources();
    }


}
