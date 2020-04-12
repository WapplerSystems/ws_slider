<?php
namespace WapplerSystems\WsSlider\Backend\Form\Element;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use TYPO3\CMS\Backend\Form\Element\AbstractFormElement;
use TYPO3\CMS\Backend\Form\InlineStackProcessor;
use TYPO3\CMS\Backend\Form\Utility\FormEngineUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;

/**
 * Creates a widget where only one item can be selected.
 * This is either a select drop-down if no size config is given or set to 1, or a select box.
 *
 * This is rendered for type=select, renderType=selectSingle
 */
class SelectSingleWithTypoScriptDefaultValueElement extends AbstractFormElement
{
    /**
     * Default field information enabled for this element.
     *
     * @var array
     */
    protected $defaultFieldInformation = [
        'tcaDescription' => [
            'renderType' => 'tcaDescription',
        ],
    ];

    /**
     * Default field wizards enabled for this element.
     *
     * @var array
     */
    protected $defaultFieldWizard = [
        'selectIcons' => [
            'renderType' => 'selectIcons',
            'disabled' => true,
        ],
        'localizationStateSelector' => [
            'renderType' => 'localizationStateSelector',
            'after' => [
                'selectIcons',
            ],
        ],
        'otherLanguageContent' => [
            'renderType' => 'otherLanguageContent',
            'after' => [ 'localizationStateSelector' ],
        ],
        'defaultLanguageDifferences' => [
            'renderType' => 'defaultLanguageDifferences',
            'after' => [ 'otherLanguageContent' ],
        ],
    ];

    /**
     * Render single element
     *
     * @return array As defined in initializeResultArray() of AbstractNode
     */
    public function render()
    {
        $resultArray = $this->initializeResultArray();
        $languageService = $this->getLanguageService();

        $table = $this->data['tableName'];
        $field = $this->data['fieldName'];
        $row = $this->data['databaseRow'];
        $parameterArray = $this->data['parameterArray'];
        $config = $parameterArray['fieldConf']['config'];

        $selectItems = $parameterArray['fieldConf']['config']['items'];

        # fix for flexform
        $nullControlNameEscaped = 'control[active]' . substr($parameterArray['itemFormElName'],4);

        // Check against inline uniqueness
        /** @var InlineStackProcessor $inlineStackProcessor */
        $inlineStackProcessor = GeneralUtility::makeInstance(InlineStackProcessor::class);
        $inlineStackProcessor->initializeByGivenStructure($this->data['inlineStructure']);
        $uniqueIds = null;
        if ($this->data['isInlineChild'] && $this->data['inlineParentUid']) {
            // @todo: At least parts of this if is dead and/or broken: $uniqueIds is filled but never used.
            // See InlineControlContainer where 'inlineData' 'unique' 'used' is set. What exactly is
            // this if supposed to do and when should it kick in and what for?
            $inlineObjectName = $inlineStackProcessor->getCurrentStructureDomObjectIdPrefix($this->data['inlineFirstPid']);
            $inlineFormName = $inlineStackProcessor->getCurrentStructureFormPrefix();
            if ($this->data['inlineParentConfig']['foreign_table'] === $table
                && $this->data['inlineParentConfig']['foreign_unique'] === $field
            ) {
                $uniqueIds = $this->data['inlineData']['unique'][$inlineObjectName . '-' . $table]['used'];
                $parameterArray['fieldChangeFunc']['inlineUnique'] = 'inline.updateUnique(this,'
                    . GeneralUtility::quoteJSvalue($inlineObjectName . '-' . $table) . ','
                    . GeneralUtility::quoteJSvalue($inlineFormName) . ','
                    . GeneralUtility::quoteJSvalue($row['uid']) . ');';
            }
            // hide uid of parent record for symmetric relations
            if ($this->data['inlineParentConfig']['foreign_table'] === $table
                && (
                    $this->data['inlineParentConfig']['foreign_field'] === $field
                    || $this->data['inlineParentConfig']['symmetric_field'] === $field
                )
            ) {
                $uniqueIds[] = $this->data['inlineParentUid'];
            }
        }

        // Initialization:
        $selectId = StringUtility::getUniqueId('tceforms-select-');
        $selectedIcon = '';
        $size = (int)$config['size'];

        // Style set on <select/>
        $options = '';
        $disabled = false;
        if (!empty($config['readOnly'])) {
            $disabled = true;
        }

        // Prepare groups
        $selectItemCounter = 0;
        $selectItemGroupCount = 0;
        $selectItemGroups = [];
        $selectedValue = null;
        $hasIcons = false;

        if (!empty($parameterArray['itemFormElValue'])) {
            $selectedValue = (string)$parameterArray['itemFormElValue'][0];
        }


        foreach ($selectItems as $item) {
            if ($item[1] === '--div--') {
                // IS OPTGROUP
                if ($selectItemCounter !== 0) {
                    $selectItemGroupCount++;
                }
                $selectItemGroups[$selectItemGroupCount]['header'] = [
                    'title' => $item[0],
                ];
            } else {
                // IS ITEM
                $icon = !empty($item[2]) ? FormEngineUtility::getIconHtml($item[2], $item[0], $item[0]) : '';
                $selected = $selectedValue === (string)$item[1];

                if ($selected) {
                    $selectedIcon = $icon;
                }

                $selectItemGroups[$selectItemGroupCount]['items'][] = [
                    'title' => $this->appendValueToLabelInDebugMode($item[0], $item[1]),
                    'value' => $item[1],
                    'icon' => $icon,
                    'selected' => $selected,
                ];
                $selectItemCounter++;
            }
        }

        // Fallback icon
        // @todo: assign a special icon for non matching values?
        if (!$selectedIcon && $selectItemGroups[0]['items'][0]['icon']) {
            $selectedIcon = $selectItemGroups[0]['items'][0]['icon'];
        }

        // Process groups
        foreach ($selectItemGroups as $selectItemGroup) {
            // suppress groups without items
            if (empty($selectItemGroup['items'])) {
                continue;
            }

            $optionGroup = is_array($selectItemGroup['header']);
            $options .= ($optionGroup ? '<optgroup label="' . htmlspecialchars($selectItemGroup['header']['title'], ENT_COMPAT, 'UTF-8', false) . '">' : '');

            if (is_array($selectItemGroup['items'])) {
                foreach ($selectItemGroup['items'] as $item) {
                    $options .= '<option value="' . htmlspecialchars($item['value']) . '" data-icon="' .
                        htmlspecialchars($item['icon']) . '"'
                        . ($item['selected'] ? ' selected="selected"' : '') . '>' . htmlspecialchars($item['title'], ENT_COMPAT, 'UTF-8', false) . '</option>';
                }
                $hasIcons = !empty($item['icon']);
            }

            $options .= ($optionGroup ? '</optgroup>' : '');
        }

        $selectAttributes = [
            'id' => $selectId,
            'name' => $parameterArray['itemFormElName'],
            'data-formengine-validation-rules' => $this->getValidationDataAsJsonString($config),
            'class' => 'form-control form-control-adapt',
        ];
        if ($size) {
            $selectAttributes['size'] = $size;
        }
        if ($disabled) {
            $selectAttributes['disabled'] = 'disabled';
        }

        $fieldInformationResult = $this->renderFieldInformation();
        $fieldInformationHtml = $fieldInformationResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldInformationResult, false);

        $fieldWizardResult = $this->renderFieldWizard();
        $fieldWizardHtml = $fieldWizardResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldWizardResult, false);


        $defaultValue = $this->getTypoScriptValue($config['typoscriptPath']);

        if ($defaultValue !== null) {

            $checked = $selectedValue !== null ? ' checked="checked"' : '';
            $placeholder = $shortenedPlaceholder = $defaultValue ?? '';

            foreach ($selectItems as $selectItem) {
                if ($selectItem[1] === $defaultValue) $placeholder = $selectItem[0];
            }

            $disabled = '';
            $fallbackValue = 0;
            if (strlen($placeholder) > 0) {
                $shortenedPlaceholder = GeneralUtility::fixed_lgd_cs($placeholder, 20);
                if ($placeholder !== $shortenedPlaceholder) {
                    $overrideLabel = sprintf(
                        $languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.placeholder.override'),
                        '<span title="' . htmlspecialchars($placeholder) . '">' . htmlspecialchars($shortenedPlaceholder) . '</span>'
                    );
                } else {
                    $overrideLabel = sprintf(
                        $languageService->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.placeholder.override'),
                        htmlspecialchars($placeholder)
                    );
                }
            } else {
                $overrideLabel = $languageService->sL(
                    'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.placeholder.override_not_available'
                );
            }

        }


        $mainFieldHtml = [];
        $mainFieldHtml[] =   '<div class="form-control-wrap">';
        $mainFieldHtml[] =       '<div class="form-wizards-wrap">';
        $mainFieldHtml[] =           '<div class="form-wizards-element">';
        if ($hasIcons) {
            $mainFieldHtml[] =           '<div class="input-group">';
            $mainFieldHtml[] =               '<span class="input-group-addon input-group-icon">';
            $mainFieldHtml[] =                   $selectedIcon;
            $mainFieldHtml[] =               '</span>';
        }
        $mainFieldHtml[] =                   '<select ' . GeneralUtility::implodeAttributes($selectAttributes, true) . '>';
        $mainFieldHtml[] =                       $options;
        $mainFieldHtml[] =                   '</select>';
        if ($hasIcons) {
            $mainFieldHtml[] =           '</div>';
        }
        $mainFieldHtml[] =           '</div>';
        if (!$disabled && !empty($fieldWizardHtml)) {
            $mainFieldHtml[] =       '<div class="form-wizards-items-bottom">';
            $mainFieldHtml[] =           $fieldWizardHtml;
            $mainFieldHtml[] =       '</div>';
        }
        $mainFieldHtml[] =       '</div>';
        $mainFieldHtml[] =   '</div>';
        $mainFieldHtml = implode(LF, $mainFieldHtml);

        $fullElement = $mainFieldHtml;

        if ($defaultValue !== null) {
            $fullElement = [];
            $fullElement[] = '<div class="checkbox t3js-form-field-eval-null-placeholder-checkbox">';
            $fullElement[] =     '<label for="' . $nullControlNameEscaped . '">';
            $fullElement[] =         '<input type="hidden" name="' . $nullControlNameEscaped . '" value="' . $fallbackValue . '" />';
            $fullElement[] =         '<input type="checkbox" name="' . $nullControlNameEscaped . '" id="' . $nullControlNameEscaped . '" value="1"' . $checked . $disabled . ' />';
            $fullElement[] =         $overrideLabel;
            $fullElement[] =     '</label>';
            $fullElement[] = '</div>';
            $fullElement[] = '<div class="t3js-formengine-placeholder-placeholder">';
            $fullElement[] =    '<div class="form-control-wrap" >';
            $fullElement[] =        '<select';
            $fullElement[] =            ' class="form-control-adapt form-control"';
            $fullElement[] =            ' disabled="disabled"';
            $fullElement[] =        '>';
            $fullElement[] =            '<option>'.htmlspecialchars($shortenedPlaceholder).'</option>';
            $fullElement[] =        '</select>';
            $fullElement[] =    '</div>';
            $fullElement[] = '</div>';
            $fullElement[] = '<div class="t3js-formengine-placeholder-formfield">';
            $fullElement[] =    $mainFieldHtml;
            $fullElement[] = '</div>';
            $fullElement = implode(LF, $fullElement);
        }


        $resultArray['requireJsModules'][] = ['TYPO3/CMS/Backend/FormEngine/Element/SelectSingleElement' => implode(LF, [
            'function(SelectSingleElement) {',
                'require([\'jquery\'], function($) {',
                    '$(function() {',
                        'SelectSingleElement.initialize(',
                            GeneralUtility::quoteJSvalue('#' . $selectId) . ',',
                            '{',
                                'onChange: function() {',
                                    implode('', $parameterArray['fieldChangeFunc']),
                                '}',
                            '}',
                        ');',
                    '});',
                '});',
            '}',
        ])];

        $resultArray['html'] = '<div class="formengine-field-item t3js-formengine-field-item">' . $fieldInformationHtml . $fullElement . '</div>';
        return $resultArray;
    }


    private function getTypoScriptValue($path)
    {

        $tsArray = GeneralUtility::makeInstance(ObjectManager::class)
                ->get(ConfigurationManagerInterface::class)
                ->getConfiguration(
                    ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT
                );

        $segments = GeneralUtility::trimExplode('.',$path);

        $lastSegment = array_pop($segments);
        foreach ($segments as $segment) {
            if (isset($tsArray[$segment.'.'])) {
                $tsArray = $tsArray[$segment.'.'];
            } else {
                return null;
            }
        }
        if (isset($tsArray[$lastSegment])) return $tsArray[$lastSegment];

        return null;
    }

}
