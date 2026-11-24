<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\FlexForm;


use TYPO3\CMS\Core\Utility\GeneralUtility;

class FlexFormService extends \TYPO3\CMS\Core\Service\FlexFormService
{

    /**
     * Parses the flexForm content and converts it to an array
     * The resulting array will be multi-dimensional, as a value "bla.blubb"
     * results in two levels, and a value "bla.blubb.bla" results in three levels.
     *
     * Note: multi-language flexForms are not supported yet
     *
     * @param string $flexFormContent flexForm xml string
     * @param string $languagePointer language pointer used in the flexForm
     * @param string $valuePointer value pointer used in the flexForm
     */
    public function convertFlexFormContentToArray($flexFormContent, $languagePointer = 'lDEF', $valuePointer = 'vDEF'): array
    {
        $settings = [];
        $flexFormArray = GeneralUtility::xml2array($flexFormContent);
        $flexFormArray = $flexFormArray['data'] ?? [];
        foreach (array_values($flexFormArray) as $languages) {
            if (!is_array($languages[$languagePointer] ?? false)) {
                continue;
            }
            foreach ($languages[$languagePointer] as $valueKey => $valueDefinition) {
                if (!str_contains($valueKey, '.')) {
                    $settings[$valueKey] = $this->mergeValue(
                        $settings[$valueKey] ?? null,
                        $this->walkFlexFormNode($valueDefinition, $valuePointer)
                    );
                } else {
                    $valueKeyParts = explode('.', $valueKey);
                    $currentNode = &$settings;
                    foreach ($valueKeyParts as $valueKeyPart) {
                        try {
                            $currentNode = &$currentNode[$valueKeyPart];
                        } catch (\TypeError $e) {
                        }
                    }
                    if (is_array($valueDefinition)) {
                        if (array_key_exists($valuePointer, $valueDefinition)) {
                            $value = $valueDefinition[$valuePointer];
                        } else {
                            $value = $this->walkFlexFormNode($valueDefinition, $valuePointer);
                        }
                    } else {
                        $value = $valueDefinition;
                    }
                    $currentNode = $this->mergeValue($currentNode, $value);
                    unset($currentNode);
                }
            }
        }
        return $settings;
    }

    /**
     * A record can hold the same setting in more than one sheet: a sheet left over from an earlier
     * FlexForm layout, or the sheets a backend save materialises (empty, since every option field is
     * nullable with an empty first item). Sheets are traversed in document order, so without this the
     * one that happens to come last wins - and an empty value would wipe a value another sheet
     * provides.
     *
     * An empty value means "not set, use the default" - precisely what the nullable
     * *WithTypoScriptPlaceholder fields express, and how the merge against TypoScript already treats
     * it (mergeRecursiveWithOverrule with includeEmptyValues: false). So it must never overwrite a
     * value that is already there. Without this rule, a single save on such a record silently resets
     * every configured option to the extension defaults, with nothing visible in the backend form.
     */
    private function mergeValue(mixed $existing, mixed $new): mixed
    {
        if (is_array($existing) && is_array($new)) {
            foreach ($new as $key => $value) {
                $existing[$key] = $this->mergeValue($existing[$key] ?? null, $value);
            }
            return $existing;
        }
        if ($this->isEmptyValue($new) && !$this->isEmptyValue($existing)) {
            return $existing;
        }
        return $new;
    }

    private function isEmptyValue(mixed $value): bool
    {
        return $value === null || $value === '' || $value === [];
    }

}
