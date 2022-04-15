<?php


namespace WapplerSystems\WsSlider\Backend\Form\FormDataProvider;


use TYPO3\CMS\Backend\Form\FormDataProviderInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;

class TcaSelectItemsEnhancer implements FormDataProviderInterface
{

    /**
     * @inheritDoc
     */
    public function addData(array $result)
    {

        $table = $result['tableName'];


        foreach ($result['processedTca']['columns'] as $fieldName => $fieldConfig) {
            if (empty($fieldConfig['config']['type']) || $fieldConfig['config']['type'] !== 'select') {
                continue;
            }

            if (isset($result['pageTsConfig']['TCEFORM.'][$table . '.'][$fieldName . '.']['placeholder'])) {
                $result['processedTca']['columns'][$fieldName]['config']['placeholder'] = $result['pageTsConfig']['TCEFORM.'][$table . '.'][$fieldName . '.']['placeholder'];
            }

        }

        return $result;
    }


    private function getTypoScriptSettings()
    {
        return GeneralUtility::makeInstance(ObjectManager::class)
                ->get(ConfigurationManagerInterface::class)
                ->getConfiguration(
                    ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT
                )['plugin.']['tx_gomapsext.']['settings.'] ?? [];
    }

}
