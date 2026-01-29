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
    'Configuration/TsConfig/Page/Renderer/Slick.tsconfig',
    'Slick'
);
ExtensionManagementUtility::registerPageTSConfigFile(
    'ws_slider',
    'Configuration/TsConfig/Page/Renderer/TinySlider.tsconfig',
    'Tiny Slider 2'
);

/* Layouts */

