<?php
if (!defined('TYPO3_MODE')) {
    die ('Access denied.');
}

call_user_func(
    function ($extKey) {


        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::allowTableOnStandardPages('tx_wsslider_domain_model_item');


    },
    'ws_slider'
);