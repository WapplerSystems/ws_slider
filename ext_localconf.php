<?php

use WapplerSystems\WsSlider\Backend\Form\Element\InfoTextElement;
use WapplerSystems\WsSlider\Backend\Form\Element\InputTextWithTypoScriptPlaceholderElement;
use WapplerSystems\WsSlider\Backend\Form\Element\NullableNumberElement;
use WapplerSystems\WsSlider\Backend\Form\Element\SelectSingleWithTypoScriptPlaceholderElement;

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
        $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1772577861] = [
            'nodeName' => 'nullableNumber',
            'priority' => 40,
            'class' => NullableNumberElement::class,
        ];

    },
    'ws_slider'
);


// Register "wsslider:" namespace
$GLOBALS['TYPO3_CONF_VARS']['SYS']['fluid']['namespaces']['wsslider'][] = 'WapplerSystems\\WsSlider\\ViewHelpers';

// Backend CSS
$GLOBALS['TYPO3_CONF_VARS']['BE']['stylesheets']['ws_slider'] = 'EXT:ws_slider/Resources/Public/CSS/Backend/';
