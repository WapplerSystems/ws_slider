<?php

namespace WapplerSystems\WsSlider\Hooks;
use TYPO3\CMS\Core\DataHandling\DataHandler;

final class DataHandlerHook
{

    public function processDatamap_afterDatabaseOperations(
        string $status,
        string $table,
        int|string $id,
        array $fieldArray,
        DataHandler $dataHandler
    ): void {
        if ($table !== 'tx_wsslider_domain_model_preset') {
            return;
        }

        $datamap = $dataHandler->datamap['tx_wsslider_domain_model_preset'] ?? [];


    }

}
