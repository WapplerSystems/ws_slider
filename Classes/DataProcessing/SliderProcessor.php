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

        $settings = $contentObjectConfiguration['settings.']['slider.']['default.'];


        // Process Flexform
        $originalValue = $processedData['data']['pi_flexform'];
        DebugUtility::debug($processedData);
        if (is_string($originalValue)) {
            $flexformData = $this->flexFormService->convertFlexFormContentToArray($originalValue);


            DebugUtility::debug($flexformData['settings']);

            ArrayUtility::mergeRecursiveWithOverrule(
                $settings,
                $flexformData['settings']
            );
        }


        if (!isset($settings['layout']) || empty($settings['layout'])) {
            $settings['layout'] = 'Default';
        }

        $settings['layout'] = ucfirst($settings['layout']);
        $settings['renderer'] = ucfirst($settings['renderer']);

        $processedData['sliderSettings'] = $settings;

        return $processedData;
    }
}
