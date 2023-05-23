<?php

use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use WapplerSystems\WsSlider\Backend\Form\Element\SelectSingleWithTypoScriptPlaceholderElement;
use WapplerSystems\WsSlider\Backend\Form\Element\InputTextWithTypoScriptPlaceholderElement;
use WapplerSystems\WsSlider\Updates\WsFlexsliderMigration;

call_user_func(
    function ($extKey) {

        $versionInformation = GeneralUtility::makeInstance(Typo3Version::class);
        // Only include page.tsconfig if TYPO3 version is below 12 so that it is not imported twice.
        // TODO: Drop this when dropping TYPO3 v11 support
        if ($versionInformation->getMajorVersion() < 12) {
            ExtensionManagementUtility::addPageTSConfig('@import "EXT:my_sitepackage/Configuration/page.tsconfig"');
        }

        $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1586633307] = [
            'nodeName' => 'selectSingleWithTypoScriptPlaceholder',
            'priority' => '70',
            'class' => SelectSingleWithTypoScriptPlaceholderElement::class,
        ];
        $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1586633308] = [
            'nodeName' => 'inputWithTypoScriptPlaceholder',
            'priority' => '70',
            'class' => InputTextWithTypoScriptPlaceholderElement::class,
        ];

    },
    'ws_slider'
);
