<?php

return [
    'ctrl' => [
        'title' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item',
        'label' => 'title',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'sortby' => 'sorting',
        // Inline child of the workspace aware tt_content - without this, DataHandler
        // refuses to create the element in a workspace ('Record could not be created
        // in this workspace'). The t3ver_* columns are added by the schema analyzer.
        'versioningWS' => true,
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
        'searchFields' => 'title,description',
        'typeicon_classes' => [
            'default' => 'ext-wsslider-image'
        ],
        'security' => [
            'ignorePageTypeRestriction' => true,
        ]
    ],
    'types' => [
        '1' => [
            'showitem' => 'hidden, title, sys_language_uid, foreground_media, description, text_position, style_class, link, --div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.access,starttime, endtime'
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
                        'label' => '',
                        'value' => 0,
                    ],
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
        'hidden' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.visible',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle',
                'items' => [
                    [
                        'label' => '',
                        'invertStateDisplay' => true,
                    ],
                ],
            ]
        ],
        'starttime' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.starttime',
            'config' => [
                'type' => 'datetime',
                'default' => 0,
            ],
            'l10n_mode' => 'exclude',
            'l10n_display' => 'defaultAsReadonly'
        ],
        'endtime' => [
            'exclude' => true,
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.endtime',
            'config' => [
                'type' => 'datetime',
                'default' => 0,
                'range' => [
                    'upper' => mktime(0, 0, 0, 1, 1, 2038),
                ],
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
        // Rendered as CSS class "caption-align-<value>" on the caption wrapper.
        // Add project specific positions via page TSconfig:
        // TCEFORM.tx_wsslider_domain_model_item.text_position.addItems.center = Center
        'text_position' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.textPosition',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:default',
                        'value' => '',
                    ],
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.textposition_left',
                        'value' => 'left',
                    ],
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.textposition_right',
                        'value' => 'right',
                    ],
                ],
                'default' => '',
            ],
        ],
        // Rendered as a CSS class suffix on the slide ("wsflexslider-<value>" / "carousel-item-<value>").
        // The extension ships no styles for these - they are hooks for project CSS.
        // Add or replace entries via page TSconfig:
        // TCEFORM.tx_wsslider_domain_model_item.style_class.addItems.highlight = Highlight
        'style_class' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.styleClass',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:default',
                        'value' => '',
                    ],
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.styleclass_style1',
                        'value' => 'style1',
                    ],
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.styleclass_style2',
                        'value' => 'style2',
                    ],
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.styleclass_style3',
                        'value' => 'style3',
                    ],
                    [
                        'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.styleclass_style4',
                        'value' => 'style4',
                    ],
                ],
                'default' => '',
            ],
        ],
        'link' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.link',
            'config' => [
                'type' => 'link',
            ],
        ],
        'foreground_media' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_item.foregroundMedia',
            'config' => [
                'type' => 'file',
                'allowed' => 'common-image-types',
                'minitems' => 0,
                'maxitems' => 1,
                'appearance' => [
                    'showAllLocalizationLink' => true,
                    'headerThumbnail' => [
                        'height' => '90c',
                        'width' => 90
                    ]
                ],
                'overrideChildTca' => [
                    'columns' => [
                        'crop' => [
                            'config' => [
                                'cropVariants' => [
                                    'default' => [
                                        'title' => 'LLL:EXT:core/Resources/Private/Language/locallang_wizards.xlf:imwizard.crop_variant.default',
                                        'allowedAspectRatios' => [
                                            'NaN' => [
                                                'title' => 'LLL:EXT:core/Resources/Private/Language/locallang_wizards.xlf:imwizard.ratio.free',
                                                'value' => 0
                                            ],
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
                                        'selectedRatio' => 'NaN',
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

