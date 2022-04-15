<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\Configuration;


use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Extbase\Object\ObjectManagerInterface;
use TYPO3\CMS\Extbase\Service\EnvironmentService;

class BackendConfigurationManager extends \TYPO3\CMS\Extbase\Configuration\BackendConfigurationManager
{

    public function __construct(ObjectManagerInterface $objectManager, TypoScriptService $typoScriptService, EnvironmentService $environmentService)
    {
        if (version_compare(TYPO3_version, '11.0.0', '>=')) {
            parent::__construct($typoScriptService);
        } else if (version_compare(TYPO3_version, '10.0.0', '>=')) {
            parent::__construct($objectManager, $typoScriptService, $environmentService);
        }

        // extract page id from returnUrl GET parameter
        if (isset($_GET['returnUrl'])) {
            $url = parse_url($_GET['returnUrl']);
            parse_str($url['query'] ?? '', $params);
            $pageId = $params['id'] ?? -1;
            if ($pageId !== -1) $this->currentPageId = (int)$pageId;
        }
    }


}
