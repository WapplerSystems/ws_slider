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

        $settings = $contentObjectConfiguration['settings.']['slider.'] ?? [];
        $settings['parameters'] = [];

        // An empty field means "not set" - fall back to the TypoScript default instead of
        // overriding it with an empty string (see forge issue #47).
        $settings['layout'] = $this->firstNonEmptyString(
            $processedData['data']['tx_wsslider_layout'] ?? null,
            $settings['layout'] ?? null,
            'Default'
        );

        if (($processedData['data']['tx_wsslider_source'] ?? '') !== '') {
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

            $rendererKey = $settings['renderer'] = strtolower((string)($preset['type'] ?? ''));
            if ($rendererKey === '') {
                $processedData['presetNotFound'] = true;
                return $processedData;
            }
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
            $this->removeArrayKeysMarker($options);

        } else {

            // An empty selection means "use the TypoScript default" - it must not override it.
            $settings['renderer'] = $this->firstNonEmptyString(
                $processedData['data']['tx_wsslider_renderer'] ?? null,
                $settings['defaultRenderer'] ?? null,
                ''
            );

            if ($settings['renderer'] === '') {
                $processedData['error'] = 'No slider renderer configured. Set one on the content element or via'
                    . ' plugin.tx_wsslider.settings.defaultRenderer.';
                $processedData['sliderSettings'] = $settings;
                return $processedData;
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
            $this->removeArrayKeysMarker($options);
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


    /**
     * Returns the first argument that is a non-empty string, casting scalars on the way.
     */
    private function firstNonEmptyString(mixed ...$candidates): string
    {
        foreach ($candidates as $candidate) {
            if ($candidate === null || is_array($candidate)) {
                continue;
            }
            $candidate = trim((string)$candidate);
            if ($candidate !== '') {
                return $candidate;
            }
        }

        return '';
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

    /**
     * FlexFormService nests the values by field name. Which container is the current one
     * depends on the renderer:
     *   Slick, Flexslider, TinySlider, Bootstrap use "settings.js.<option>"
     *   Swiper uses "settings.<option>" and only carries a leftover "js" from older versions
     *
     * "settings" therefore has to be unwrapped first - unwrapping "js" first was a no-op,
     * because at that point "js" was still nested inside "settings". It only surfaced
     * afterwards and was then merged into the options as one nested array, so the generated
     * JavaScript ended up with an inert "js: {...}" block while the flat defaults stayed in
     * effect (github issue #55, analysed in more detail in PR #68).
     *
     * "js" values only fill gaps afterwards. For the js-based renderers nothing collides, so
     * every option is applied; for Swiper the current values win and stale leftovers can no
     * longer override them.
     */
    private function migrateFlexFormOptions(array $flexformOptions): array
    {
        if (isset($flexformOptions['settings']) && is_array($flexformOptions['settings'])) {
            foreach ($flexformOptions['settings'] as $key => $value) {
                $flexformOptions[$key] = $value;
            }
            unset($flexformOptions['settings']);
        }

        if (isset($flexformOptions['js']) && is_array($flexformOptions['js'])) {
            foreach ($flexformOptions['js'] as $key => $value) {
                if (!array_key_exists($key, $flexformOptions)) {
                    $flexformOptions[$key] = $value;
                }
            }
            unset($flexformOptions['js']);
        }

        return $flexformOptions;
    }

    /**
     * Strips the "_removeArrayKeys" marker and reindexes the array into a real PHP list,
     * so AbstractSliderFactory::js_encode() renders it as a JS array instead of an object.
     */
    private function removeArrayKeysMarker(array &$options): void
    {
        foreach ($options as $key => &$value) {
            if (!is_array($value)) {
                continue;
            }

            $this->removeArrayKeysMarker($value);

            if (array_key_exists('_removeArrayKeys', $value) && (bool)$value['_removeArrayKeys']) {
                unset($value['_removeArrayKeys']);
                $value = array_values($value);
            }
        }
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
