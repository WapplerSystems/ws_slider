<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\DataProcessing;

use Psr\EventDispatcher\EventDispatcherInterface;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;
use WapplerSystems\WsSlider\Event\AfterSliderProcessedEvent;
use WapplerSystems\WsSlider\FlexForm\FlexFormService;
use WapplerSystems\WsSlider\Source\SliderSourceInterface;
use WapplerSystems\WsSlider\Source\SliderSourceRegistry;

/**
 *
 * 10 = WapplerSystems\WsSlider\DataProcessing\SliderProcessor
 */
class SliderProcessor implements DataProcessorInterface
{

    /**
     * @var FlexFormService
     */
    protected FlexFormService $flexFormService;

    protected EventDispatcherInterface $eventDispatcher;

    /**
     * Constructor
     */
    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->flexFormService = GeneralUtility::makeInstance(FlexFormService::class);
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * @param ContentObjectRenderer $cObj The data of the content element or page
     * @param array $contentObjectConfiguration The configuration of Content Object
     * @param array $processorConfiguration The configuration of this processor
     * @param array $processedData Key/value store of processed data (e.g. to be passed to a Fluid View)
     * @return array the processed data as key/value store
     */
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {

        $settings = $contentObjectConfiguration['settings.']['slider.'];
        $settings['parameters'] = [];
        $settings['layout'] = $processedData['data']['tx_wsslider_layout'] ?? 'Default';

        if ($processedData['data']['tx_wsslider_source'] !== null && $processedData['data']['tx_wsslider_source'] !== '') {
            /** @var SliderSourceInterface $source */
            $source = GeneralUtility::getContainer()->get(SliderSourceRegistry::class)->getSource($processedData['data']['tx_wsslider_source']);
            if ($source === null) {
                throw new \RuntimeException('No slider source found with name "' . $processedData['data']['tx_wsslider_source'] . '"', 1666544862);
            }
            $processedData['items'] = $source->getSliderItems($cObj->getRequest());
        }


        if (($processedData['data']['tx_wsslider_preset'] ?? 0) > 0) {

            $preset = BackendUtility::getRecord('tx_wsslider_domain_model_preset', $processedData['data']['tx_wsslider_preset']);
            if ($preset === null) {
                $processedData['presetNotFound'] = true;
                return $processedData;
            }

            $rendererKey = $settings['renderer'] = $preset['type'];
            if (isset($settings['renderer.'][$rendererKey . '.'])) {
                $settings['parameters'] = $settings['renderer.'][$rendererKey . '.'];
                unset($settings['renderer.']);
            }

            $options = $this->resolveTypoScriptConfiguration($cObj, $settings['parameters']);
            $options = self::removeDotsFromTS($options);

            $flexformOptions = $this->flexFormService->convertFlexFormContentToArray($preset[$rendererKey] ?? '');
            $flexformOptions = $this->migrateFlexFormOptions($flexformOptions);
            ArrayUtility::mergeRecursiveWithOverrule($options, $flexformOptions, true, false);

            $this->convertStringOptionsToBoolean($options);

        } else {

            $settings['renderer'] = $settings['defaultRenderer'];
            if ($processedData['data']['tx_wsslider_renderer'] !== null) {
                $settings['renderer'] = $processedData['data']['tx_wsslider_renderer'];
            }

            $rendererKey = strtolower($settings['renderer']);

            if (isset($settings['renderer.'][$rendererKey . '.'])) {
                $settings['parameters'] = $settings['renderer.'][$rendererKey . '.'];
                unset($settings['renderer.']);
            }

            $options = $this->resolveTypoScriptConfiguration($cObj, $settings['parameters']);
            $options = self::removeDotsFromTS($options);

            // Process Flexform
            $flexformData = $processedData['data']['pi_flexform'];
            if (is_string($flexformData)) {
                try {
                    $flexformOptions = $this->flexFormService->convertFlexFormContentToArray($flexformData);
                    $flexformOptions = $this->migrateFlexFormOptions($flexformOptions);
                    ArrayUtility::mergeRecursiveWithOverrule($options, $flexformOptions, true, false);
                } catch (\TypeError $ex) {
                    $processedData['error'] = $ex->getMessage();
                }
            }

            $this->convertStringOptionsToBoolean($options);
        }

        $processedData['options'] = $options;

        # convert integers in texts to integers
        $settings['jsonParameters'] = json_encode($settings['parameters'], JSON_THROW_ON_ERROR);

        $settings['renderer'] = ucfirst($settings['renderer']);

        unset($settings['defaultRenderer']);

        $processedData['sliderSettings'] = $settings;

        $processedData['source'] = $processedData['data']['tx_wsslider_source'] ?? '';

        /** @var AfterSliderProcessedEvent $event */
        $event = $this->eventDispatcher->dispatch(new AfterSliderProcessedEvent($cObj, $contentObjectConfiguration, $processorConfiguration, $processedData));
        $processedData = $event->getProcessedData();

        return $processedData;
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

    private function migrateFlexFormOptions(array $flexformOptions): array
    {
        if (isset($flexformOptions['js']) && is_array($flexformOptions['js'])) {
            foreach ($flexformOptions['js'] as $key => $value) {
                $flexformOptions[$key] = $value;
            }
            unset($flexformOptions['js']);
        }
        if (isset($flexformOptions['settings']) && is_array($flexformOptions['settings'])) {
            foreach ($flexformOptions['settings'] as $key => $value) {
                $flexformOptions[$key] = $value;
            }
            unset($flexformOptions['settings']);
        }

        return $flexformOptions;
    }

    private function convertStringOptionsToBoolean(&$options)
    {
        foreach ($options as $key => $value) {
            if (is_array($value)) {
                $this->convertStringOptionsToBoolean($options[$key]);
            } else {
                if (is_string($value)) {
                    if (strtolower($value) === 'true') {
                        $options[$key] = true;
                    } elseif (strtolower($value) === 'false') {
                        $options[$key] = false;
                    }
                }
            }
        }
    }

}
