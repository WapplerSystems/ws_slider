<?php

return [
    'ctrl' => [
        'title' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset',
        'label' => 'name',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'origUid' => 't3_origuid',
        'delete' => 'deleted',
        'type' => 'type',
        'typeicon_column' => 'type',
        'typeicon_classes' => [
            'bootstrap' => 'ext-wsslider-preset-type-bootstrap',
            'flexslider' => 'ext-wsslider-preset-type-flexslider',
            'owl' => 'ext-wsslider-preset-type-owl',
            'slick' => 'ext-wsslider-preset-type-slick',
            'tinyslider' => 'ext-wsslider-preset-type-tinyslider',
        ],
        'useColumnsForDefaultValues' => 'type',
        'enablecolumns' => [
        ],
        'searchFields' => 'name',
        'security' => [
            'ignorePageTypeRestriction' => true,
        ]
    ],
    'interface' => [
    ],
    'types' => [
        '0' => [
            'showitem' => '--palette--;;paletteCore,'
        ],
        'flexslider' => [
            'showitem' => '--div--;LLL:EXT:ws_slider/Resources/Private/Language/flexslider.xlf:sheet.flexslider,--palette--;;paletteCore,flexslider'
        ],
        'bootstrap' => [
            'showitem' => '--div--;LLL:EXT:ws_slider/Resources/Private/Language/flexslider.xlf:sheet.bootstrap,--palette--;;paletteCore,bootstrap'
        ],
        'owl' => [
            'showitem' => '--div--;LLL:EXT:ws_slider/Resources/Private/Language/flexslider.xlf:sheet.owl,--palette--;;paletteCore,owl'
        ],
        'slick' => [
            'showitem' => '--div--;LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:sheet.slick,--palette--;;paletteCore,slick'
        ],
        'tinyslider' => [
            'showitem' => '--div--;LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:sheet.slick,--palette--;;paletteCore,tinyslider'
        ],
    ],
    'palettes' => [
        'paletteCore' => ['showitem' => 'name, --linebreak--, type'],
    ],
    'columns' => [
        't3ver_label' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.versionLabel',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'max' => 255,
            ]
        ],
        'name' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.name',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim',
                'required' => true,
            ],
        ],
        'type' => [
            'exclude' => false,
            'l10n_display' => 'defaultAsReadonly',
            'l10n_mode' => 'exclude',
            'label' => 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.type',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    ['LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.type.bootstrap', 'bootstrap', 'ext-wsslider-preset-type-bootstrap'],
                    ['LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.type.flexslider', 'flexslider', 'ext-wsslider-preset-type-flexslider'],
                    ['LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.type.owl', 'owl', 'ext-wsslider-preset-type-owl'],
                    ['LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.type.slick', 'slick', 'ext-wsslider-preset-type-slick'],
                    ['LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:tx_wsslider_domain_model_preset.type.tinyslider', 'tinyslider', 'ext-wsslider-preset-type-tinyslider'],
                ],
                'showIconTable' => true,
                'size' => 1,
                'maxitems' => 1,
            ]
        ],

        'flexslider' => [
            'exclude' => 1,
            'label' => '',
            'config' => [
                'type' => 'flex',
                'ds' => [
                    'default' => 'FILE:EXT:ws_slider/Configuration/FlexForm/Renderer/Flexslider.xml',
                ],
            ],
        ],
        'bootstrap' => [
            'exclude' => 1,
            'label' => '',
            'config' => [
                'type' => 'flex',
                'ds' => [
                    'default' => 'FILE:EXT:ws_slider/Configuration/FlexForm/Renderer/Bootstrap.xml',
                ],
            ],
        ],
        'owl' => [
            'exclude' => 1,
            'label' => '',
            'config' => [
                'type' => 'flex',
                'ds' => [
                    'default' => 'FILE:EXT:ws_slider/Configuration/FlexForm/Renderer/Owl.xml',
                ],
            ],
        ],
        'slick' => [
            'exclude' => 1,
            'label' => '',
            'config' => [
                'type' => 'flex',
                'ds' => [
                    'default' => 'FILE:EXT:ws_slider/Configuration/FlexForm/Renderer/Slick.xml',
                ],
            ],
        ],
        'tinyslider' => [
            'exclude' => 1,
            'label' => '',
            'config' => [
                'type' => 'flex',
                'ds' => [
                    'default' => 'FILE:EXT:ws_slider/Configuration/FlexForm/Renderer/Tinyslider.xml',
                ],
            ],
        ],


    ],
];

