<?php

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') || die();


ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript',
    'WS Slider General Settings');

/* Assets */

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Owl/',
'WS Slider Owl Assets');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Flexslider/',
    'WS Slider Flexslider Assets');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/TinySlider/',
    'WS Slider Tiny Slider Assets');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Assets/Slick/',
    'WS Slider Slick Slider Assets');


# TypoScript Settings

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Bootstrap/',
    'WS Slider Bootstrap Settings');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Owl/',
    'WS Slider Owl Settings');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Flexslider/',
    'WS Slider Flexslider Settings');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/TinySlider/',
    'WS Slider Tiny Slider Settings');

ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Renderer/Slick/',
    'WS Slider Slick Slider Settings');
