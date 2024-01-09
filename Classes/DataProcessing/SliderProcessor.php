<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\DataProcessing;

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Service\FlexFormService;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 *
 * 10 = WapplerSystems\WsSlider\DataProcessing\SliderProcessor
 * 10 {
 *   as = flexform
 * }
 */
class SliderProcessor implements DataProcessorInterface
{

    /**
     * @var FlexFormService
     */
    protected $flexFormService;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->flexFormService = GeneralUtility::makeInstance(FlexFormService::class);
    }

    /**
     * @param ContentObjectRenderer $cObj The data of the content element or page
     * @param array $contentObjectConfiguration The configuration of Content Object
     * @param array $processorConfiguration The configuration of this processor
     * @param array $processedData Key/value store of processed data (e.g. to be passed to a Fluid View)
     * @return array the processed data as key/value store
     */
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData)
    {

        $settings = $contentObjectConfiguration['settings.']['slider.'];
        $settings['parameters'] = [];
        $settings['layout'] = $processedData['data']['tx_wsslider_layout'] ?? 'Default';

        if (($processedData['data']['tx_wsslider_preset'] ?? 0) > 0) {

            $preset = BackendUtility::getRecord('tx_wsslider_domain_model_preset', $processedData['data']['tx_wsslider_preset']);

            $rendererKey = $settings['renderer'] = $preset['type'];
            if (isset($settings['renderer.'][$rendererKey . '.'])) {
                $settings['parameters'] = $settings['renderer.'][$rendererKey . '.'];
                unset($settings['renderer.']);
            }

            $settings['parameters'] = $this->resolveTypoScriptConfiguration($cObj, $settings['parameters']);
            $settings['parameters'] = self::removeDotsFromTS($settings['parameters']);
            $settings['parameters'] = $this->convertStringToSimpleType($settings['parameters']);

            $presetValues = $this->flexFormService->convertFlexFormContentToArray($preset[$rendererKey] ?? '');
            if (is_array($presetValues['settings']['js'] ?? null)) {
                ArrayUtility::mergeRecursiveWithOverrule(
                    $settings['parameters'],
                    $presetValues['settings']['js'],
                    true,
                    false
                );
            }

            $settings['parameters'] = $this->convertStringToSimpleType($settings['parameters']);

        } else {

            $settings['renderer'] = $settings['defaultRenderer'];
            if ($processedData['data']['tx_wsslider_renderer'] !== null) $settings['renderer'] = $processedData['data']['tx_wsslider_renderer'];

            $rendererKey = strtolower($settings['renderer']);

            if (isset($settings['renderer.'][$rendererKey . '.'])) {
                $settings['parameters'] = $settings['renderer.'][$rendererKey . '.'];
                unset($settings['renderer.']);
            }


            $settings['parameters'] = $this->resolveTypoScriptConfiguration($cObj, $settings['parameters']);
            $settings['parameters'] = self::removeDotsFromTS($settings['parameters']);
            $settings['parameters'] = $this->convertStringToSimpleType($settings['parameters']);


            // Process Flexform
            $flexformData = $processedData['data']['pi_flexform'];
            if (is_string($flexformData)) {
                $flexformData = $this->flexFormService->convertFlexFormContentToArray($flexformData);
                if (is_array($flexformData['settings']['js'] ?? null)) {
                    ArrayUtility::mergeRecursiveWithOverrule(
                        $settings['parameters'],
                        $flexformData['settings']['js'],
                        true,
                        false
                    );
                }
            }
        }

        # convert integers in texts to integers
        $settings['parameters'] = $this->convertStringToSimpleType($settings['parameters']);
        $settings['jsonParameters'] = json_encode($settings['parameters'], JSON_THROW_ON_ERROR);

        $settings['renderer'] = ucfirst($settings['renderer']);

        unset($settings['defaultRenderer']);

        $processedData['sliderSettings'] = $settings;

        return $processedData;
    }


    private function convertStringToSimpleType(array $ts)
    {
        $out = [];
        foreach ($ts as $key => $value) {
            if (is_array($value)) {
                $out[$key] = $this->convertStringToSimpleType($value);
            } else if (is_numeric($value)) {
                $out[$key] = (int)$value;
            } else if ($value === 'true') {
                $out[$key] = true;
            } else if ($value === 'false') {
                $out[$key] = false;
            } else {
                $out[$key] = $value;
            }
        }
        return $out;
    }


    private function resolveTypoScriptConfiguration(ContentObjectRenderer $cObj, array $configuration = []): array
    {
        foreach ($configuration as $key => $value) {
            $keyWithoutDot = rtrim((string)$key, '.');
            if (isset($configuration[$keyWithoutDot]) && isset($configuration[$keyWithoutDot . '.'])) {
                $value = $cObj->cObjGetSingle(
                    $configuration[$keyWithoutDot],
                    $configuration[$keyWithoutDot . '.'],
                    $keyWithoutDot
                );
                $configuration[$keyWithoutDot] = $value;
            } elseif (!isset($configuration[$keyWithoutDot]) && isset($configuration[$keyWithoutDot . '.'])) {
                $configuration[$keyWithoutDot] = $this->resolveTypoScriptConfiguration($cObj, $value);
            }
            unset($configuration[$keyWithoutDot . '.']);
        }
        return $configuration;
    }

    /**
     * Removes dots "." from end of a key identifier of TypoScript styled array.
     * array('key.' => array('property.' => 'value')) --> array('key' => array('property' => 'value'))
     *
     * @param array $ts TypoScript configuration array
     * @return array TypoScript configuration array without dots at the end of all keys
     */
    public static function removeDotsFromTS(array $ts): array
    {
        $out = [];
        foreach ($ts as $key => $value) {
            if (is_array($value)) {
                $key = rtrim((string)$key, '.');
                $out[$key] = self::removeDotsFromTS($value);
            } else {
                $out[$key] = $value;
            }
        }
        return $out;
    }

}
