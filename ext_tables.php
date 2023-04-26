<?php
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
if (!defined('TYPO3')) {
    die ('Access denied.');
}

call_user_func(
    function ($extKey) {


        ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/flexslider_csh_flexforms.xlf'
        );
        ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/owl_csh_flexforms.xlf'
        );
        ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/slick_csh_flexforms.xlf'
        );
        ExtensionManagementUtility::addLLrefForTCAdescr(
            'tt_content.pi_flexform.ws_slider',
            'EXT:ws_slider/Resources/Private/Language/tinyslider_csh_flexforms.xlf'
        );

        /* add backend css */
        $GLOBALS['TBE_STYLES']['skins']['backend']['stylesheetDirectories'][$extKey] = 'EXT:'.$extKey.'/Resources/Public/CSS/Backend/';


    },
    'ws_slider'
);
