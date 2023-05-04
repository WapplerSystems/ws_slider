<?php
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Resource\File;

return [
    'ctrl' => [
        'title'	=> 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item',
        'label' => 'title',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'cruser_id' => 'cruser_id',
        'sortby' => 'sorting',
        'origUid' => 't3_origuid',
        'languageField' => 'sys_language_uid',
        'transOrigPointerField' => 'l10n_parent',
        'transOrigDiffSourceField' => 'l10n_diffsource',
        'delete' => 'deleted',
        'enablecolumns' => [
            'disabled' => 'hidden',
            'starttime' => 'starttime',
            'endtime' => 'endtime',
        ],
        'searchFields' => 'title,description,',
        'typeicon_classes' => [
            'default' => 'ext-wsslider-image'
        ],
        'security' => [
            'ignorePageTypeRestriction' => true,
        ]
    ],
    'interface' => [
    ],
    'types' => [
        '1' => [
            'showitem' => 'hidden, title, sys_language_uid, foreground_media,
				description,
				text_position, style_class, link,

				--div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.access,starttime, endtime'
        ],
    ],
    'palettes' => [
        '1' => ['showitem' => ''],
    ],
    'columns' => [
        'sys_language_uid' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.language',
            'config' => ['type' => 'language']
        ],
        'l10n_parent' => [
            'displayCond' => 'FIELD:sys_language_uid:>:0',
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.l18n_parent',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    [
                        '',
                        0
                    ]
                ],
                'foreign_table' => 'tx_wsslider_domain_model_item',
                'foreign_table_where' => 'AND tx_wsslider_domain_model_item.pid=###CURRENT_PID### AND tx_wsslider_domain_model_item.sys_language_uid IN (-1,0)',
                'default' => 0
            ]
        ],
        'l10n_diffsource' => [
            'config' => [
                'type' => 'passthrough',
            ],
        ],
        't3ver_label' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.versionLabel',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'max' => 255,
            ]
        ],
        'hidden' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.visible',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle',
                'items' => [
                    [
                        0 => '',
                        1 => '',
                        'invertStateDisplay' => true
                    ]
                ],
            ]
        ],
        'starttime' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.starttime',
            'config' => [
                'type' => 'input',
                'renderType' => 'inputDateTime',
                'eval' => 'datetime,int',
                'default' => 0
            ],
            'l10n_mode' => 'exclude',
            'l10n_display' => 'defaultAsReadonly'
        ],
        'endtime' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.endtime',
            'config' => [
                'type' => 'input',
                'renderType' => 'inputDateTime',
                'eval' => 'datetime,int',
                'default' => 0,
                'range' => [
                    'upper' => mktime(0, 0, 0, 1, 1, 2038)
                ]
            ],
            'l10n_mode' => 'exclude',
            'l10n_display' => 'defaultAsReadonly'
        ],
        'title' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:header',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'description' => [
            'l10n_mode' => 'prefixLangTitle',
            'l10n_cat' => 'text',
            'exclude' => 0,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.text',
            'config' => [
                'type' => 'text',
                'cols' => 40,
                'rows' => 6,
                'enableRichtext' => true,
            ],
        ],
        'text_position' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.textPosition',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    [
                        'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:default',
                        ''
                    ]
                ],
            ],
        ],
        'style_class' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.styleClass',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [

                ],
            ],
        ],
        'link' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.link',
            'config' => [
                'type' => 'input',
                'renderType' => 'inputLink',
            ],
        ],
        'foreground_media' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.foregroundMedia',
            'config' => ExtensionManagementUtility::getFileFieldTCAConfig(
                'foreground_media',
                [
                    'minitems' => 0,
                    'maxitems' => 1,
                    'appearance' => [
                        'createNewRelationLinkTitle' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:addImage',
                        'showAllLocalizationLink' => true,
                        'headerThumbnail' => [
                            'height' => '90c',
                            'width' => 90
                        ]
                    ],
                    'foreign_match_fields' => [
                        'fieldname' => 'foreground_media',
                        'tablenames' => 'tx_wsslider_domain_model_item',
                        'table_local' => 'sys_file',
                    ],
                    'overrideChildTca' => [
                        'types' => [
                            File::FILETYPE_IMAGE => [
                                'showitem' => '
                                    --palette--;;imageoverlayPalette,
                                    --palette--;;filePalette'
                            ], '0' => [
                                'showitem' => '
                                --palette--;LLL:EXT:core/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette,
                                --palette--;;imageoverlayPalette,
                                --palette--;;filePalette'
                            ], File::FILETYPE_IMAGE => [
                                'showitem' => '
                                --palette--;LLL:EXT:core/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette,
                                --palette--;;imageoverlayPalette,
                                --palette--;;filePalette'
                            ],
                        ],
                        'columns' => [
                            'crop' => [
                                'config' => [
                                    'cropVariants' => [
                                        'default' => [
                                            'title' => 'LLL:EXT:core/Resources/Private/Language/locallang_wizards.xlf:imwizard.crop_variant.default',
                                            'allowedAspectRatios' => [
                                                '16:9' => [
                                                    'title' => 'LLL:EXT:core/Resources/Private/Language/locallang_wizards.xlf:imwizard.ratio.16_9',
                                                    'value' => 16 / 9
                                                ],
                                                '3:2' => [
                                                    'title' => 'LLL:EXT:core/Resources/Private/Language/locallang_wizards.xlf:imwizard.ratio.3_2',
                                                    'value' => 3 / 2
                                                ],
                                                '4:3' => [
                                                    'title' => 'LLL:EXT:core/Resources/Private/Language/locallang_wizards.xlf:imwizard.ratio.4_3',
                                                    'value' => 4 / 3
                                                ],
                                            ],
                                            'selectedRatio' => '16:9',
                                            'cropArea' => [
                                                'x' => 0.0,
                                                'y' => 0.0,
                                                'width' => 1.0,
                                                'height' => 1.0,
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'gif,jpg,jpeg,png,svg'
            )

        ],
        'content_uid' => [
            'label' => 'CC',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'foreign_table' => 'tt_content',
                //'foreign_table_where' => ...,
                'size' => 1,
                'minitems' => 0,
                'maxitems' => 1,
            ],
        ],
    ],
];

