<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

call_user_func(
    function ($extKey) {


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::allowTableOnStandardPages('tx_wsslider_domain_model_item');
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tx_wsslider_domain_model_item',
            'EXT:ws_slider/Resources/Private/Language/locallang_csh_image.xlf');


    },
    'ws_slider'
);