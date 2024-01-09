<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\FlexForm;

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Configuration\Event\BeforeFlexFormDataStructureIdentifierInitializedEvent;
use TYPO3\CMS\Core\Configuration\Event\BeforeFlexFormDataStructureParsedEvent;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Messaging\AbstractMessage;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Form\Mvc\Configuration\Exception\NoSuchFileException;
use TYPO3\CMS\Form\Mvc\Configuration\Exception\ParseErrorException;
use TYPO3\CMS\Form\Service\TranslationService;
use WapplerSystems\WsSlider\Service\TypoScriptService;

/**
 *
 *
 * @internal
 */
final class FlexFormParsingModifyEventListener
{

    /**
     * Localisation prefix
     */
    public const L10N_PREFIX = 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:';


    public function setDataStructureIdentifier(
        BeforeFlexFormDataStructureIdentifierInitializedEvent $event
    ): void
    {
        $row = $event->getRow();
        $identifier = $event->getIdentifier();

        if ($event->getTableName() === 'tt_content' && $event->getFieldName() === 'pi_flexform' && $row['CType'] === 'ws_slider') {
            $pageTs = BackendUtility::getPagesTSconfig($row['pid']);

            if ((int)$row['tx_wsslider_preset'] !== 0 && $row['tx_wsslider_preset'] !== '') {
                $identifier['ext-wsslider-extendSheets'] = 'Preset';
                $event->setIdentifier($identifier);
                return;
            }

            if ($row['pid'] < 0) {
                $identifier['ext-wsslider-extendSheets'] = 'SaveNeeded';
                $event->setIdentifier($identifier);
                return;
            }

            $identifier['pageTs'] = $pageTs['tx_wsslider.'] ?? [];

            $typoscript = TypoScriptService::getTypoScript($row['pid']);

            $tsSettings = TypoScriptService::getTypoScriptValueByPath($typoscript->toArray(),'plugin.tx_wsslider.settings');
            $defaultValue = null;
            if (isset($tsSettings['defaultRenderer'])) $defaultValue = $tsSettings['defaultRenderer'];

            $identifier['ext-wsslider-extendSheets'] = false;
            if ($defaultValue !== null) {
                $identifier['ext-wsslider-extendSheets'] = $defaultValue;
            }
            if (
                isset($row['tx_wsslider_renderer']) && $row['tx_wsslider_renderer'] !== ''
            ) {
                $identifier['ext-wsslider-extendSheets'] = $row['tx_wsslider_renderer'];
            }

            $event->setIdentifier($identifier);
        }
        if ($event->getTableName() === 'tx_wsslider_domain_model_preset' && $row['type'] !== '') {

            $pageTs = BackendUtility::getPagesTSconfig($row['pid']);
            $identifier = [
                'type' => 'tca',
                'tableName' => 'tx_wsslider_domain_model_preset',
                'fieldName' => $row['type'],
                'dataStructureKey' => 'default',
                'pageTs' => ($pageTs['tx_wsslider.'] ?? []),
            ];

            $event->setIdentifier($identifier);
        }
    }


    public function setDataStructure(BeforeFlexFormDataStructureParsedEvent $event): void
    {
        $identifier = $event->getIdentifier();
        $dataStructure = $event->getDataStructure();

        $rendererKey = null;

        if (isset($identifier['ext-wsslider-extendSheets']) && $identifier['ext-wsslider-extendSheets'] !== false) {
            $rendererKey = $identifier['ext-wsslider-extendSheets'];
        }
        if (($identifier['tableName'] ?? '') === 'tx_wsslider_domain_model_preset') {
            $rendererKey = $identifier['fieldName'];
        }

        if ($rendererKey !== null) {
            try {

                if ($dataStructure === null) {
                    $dataStructure = [];
                }

                $newSheets = $this->getRendererSheets($rendererKey);
                ArrayUtility::mergeRecursiveWithOverrule(
                    $dataStructure,
                    $newSheets
                );
                $dataStructureCopy = $dataStructure;

                if (isset($dataStructure['sheets']['responsive.dummy'])) {

                    foreach ($identifier['pageTs']['responsiveBreakpoints.'] ?? [] as $bpPixel => $bpName) {

                        $newSheet = $dataStructure['sheets']['responsive.dummy'];
                        $newSheet['ROOT']['TCEforms']['sheetTitle'] = 'Responsive > '.$bpPixel;

                        foreach ($newSheet['ROOT']['el'] as $fieldName => $field) {

                            $field['TCEforms']['config']['typoscriptPath'] = str_replace('dummy',(string)$bpPixel,$field['TCEforms']['config']['typoscriptPath']);
                            $newSheet['ROOT']['el'][str_replace('dummy',(string)$bpPixel,$fieldName)] = $field;
                            unset($newSheet['ROOT']['el'][$fieldName]);
                        }
                        $dataStructureCopy['sheets']['responsive.'.$bpPixel] = $newSheet;
                    }
                    unset($dataStructureCopy['sheets']['responsive.dummy']);
                }

                $dataStructure = $dataStructureCopy;

            } catch (NoSuchFileException|ParseErrorException $e) {
                $this->addInvalidFrameworkConfigurationFlashMessage($e);
            }
            $event->setDataStructure($dataStructure);
        }
    }

    /**
     * Returns additional flexform sheets with finisher fields
     *
     * @param string $renderer
     * @return array
     */
    protected function getRendererSheets(string $renderer): array
    {
        $file = GeneralUtility::getFileAbsFileName('EXT:ws_slider/Configuration/FlexForm/Renderer/' . ucfirst($renderer) . '.xml');
        if (file_exists($file)) {
            $xml = file_get_contents($file);
            return GeneralUtility::xml2array($xml);
        }
        return [];
    }


    /**
     * @param \Exception $e
     */
    protected function addInvalidFrameworkConfigurationFlashMessage(\Exception $e)
    {
        $messageText = sprintf(
            $this->getLanguageService()->sL(self::L10N_PREFIX . 'tt_content.preview.invalidFrameworkConfiguration.text'),
            $e->getMessage()
        );

        GeneralUtility::makeInstance(FlashMessageService::class)
            ->getMessageQueueByIdentifier('core.template.flashMessages')
            ->enqueue(
                GeneralUtility::makeInstance(
                    FlashMessage::class,
                    $messageText,
                    $this->getLanguageService()->sL(self::L10N_PREFIX . 'tt_content.preview.invalidFrameworkConfiguration.title'),
                    AbstractMessage::ERROR,
                    true
                )
            );
    }

    /**
     * @param string $persistenceIdentifier
     * @param string $prototypeName
     * @param string $formIdentifier
     * @param string $finisherIdentifier
     * @return string
     */
    protected function buildFlexformSheetIdentifier(
        string $persistenceIdentifier,
        string $prototypeName,
        string $formIdentifier,
        string $finisherIdentifier
    ): string
    {
        return md5(
            implode('', [
                $persistenceIdentifier,
                $prototypeName,
                $formIdentifier,
                $finisherIdentifier
            ])
        );
    }

    /**
     * @param string $finisherIdentifier
     * @param array $finishersDefinition
     * @param array $prototypeConfiguration
     * @return array
     */
    protected function translateFinisherDefinitionByIdentifier(
        string $finisherIdentifier,
        array  $finishersDefinition,
        array  $prototypeConfiguration
    ): array
    {
        if (isset($finishersDefinition[$finisherIdentifier]['FormEngine']['translationFile'])) {
            $translationFile = $finishersDefinition[$finisherIdentifier]['FormEngine']['translationFile'];
        } else {
            $translationFile = $prototypeConfiguration['formEngine']['translationFile'];
        }

        $finishersDefinition[$finisherIdentifier]['FormEngine'] = GeneralUtility::makeInstance(TranslationService::class)->translateValuesRecursive(
            $finishersDefinition[$finisherIdentifier]['FormEngine'],
            $translationFile
        );

        return $finishersDefinition;
    }

    /**
     * @return LanguageService
     */
    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
