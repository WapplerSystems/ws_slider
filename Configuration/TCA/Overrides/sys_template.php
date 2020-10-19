<?php
defined('TYPO3_MODE') || die();


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript',
    'WS Slider General Settings');

/* Assets */

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Owl/',
'WS Slider Owl Assets');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Flexslider/',
    'WS Slider Flexslider Assets');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/TinySlider/',
    'WS Slider Tiny Slider Assets');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Slick/',
    'WS Slider Slick Slider Assets');


# TypoScript Settings

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Owl/',
    'WS Slider Owl Settings');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Flexslider/',
    'WS Slider Flexslider Settings');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/TinySlider/',
    'WS Slider Tiny Slider Settings');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Slick/',
    'WS Slider Slick Slider Settings');
