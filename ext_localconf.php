<?php

use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use WapplerSystems\WsSlider\Backend\Form\Element\InfoTextElement;
use WapplerSystems\WsSlider\Backend\Form\Element\SelectSingleWithTypoScriptPlaceholderElement;
use WapplerSystems\WsSlider\Backend\Form\Element\InputTextWithTypoScriptPlaceholderElement;
use WapplerSystems\WsSlider\Hooks\DataHandlerHook;

call_user_func(
    function ($extKey) {

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
        $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1704622053] = [
            'nodeName' => 'infoTextRenderType',
            'priority' => 40,
            'class' => InfoTextElement::class,
        ];

    },
    'ws_slider'
);


// Register "wsslider:" namespace
$GLOBALS['TYPO3_CONF_VARS']['SYS']['fluid']['namespaces']['wsslider'][] = 'WapplerSystems\\WsSlider\\ViewHelpers';


$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['t3lib/class.t3lib_tcemain.php']['processDatamapClass'][] = DataHandlerHook::class;
