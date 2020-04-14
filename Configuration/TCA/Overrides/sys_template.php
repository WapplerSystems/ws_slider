<?php
defined('TYPO3_MODE') || die();


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript',
    'WS Slider General Settings');


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Owl/',
'WS Slider Owl Assets');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Flexslider/',
    'WS Slider Flexslider Assets');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/TinySlider/',
    'WS Slider Tiny Slider Assets');


# TypoScript Settings

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Owl/',
    'WS Slider Owl Settings');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Flexslider/',
    'WS Slider Flexslider Settings');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/TinySlider/',
    'WS Slider Tiny Slider Settings');


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
    'Configuration/TsConfig/Page/TinySlider.tsconfig',
    'Tiny Slider 2'
);