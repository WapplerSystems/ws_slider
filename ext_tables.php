<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

call_user_func(
    function ($extKey) {
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.news_pi1.list',
            'EXT:wsslider/Resources/Private/Language/tiny_csh_flexforms.xlf'
        );


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::allowTableOnStandardPages('tx_wsslider_domain_model_item');


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/flexslider_csh_flexforms.xlf'
        );
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/owl_csh_flexforms.xlf'
        );
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/slick_csh_flexforms.xlf'
        );

        /* add backend css */
        $GLOBALS['TBE_STYLES']['skins']['backend']['stylesheetDirectories'][$extKey] = 'EXT:'.$extKey.'/Resources/Public/CSS/Backend/';


    },
    'ws_slider'
);