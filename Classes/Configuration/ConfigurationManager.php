<?php
declare(strict_types = 1);

namespace WapplerSystems\WsSlider\Configuration;


class ConfigurationManager extends \TYPO3\CMS\Extbase\Configuration\ConfigurationManager
{

    protected function initializeConcreteConfigurationManager(): void
    {
        $this->concreteConfigurationManager = $this->objectManager->get(BackendConfigurationManager::class);
    }

}
