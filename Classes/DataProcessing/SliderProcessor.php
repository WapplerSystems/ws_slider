<?php
declare(strict_types = 1);

namespace WapplerSystems\WsSlider\DataProcessing;

use TYPO3\CMS\Core\Service\FlexFormService;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\DebugUtility;
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

        $settings['renderer'] = $settings['defaultRenderer'];
        if ($processedData['data']['tx_wsslider_renderer'] !== null) $settings['renderer'] = $processedData['data']['tx_wsslider_renderer'];

        $settings['layout'] = $processedData['data']['tx_wsslider_layout'] ?? 'Default';

        $rendererKey = strtolower($settings['renderer']);

        if (isset($settings['renderer.'][$rendererKey.'.'])) {
            $settings['parameters'] = $settings['renderer.'][$rendererKey.'.'];
            unset($settings['renderer.']);
        } else {
            $settings['parameters'] = [];
        }


        $settings = GeneralUtility::removeDotsFromTS($settings);
        $settings['parameters'] = $this->convertStringToSimpleType($settings['parameters']);

        //DebugUtility::debug($settings['parameters'],"TypoScript");

        // Process Flexform
        $flexformData = $processedData['data']['pi_flexform'];
        if (is_string($flexformData)) {
            $flexformData = $this->flexFormService->convertFlexFormContentToArray($flexformData);
            //DebugUtility::debug($flexformData['settings']['js'],'FlexForm');
            if (is_array($flexformData['settings']['js'])) {
                ArrayUtility::mergeRecursiveWithOverrule(
                    $settings['parameters'],
                    $flexformData['settings']['js'],
                    true,
                    false
                );
            }
        }

        # convert integers in texts to integers
        $settings['parameters'] = $this->convertStringToSimpleType($settings['parameters']);
        $settings['jsonParameters'] = json_encode($settings['parameters']);

        $settings['renderer'] = ucfirst($settings['renderer']);

        unset($settings['defaultRenderer']);

        $processedData['sliderSettings'] = $settings;

        //DebugUtility::debug($processedData['sliderSettings'],'sliderSettings');

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

}
