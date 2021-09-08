<?php
declare(strict_types = 1);

namespace WapplerSystems\WsSlider\Configuration;


use TYPO3\CMS\Core\Utility\GeneralUtility;

class ConfigurationManager extends \TYPO3\CMS\Extbase\Configuration\ConfigurationManager
{

    protected function initializeConcreteConfigurationManager(): void
    {
        $this->concreteConfigurationManager = GeneralUtility::makeInstance(BackendConfigurationManager::class);
    }

}
