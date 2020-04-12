<?php
defined('TYPO3_MODE') || die();

/***************
 * Add Content Element
 */
if (!is_array($GLOBALS['TCA']['tt_content']['types']['ws_slider'])) {
    $GLOBALS['TCA']['tt_content']['types']['ws_slider'] = [];
}

/***************
 * Add content element PageTSConfig
 */
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/ContentElementWizard.tsconfig',
    'Slider Element'
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Flexslider.tsconfig',
    'Flexslider'
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Owl.tsconfig',
    'Owl'
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/BxSlider.tsconfig',
    'bxSlider'
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Tinyslider.tsconfig',
    'Tiny Slider 2'
);

/***************
 * Add content element to selector list
 */
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'tt_content',
    'CType',
    [
        'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:title',
        'ws_slider',
        'content-wsslider'
    ],
    'textmedia',
    'after'
);

/***************
 * Assign Icon
 */
$GLOBALS['TCA']['tt_content']['ctrl']['typeicon_classes']['ws_slider'] = 'content-wsslider';


/***************
 * Configure element type
 */
$GLOBALS['TCA']['tt_content']['types']['ws_slider'] = array_replace_recursive(
    $GLOBALS['TCA']['tt_content']['types']['ws_slider'],
    [
        'showitem' => '
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:general,
                --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.general;general,
                --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.headers;headers,
                tx_wsslider_renderer,
                tx_wsslider_items;LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:items,
            --div--;LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:settings,
                pi_flexform;LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:advanced,
            --div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.appearance,
                --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.frames;frames,
                --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.appearanceLinks;appearanceLinks,
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:language,
                --palette--;;language,
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:access,
                --palette--;;hidden,
                --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.access;access,
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:categories,
                categories,
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:notes,
                rowDescription,
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:extended,
        '
    ]
);


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tt_content', [
    'tx_wsslider_items' => [
        'exclude' => 0,
        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xml:tx_wsslider_domain_model_flexslider.items',
        'config' => [
            'type' => 'inline',
            'foreign_table' => 'tx_wsslider_domain_model_item',
            'foreign_field' => 'content_uid',
            'foreign_label' => 'title',
            'foreign_sortby' => 'sorting',
            'maxitems' => '100',
            'appearance' => [
                #'collapseAll' => 0, // Auskommentieren, da es sonst immer als true interpretiert wird
                'expandSingle' => true,
                'newRecordLinkAddTitle' => 1,
                'newRecordLinkPosition' => 'both',
                'showAllLocalizationLink' => true,
                'showPossibleLocalizationRecords' => true,
            ],
            'behaviour' => [
                'localizationMode' => 'select',
            ],
        ]
    ],
    'tx_wsslider_renderer' => [
        'exclude' => true,
        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xml:renderer',
        'onChange' => 'reload',
        'config' => [
            'type' => 'select',
            'renderType' => 'selectSingleWithTypoScriptDefaultValue',
            'typoscriptPath' => 'plugin.tx_wsslider.settings.default.renderer',
            'eval' => 'null',
            'items' => [
            ],
        ]
    ]
]);


/***************
 * Add flexForms for content element configuration
 */
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue(
    '*',
    'FILE:EXT:ws_slider/Configuration/FlexForm/Settings.xml',
    'ws_slider'
);


