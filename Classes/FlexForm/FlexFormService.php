<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\FlexForm;

use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Standalone FlexForm parser with bugfix for nested key TypeError.
 * Cannot extend FlexFormTools in v14 (readonly class).
 */
class FlexFormService
{
    /**
     * Parses the flexForm content and converts it to an array.
     * Includes a fix for TypeError when traversing nested dotted keys.
     */
    public function convertFlexFormContentToArray(string $flexFormContent, string $languagePointer = 'lDEF', string $valuePointer = 'vDEF'): array
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
                    $settings[$valueKey] = $this->walkFlexFormNode($valueDefinition, $valuePointer);
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
                            $currentNode = $valueDefinition[$valuePointer];
                        } else {
                            $currentNode = $this->walkFlexFormNode($valueDefinition, $valuePointer);
                        }
                    } else {
                        $currentNode = $valueDefinition;
                    }
                }
            }
        }
        return $settings;
    }

    private function walkFlexFormNode(mixed $nodeArray, string $valuePointer = 'vDEF'): mixed
    {
        if (!is_array($nodeArray)) {
            return $nodeArray;
        }
        $result = [];
        foreach ($nodeArray as $nodeKey => $nodeValue) {
            if ($nodeKey === $valuePointer) {
                return $nodeValue;
            }
            if (in_array($nodeKey, ['el', '_arrayContainer'])) {
                return $this->walkFlexFormNode($nodeValue, $valuePointer);
            }
            if (($nodeKey[0] ?? '') === '_') {
                continue;
            }
            if (str_contains((string)$nodeKey, '.')) {
                $nodeKeyParts = explode('.', $nodeKey);
                $currentNode = &$result;
                $nodeKeyPartsCount = count($nodeKeyParts);
                for ($i = 0; $i < $nodeKeyPartsCount - 1; $i++) {
                    $currentNode = &$currentNode[$nodeKeyParts[$i]];
                }
                $newNode = [next($nodeKeyParts) => $nodeValue];
                $subVal = $this->walkFlexFormNode($newNode, $valuePointer);
                $currentNode[key($subVal)] = current($subVal);
            } elseif (is_array($nodeValue)) {
                if (array_key_exists($valuePointer, $nodeValue)) {
                    $result[$nodeKey] = $nodeValue[$valuePointer];
                } else {
                    $result[$nodeKey] = $this->walkFlexFormNode($nodeValue, $valuePointer);
                }
            } else {
                $result[$nodeKey] = $nodeValue;
            }
        }
        return $result;
    }
}