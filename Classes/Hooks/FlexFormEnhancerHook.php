<?php
declare(strict_types = 1);
namespace WapplerSystems\WsSlider\Hooks;

use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Messaging\AbstractMessage;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use TYPO3\CMS\Form\Mvc\Configuration\Exception\NoSuchFileException;
use TYPO3\CMS\Form\Mvc\Configuration\Exception\ParseErrorException;
use TYPO3\CMS\Form\Service\TranslationService;

/**
 *
 *
 * Scope: backend
 * @internal
 */
class FlexFormEnhancerHook
{

    /**
     * Localisation prefix
     */
    const L10N_PREFIX = 'LLL:EXT:ws_slider/Resources/Private/Language/locallang.xlf:';


    private function getTypoScriptSettings()
    {
        return GeneralUtility::makeInstance(ObjectManager::class)
                ->get(ConfigurationManagerInterface::class)
                ->getConfiguration(
                    ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT
                )['plugin.']['tx_wsslider.']['settings.'] ?? [];
    }

    /**
     * The data structure depends on a current form selection (persistenceIdentifier)
     * and if the field "overrideFinishers" is active. Add both to the identifier to
     * hand these information over to parseDataStructureByIdentifierPostProcess() hook.
     *
     * @param array $fieldTca Incoming field TCA
     * @param string $tableName Handled table
     * @param string $fieldName Handled field
     * @param array $row Current data row
     * @param array $identifier Already calculated identifier
     * @return array Modified identifier
     */
    public function getDataStructureIdentifierPostProcess(
        array $fieldTca,
        string $tableName,
        string $fieldName,
        array $row,
        array $identifier
    ): array {
        if ($tableName === 'tt_content' && $fieldName === 'pi_flexform' && $row['CType'] === 'ws_slider') {

            $tsSettings = $this->getTypoScriptSettings();
            $defaultValue = null;
            if (isset($tsSettings['defaultRenderer'])) $defaultValue = $tsSettings['defaultRenderer'];

            $identifier['ext-wsslider-extendSheets'] = false;
            if ($defaultValue !== null) {
                $identifier['ext-wsslider-extendSheets'] = $defaultValue;
            }
            if (
                isset($row['tx_wsslider_renderer']) && $row['tx_wsslider_renderer'] !== '' && $row['tx_wsslider_renderer'] !== null
            ) {
                $identifier['ext-wsslider-extendSheets'] = $row['tx_wsslider_renderer'];
            }
        }
        return $identifier;
    }

    /**
     * Returns a modified flexform data array.
     *
     * This adds the list of existing form definitions to the form selection drop down
     * and adds sheets to override finisher settings if requested.
     *
     * @param array $dataStructure
     * @param array $identifier
     * @return array
     */
    public function parseDataStructureByIdentifierPostProcess(array $dataStructure, array $identifier): array
    {

        if (isset($identifier['ext-wsslider-extendSheets']) && $identifier['ext-wsslider-extendSheets'] !== false) {
            try {

                $newSheets = $this->getAdditionalFinisherSheets($identifier['ext-wsslider-extendSheets']);
                ArrayUtility::mergeRecursiveWithOverrule(
                    $dataStructure,
                    $newSheets
                );

            } catch (NoSuchFileException $e) {
                $this->addInvalidFrameworkConfigurationFlashMessage($e);
            } catch (ParseErrorException $e) {
                $this->addInvalidFrameworkConfigurationFlashMessage($e);
            }
        }
        return $dataStructure;
    }

    /**
     * Returns additional flexform sheets with finisher fields
     *
     * @param string $persistenceIdentifier Current persistence identifier
     * @param array $formDefinition The form definition
     * @return array
     */
    protected function getAdditionalFinisherSheets(string $renderer): array
    {
        $file = GeneralUtility::getFileAbsFileName('EXT:ws_slider/Configuration/FlexForm/Renderer/'.ucfirst($renderer).'.xml');
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

        GeneralUtility::makeInstance(ObjectManager::class)
            ->get(FlashMessageService::class)
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
    ): string {
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
        array $finishersDefinition,
        array $prototypeConfiguration
    ): array {
        if (isset($finishersDefinition[$finisherIdentifier]['FormEngine']['translationFile'])) {
            $translationFile = $finishersDefinition[$finisherIdentifier]['FormEngine']['translationFile'];
        } else {
            $translationFile = $prototypeConfiguration['formEngine']['translationFile'];
        }

        $finishersDefinition[$finisherIdentifier]['FormEngine'] = TranslationService::getInstance()->translateValuesRecursive(
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
