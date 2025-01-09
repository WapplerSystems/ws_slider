<?php

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;


ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript',
    'WS Slider General Settings');


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
