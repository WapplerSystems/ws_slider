<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

call_user_func(
    function ($extKey) {


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::allowTableOnStandardPages('tx_wsslider_domain_model_item');


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/flexslider_csh_flexforms.xlf'
        );
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/owl_csh_flexforms.xlf'
        );

    },
    'ws_slider'
);