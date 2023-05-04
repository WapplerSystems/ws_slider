<?php


use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/ContentElementWizard.tsconfig',
    'Enable ws_slider in wizard'
);

ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/Bootstrap.tsconfig',
    'Bootstrap'
);
ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/Flexslider.tsconfig',
    'Flexslider'
);
ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/Owl.tsconfig',
    'Owl'
);
/*
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/BxSlider.tsconfig',
    'bxSlider'
);
*/
ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/Slick.tsconfig',
    'Slick'
);
ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/TinySlider.tsconfig',
    'Tiny Slider 2'
);

/* Layouts */

ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Layout/BigNumberDots.tsconfig',
    'Big Number Dots Layout (only OWL)'
);

ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Layout/Cards.tsconfig',
    'Card Layout (only OWL, TinySlider)'
);
