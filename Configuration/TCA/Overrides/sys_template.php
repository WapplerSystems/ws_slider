<?php
defined('TYPO3_MODE') || die();


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript',
    'WS Slider General Settings');


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Owl/',
'WS Slider Owl Assets');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile('ws_slider', 'Configuration/TypoScript/Flexslider/',
    'WS Slider Flexslider Assets');