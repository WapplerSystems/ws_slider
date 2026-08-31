<?php

namespace WapplerSystems\WsSlider\Backend\Form\Element;

use TYPO3\CMS\Backend\Form\Element\AbstractFormElement;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use WapplerSystems\WsSlider\Service\TypoScriptService;

/**
 * General type=input element.
 *
 * This one kicks in if no specific renderType like "inputDateTime"
 * or "inputColorPicker" is set.
 */
class InputTextWithTypoScriptPlaceholderElement extends AbstractFormElement
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
        'localizationStateSelector' => [
            'renderType' => 'localizationStateSelector',
        ],
        'otherLanguageContent' => [
            'renderType' => 'otherLanguageContent',
            'after' => [
                'localizationStateSelector'
            ],
        ],
        'defaultLanguageDifferences' => [
            'renderType' => 'defaultLanguageDifferences',
            'after' => [
                'otherLanguageContent',
            ],
        ],
    ];


    public function __construct(readonly private TypoScriptService $typoScriptService)
    {

    }


    /**
     * This will render a single-line input form field, possibly with various control/validation features
     *
     * @return array As defined in initializeResultArray() of AbstractNode
     */
    public function render(): array
    {
        $languageService = $this->getLanguageService();

        $typoscript = null;
        if ($this->data['site'] instanceof Site) {
            $typoscript = $this->typoScriptService->getTypoScript($this->data['parentPageRow']['uid'], $this->data['request'], 0, $this->data['rootline'], $this->data['site']);
        }

        $table = $this->data['tableName'];
        $fieldName = $this->data['fieldName'];
        $row = $this->data['databaseRow'];
        $parameterArray = $this->data['parameterArray'];
        $resultArray = $this->initializeResultArray();

        $itemValue = $parameterArray['itemFormElValue'];
        if (is_array($itemValue) && count($itemValue) === 0) {
            $itemValue = '';
        }
        $config = $parameterArray['fieldConf']['config'];
        $evalList = GeneralUtility::trimExplode(',', $config['eval'] ?? '', true);
        if ($config['type'] === 'number') {
            $evalList[] = 'num';
        }

        $size = MathUtility::forceIntegerInRange($config['size'] ?? $this->defaultInputWidth, $this->minimumInputWidth, $this->maxInputWidth);
        $width = $this->formMaxWidth($size);

        $fieldId = StringUtility::getUniqueId('formengine-input-');
        $itemName = (string)$parameterArray['itemFormElName'];
        $renderedLabel = $this->renderLabel($fieldId);

        # fix for flexform
        $nullControlNameEscaped = 'control[active]' . substr($parameterArray['itemFormElName'], 4);

        $fieldInformationResult = $this->renderFieldInformation();
        $fieldInformationHtml = $fieldInformationResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldInformationResult, false);

        if ($config['readOnly'] ?? false) {
            // Early return for read only fields
            if (in_array('password', $evalList, true)) {
                $itemValue = $itemValue ? '*********' : '';
            }
            $html = [];
            $html[] = $renderedLabel;
            $html[] = '<div class="formengine-field-item t3js-formengine-field-item">';
            $html[] = $fieldInformationHtml;
            $html[] = '<div class="form-wizards-wrap">';
            $html[] = '<div class="form-wizards-element">';
            $html[] = '<div class="form-control-wrap" style="max-width: ' . $width . 'px">';
            $html[] = '<input class="form-control" value="' . htmlspecialchars($itemValue) . '" type="text" disabled>';
            $html[] = '</div>';
            $html[] = '</div>';
            $html[] = '</div>';
            $html[] = '</div>';
            $resultArray['html'] = implode(LF, $html);
            return $resultArray;
        }

        // @todo: The whole eval handling is a mess and needs refactoring
        foreach ($evalList as $func) {
            // @todo: This is ugly: The code should find out on it's own whether a eval definition is a
            // @todo: keyword like "date", or a class reference. The global registration could be dropped then
            // Pair hook to the one in \TYPO3\CMS\Core\DataHandling\DataHandler::checkValue_input_Eval()
            if (isset($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['tce']['formevals'][$func])) {
                if (class_exists($func)) {
                    $evalObj = GeneralUtility::makeInstance($func);
                    if (method_exists($evalObj, 'deevaluateFieldValue')) {
                        $_params = [
                            'value' => $itemValue
                        ];
                        $itemValue = $evalObj->deevaluateFieldValue($_params);
                    }
                    $resultArray = $this->resolveJavaScriptEvaluation($resultArray, $func, $evalObj);
                }
            }
        }

        $attributes = [
            'value' => '',
            'id' => StringUtility::getUniqueId('formengine-input-'),
            'class' => implode(' ', [
                'form-control',
                't3js-clearable',
                'hasDefaultValue',
            ]),
            'data-formengine-validation-rules' => $this->getValidationDataAsJsonString($config),
            'data-formengine-input-params' => json_encode([
                'field' => $parameterArray['itemFormElName'] ?? '',
                'evalList' => implode(',', $evalList),
                'is_in' => trim($config['is_in'] ?? '')
            ], JSON_THROW_ON_ERROR),
            'data-formengine-input-name' => $parameterArray['itemFormElName'],
        ];

        $maxLength = $config['max'] ?? 0;
        if ((int)$maxLength > 0) {
            $attributes['maxlength'] = (int)$maxLength;
        }
        if (!empty($config['placeholder'])) {
            $attributes['placeholder'] = trim($config['placeholder']);
        }
        if (isset($config['autocomplete'])) {
            $attributes['autocomplete'] = empty($config['autocomplete']) ? 'new-' . $fieldName : 'on';
        }

        $valuePickerHtml = [];
        if (is_array($config['valuePicker']['items'] ?? false)) {
            foreach ($config['valuePicker']['items'] as $item) {
                $valuePickerHtml[] = '<typo3-backend-combobox-choice value="' . htmlspecialchars((string)($item['value'] ?? $item[1] ?? '')) . '">'
                    . htmlspecialchars($languageService->sL((string)($item['label'] ?? $item[0] ?? ''))) . '</typo3-backend-combobox-choice>';
            }
            if ($valuePickerHtml !== []) {
                $resultArray['javaScriptModules'][] = JavaScriptModuleInstruction::create('@typo3/backend/element/combobox-element.js');
            }
        }

        $valueSliderHtml = [];
        if (is_array($config['slider'] ?? false)) {
            $min = $config['range']['lower'] ?? 0;
            $max = $config['range']['upper'] ?? 10000;
            $step = $config['slider']['step'] ?? 1;
            $sliderWidth = (int)($config['slider']['width'] ?? 400);

            $valueSliderHtml[] = '<typo3-formengine-valueslider ' . GeneralUtility::implodeAttributes([
                'target' => $parameterArray['itemFormElName'],
                'format' => in_array('double2', $evalList, true) ? 'double' : 'integer',
                'precision' => in_array('double2', $evalList, true) ? '2' : '0',
            ], true) . '>';
            $valueSliderHtml[] = '<div class="form-range">';
            $valueSliderHtml[] = '<input ' . GeneralUtility::implodeAttributes([
                'type' => 'range',
                'class' => 'form-range',
                'min' => (string)(float)$min,
                'max' => (string)(float)$max,
                'step' => (string)$step,
                'style' => 'width: ' . $sliderWidth . 'px',
                'title' => (string)$itemValue,
                'value' => (string)$itemValue,
            ], true) . '>';
            $valueSliderHtml[] = '</div>';
            $valueSliderHtml[] = '</typo3-formengine-valueslider>';

            $resultArray['javaScriptModules'][] = JavaScriptModuleInstruction::create('@typo3/backend/form-engine/field-wizard/value-slider.js');
        }

        $fieldControlResult = $this->renderFieldControl();
        $fieldControlHtml = $fieldControlResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldControlResult, false);

        $fieldWizardResult = $this->renderFieldWizard();
        $fieldWizardHtml = $fieldWizardResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldWizardResult, false);
        $inputType = 'text';

        if (in_array('email', $evalList, true)) {
            $inputType = 'email';
        } elseif (!empty(array_intersect($evalList, ['int', 'num']))) {
            $inputType = 'number';

            if (isset($config['range']['lower'])) {
                $attributes['min'] = (int)$config['range']['lower'];
            }
            if (isset($config['range']['upper'])) {
                $attributes['max'] = (int)$config['range']['upper'];
            }
        }

        $mainFieldHtml = [];
        $mainFieldHtml[] = '<div class="form-control-wrap" style="max-width: ' . $width . 'px">';
        $mainFieldHtml[] = '<div class="form-wizards-wrap">';
        $mainFieldHtml[] = '<div class="form-wizards-element">';
        if ($valuePickerHtml !== []) {
            $mainFieldHtml[] = '<typo3-backend-combobox>';
            $mainFieldHtml[] = '<input type="' . $inputType . '"' . GeneralUtility::implodeAttributes($attributes, true) . ' />';
            $mainFieldHtml[] = implode(LF, $valuePickerHtml);
            $mainFieldHtml[] = '</typo3-backend-combobox>';
        } else {
            $mainFieldHtml[] = '<input type="' . $inputType . '"' . GeneralUtility::implodeAttributes($attributes, true) . ' />';
        }
        $mainFieldHtml[] = '<input type="hidden" name="' . $parameterArray['itemFormElName'] . '" value="' . htmlspecialchars($itemValue) . '" />';
        $mainFieldHtml[] = '</div>';
        if (!empty($valueSliderHtml) || !empty($fieldControlHtml)) {
            $mainFieldHtml[] = '<div class="form-wizards-items-aside">';
            $mainFieldHtml[] = '<div class="btn-group">';
            $mainFieldHtml[] = implode(LF, $valueSliderHtml);
            $mainFieldHtml[] = $fieldControlHtml;
            $mainFieldHtml[] = '</div>';
            $mainFieldHtml[] = '</div>';
        }
        if (!empty($fieldWizardHtml)) {
            $mainFieldHtml[] = '<div class="form-wizards-items-bottom">';
            $mainFieldHtml[] = $fieldWizardHtml;
            $mainFieldHtml[] = '</div>';
        }
        $mainFieldHtml[] = '</div>';
        $mainFieldHtml[] = '</div>';
        $mainFieldHtml = implode(LF, $mainFieldHtml);

        $fullElement = $mainFieldHtml;

        $defaultValue = null;
        if ($typoscript !== null) {
            $defaultValue = TypoScriptService::getTypoScriptValueByPath($typoscript,$config['typoscriptPath']);
            if ($config['type'] === 'number') {
                $defaultValue = (int)$defaultValue;
            }
        }

        if ($defaultValue !== null) {
            $checked = ($itemValue !== '' && $itemValue !== null) ? ' checked="checked"' : '';
            $placeholder = $shortenedPlaceholder = $defaultValue ?? '';
            $disabled = '';
            $fallbackValue = 0;
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
            $fullElement = [];
            $fullElement[] = '<div class="checkbox t3js-form-field-eval-null-placeholder-checkbox">';
            $fullElement[] = '<label for="' . $nullControlNameEscaped . '">';
            $fullElement[] = '<input type="hidden" name="' . $nullControlNameEscaped . '" value="' . $fallbackValue . '" />';
            $fullElement[] = '<input type="checkbox" name="' . $nullControlNameEscaped . '" id="' . $nullControlNameEscaped . '" value="1"' . $checked . $disabled . ' />';
            $fullElement[] = $overrideLabel;
            $fullElement[] = '</label>';
            $fullElement[] = '</div>';
            $fullElement[] = '<div class="t3js-formengine-placeholder-placeholder">';
            $fullElement[] = '<div class="form-control-wrap" style="max-width:' . $width . 'px">';
            $fullElement[] = '<input type="text" class="form-control" disabled="disabled" value="' . $shortenedPlaceholder . '" />';
            $fullElement[] = '</div>';
            $fullElement[] = '</div>';
            $fullElement[] = '<div class="t3js-formengine-placeholder-formfield">';
            $fullElement[] = $mainFieldHtml;
            $fullElement[] = '</div>';
            $fullElement = implode(LF, $fullElement);
        }

        $resultArray['html'] = $renderedLabel . '
            <div class="formengine-field-item t3js-formengine-field-item">
                ' . $fieldInformationHtml . $fullElement . '
            </div>';

        return $resultArray;
    }

    /**
     * @return LanguageService
     */
    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

}
