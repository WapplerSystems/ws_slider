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
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Utility\DebugUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use WapplerSystems\WsSlider\Service\TypoScriptService;

/**
 * Creates a widget where only one item can be selected.
 * This is either a select drop-down if no size config is given or set to 1, or a select box.
 *
 * This is rendered for type=select, renderType=selectSingle
 */
class SelectSingleWithTypoScriptPlaceholderElement extends AbstractFormElement
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
            'after' => ['localizationStateSelector'],
        ],
        'defaultLanguageDifferences' => [
            'renderType' => 'defaultLanguageDifferences',
            'after' => ['otherLanguageContent'],
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

        $typoscript = TypoScriptService::getTypoScript($this->data['parentPageRow']['uid'], 0, $this->data['rootline'], $this->data['site']);

        $table = $this->data['tableName'];
        $field = $this->data['fieldName'];
        $row = $this->data['databaseRow'];
        $parameterArray = $this->data['parameterArray'];
        $config = $parameterArray['fieldConf']['config'];

        $selectItems = $parameterArray['fieldConf']['config']['items'];
        $classList = ['form-select', 'form-control-adapt'];

        # fix for flexform
        $nullControlNameEscaped = 'control[active]' . substr($parameterArray['itemFormElName'], 4);

        // Check against inline uniqueness
        /** @var InlineStackProcessor $inlineStackProcessor */
        $inlineStackProcessor = GeneralUtility::makeInstance(InlineStackProcessor::class);
        $inlineStackProcessor->initializeByGivenStructure($this->data['inlineStructure']);
        $uniqueIds = [];
        if (($this->data['isInlineChild'] ?? false) && ($this->data['inlineParentUid'] ?? false)) {
            // If config[foreign_unique] is set for the parent inline field, all
            // already used unique ids must be excluded from the select items.
            $inlineObjectName = $inlineStackProcessor->getCurrentStructureDomObjectIdPrefix($this->data['inlineFirstPid']);
            if (($this->data['inlineParentConfig']['foreign_table'] ?? false) === $table
                && ($this->data['inlineParentConfig']['foreign_unique'] ?? false) === $field
            ) {
                $classList[] = 't3js-inline-unique';
                $uniqueIds = $this->data['inlineData']['unique'][$inlineObjectName . '-' . $table]['used'] ?? [];
            }
            // hide uid of parent record for symmetric relations
            if (($this->data['inlineParentConfig']['foreign_table'] ?? false) === $table
                && (
                    ($this->data['inlineParentConfig']['foreign_field'] ?? false) === $field
                    || ($this->data['inlineParentConfig']['symmetric_field'] ?? false) === $field
                )
            ) {
                $uniqueIds[] = $this->data['inlineParentUid'];
            }
            $uniqueIds = array_map(static fn ($item) => (int)$item, $uniqueIds);
        }

        // Initialization:
        $selectId = StringUtility::getUniqueId('tceforms-select-');
        $selectedIcon = '';
        $size = (int)($config['size'] ?? 0);
        $fallbackValue = 0;

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

        // In case e.g. "l10n_display" is set to "defaultAsReadonly" only one value (as string) could be handed in
        if (!empty($parameterArray['itemFormElValue'])) {
            if (is_array($parameterArray['itemFormElValue'])) {
                $selectedValue = (string)$parameterArray['itemFormElValue'][0];
            } else {
                $selectedValue = (string)$parameterArray['itemFormElValue'];
            }
        }

        $defaultValue = TypoScriptService::getTypoScriptValueByPath($typoscript->toArray(),$config['typoscriptPath']);
        if ($selectedValue === null) {
            $selectedValue = $defaultValue;
        }

        foreach ($selectItems as $item) {
            $selected = $selectedValue === (string)($item['value'] ?? '');

            if (($item['value'] ?? '') === '--div--') {
                // IS OPTGROUP
                if ($selectItemCounter !== 0) {
                    $selectItemGroupCount++;
                }
                $selectItemGroups[$selectItemGroupCount]['header'] = [
                    'title' => $item['label'],
                ];
            } elseif ($selected || !in_array((int)$item['value'], $uniqueIds, true)) {
                $icon = !empty($item['icon']) ? FormEngineUtility::getIconHtml($item['icon'], $item['label'], $item['label']) : '';

                if ($selected) {
                    $selectedIcon = $icon;
                }

                $selectItemGroups[$selectItemGroupCount]['items'][] = [
                    'title' => $this->appendValueToLabelInDebugMode($item['label'], $item['value']),
                    'value' => $item['value'],
                    'icon' => $icon,
                    'selected' => $selected,
                ];
                $selectItemCounter++;
            }
        }

        // Fallback icon
        // @todo: assign a special icon for non matching values?
        if (!$selectedIcon && !empty($selectItemGroups[0]['items'][0]['icon'])) {
            $selectedIcon = $selectItemGroups[0]['items'][0]['icon'];
        }

        // Process groups
        foreach ($selectItemGroups as $selectItemGroup) {
            // suppress groups without items
            if (empty($selectItemGroup['items'])) {
                continue;
            }

            $optionGroup = is_array($selectItemGroup['header'] ?? '');
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
            'class' => 'form-control form-select form-control-adapt',
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



        if ($defaultValue !== null) {

            $checked = !empty($parameterArray['itemFormElValue']) ? ' checked="checked"' : '';
            $placeholder = $shortenedPlaceholder = $defaultValue ?? '';

            foreach ($selectItems as $selectItem) {
                if ($selectItem['value'] === $defaultValue) $placeholder = $selectItem['label'];
            }

            if ($placeholder !== '') {
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
        $mainFieldHtml[] = '<div class="form-control-wrap">';
        $mainFieldHtml[] = '<div class="form-wizards-wrap">';
        $mainFieldHtml[] = '<div class="form-wizards-element">';
        if ($hasIcons) {
            $mainFieldHtml[] = '<div class="input-group">';
            $mainFieldHtml[] = '<span class="input-group-addon input-group-icon">';
            $mainFieldHtml[] = $selectedIcon;
            $mainFieldHtml[] = '</span>';
        }
        $mainFieldHtml[] = '<select ' . GeneralUtility::implodeAttributes($selectAttributes, true) . '>';
        $mainFieldHtml[] = $options;
        $mainFieldHtml[] = '</select>';
        if ($hasIcons) {
            $mainFieldHtml[] = '</div>';
        }
        $mainFieldHtml[] = '</div>';
        if (!$disabled && !empty($fieldWizardHtml)) {
            $mainFieldHtml[] = '<div class="form-wizards-items-bottom">';
            $mainFieldHtml[] = $fieldWizardHtml;
            $mainFieldHtml[] = '</div>';
        }
        $mainFieldHtml[] = '</div>';
        $mainFieldHtml[] = '</div>';
        $mainFieldHtml = implode(LF, $mainFieldHtml);

        $fullElement = $mainFieldHtml;

        if ($defaultValue !== null) {
            $fullElement = [];
            $fullElement[] = '<div class="checkbox t3js-form-field-eval-null-placeholder-checkbox">';
            $fullElement[] = '<label for="' . $nullControlNameEscaped . '">';
            $fullElement[] = '<input type="hidden" name="' . $nullControlNameEscaped . '" value="' . $fallbackValue . '" />';
            $fullElement[] = '<input type="checkbox" name="' . $nullControlNameEscaped . '" id="' . $nullControlNameEscaped . '" value="1"' . $checked . ($disabled ? ' disabled' : '') . ' />';
            $fullElement[] = $overrideLabel;
            $fullElement[] = '</label>';
            $fullElement[] = '</div>';
            $fullElement[] = '<div class="t3js-formengine-placeholder-placeholder">';
            $fullElement[] = '<div class="form-control-wrap" >';
            $fullElement[] = '<select';
            $fullElement[] = ' class="form-control-adapt form-control"';
            $fullElement[] = ' disabled="disabled"';
            $fullElement[] = '>';
            $fullElement[] = '<option>' . htmlspecialchars($shortenedPlaceholder) . '</option>';
            $fullElement[] = '</select>';
            $fullElement[] = '</div>';
            $fullElement[] = '</div>';
            $fullElement[] = '<div class="t3js-formengine-placeholder-formfield">';
            $fullElement[] = $mainFieldHtml;
            $fullElement[] = '</div>';
            $fullElement = implode(LF, $fullElement);
        }


        $onFieldChangeItems = $this->getOnFieldChangeItems($parameterArray['fieldChangeFunc'] ?? []);
        $resultArray['javaScriptModules']['selectSingleElement'] = JavaScriptModuleInstruction::create(
            '@typo3/backend/form-engine/element/select-single-element.js'
        )->invoke('initializeOnReady', '#' . $selectId, ['onChange' => $onFieldChangeItems]);


        $resultArray['html'] = '<div class="formengine-field-item t3js-formengine-field-item">' . $fieldInformationHtml . $fullElement . '</div>';
        return $resultArray;
    }

}
