<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}


call_user_func(
    function ($extKey) {


        $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS'][\TYPO3\CMS\Core\Configuration\FlexForm\FlexFormTools::class]['flexParsing'][\WapplerSystems\WsSlider\Hooks\FlexFormEnhancerHook::class] = \WapplerSystems\WsSlider\Hooks\FlexFormEnhancerHook::class;


        if (TYPO3_MODE === 'BE') {
            $icons = [
                'content-wsslider' => 'content-wsslider.svg',
            ];
            $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
            foreach ($icons as $identifier => $path) {
                $iconRegistry->registerIcon(
                    $identifier,
                    \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
                    ['source' => 'EXT:' . $extKey . '/Resources/Public/Icons/' . $path]
                );
            }
        }


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:ws_slider/Configuration/TsConfig/Page/General.tsconfig">');


        $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1586633307] = [
            'nodeName' => 'selectSingleWithTypoScriptPlaceholder',
            'priority' => '70',
            'class' => \WapplerSystems\WsSlider\Backend\Form\Element\SelectSingleWithTypoScriptPlaceholderElement::class,
        ];


    },
    'ws_slider'
);

