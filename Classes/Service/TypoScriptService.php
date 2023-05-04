<?php
namespace WapplerSystems\WsSlider\Service;


use Exception;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Error\Http\AbstractServerErrorException;
use TYPO3\CMS\Core\Exception\SiteNotFoundException;
use TYPO3\CMS\Core\Http\PropagateResponseException;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Routing\PageArguments;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\RootlineUtility;
use TYPO3\CMS\Frontend\Authentication\FrontendUserAuthentication;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;


class TypoScriptService
{
    /**
     * @var RootNode
     */
    protected static RootNode $typoScript;

    /**
     * @param int $pageUid
     * @param int $languageUid
     * @param array $rootLine
     * @param Site|null $site
     * @return RootNode
     * @throws SiteNotFoundException
     * @throws AbstractServerErrorException
     * @throws PropagateResponseException
     */
    public static function getTypoScript(int $pageUid, int $languageUid = 0, array $rootLine = [], Site $site = null): RootNode
    {
        if (isset(self::$typoScript) && self::$typoScript !== null) {
            return self::$typoScript;
        }

        //
        // In case of executing by console, any request url must be available!
        $requestUrl = GeneralUtility::getIndpEnv('TYPO3_REQUEST_URL');
        if (is_string($requestUrl) && substr($requestUrl, 0, 8) === 'http:///') {
            GeneralUtility::setIndpEnv('TYPO3_REQUEST_URL', 'https://www.dummy.domain/');
        }
        //
        // Ensure the rootline is available
        if (count($rootLine) === 0) {
            /** @var RootlineUtility $rootlineUtility */
            $rootlineUtility = GeneralUtility::makeInstance(RootlineUtility::class, $pageUid);
            $rootLine = $rootlineUtility->get();
        }
        //
        // Ensure the site configuration is available
        if (!($site instanceof Site)) {
            /** @var SiteFinder $siteFinder */
            $siteFinder = GeneralUtility::makeInstance(SiteFinder::class);
            $site = $siteFinder->getSiteByPageId($pageUid);
        }
        //
        // Ensure TSFE is initialized, otherwise there might be some errors
        $unsetTSFE = false;
        if (!isset($GLOBALS['TSFE'])) {
            $unsetTSFE = true;
            $context = GeneralUtility::makeInstance(Context::class);
            $frontendUserAuthentication = GeneralUtility::makeInstance(FrontendUserAuthentication::class);
            $pageArguments = GeneralUtility::makeInstance(PageArguments::class, $pageUid, '', []);
            $typoScriptFrontendController = GeneralUtility::makeInstance(
                TypoScriptFrontendController::class,
                $context,
                $site,
                $site->getLanguageById($languageUid),
                $pageArguments,
                $frontendUserAuthentication
            );

            $GLOBALS['TSFE'] = $typoScriptFrontendController;
        }
        $typoScriptFrontendController = $GLOBALS['TSFE'];
        $typoScriptFrontendController->rootLine = $rootLine;

        $request = new ServerRequest();
        $request = $typoScriptFrontendController->getFromCache($request);

        $settingsTree = $request->getAttribute('frontend.typoscript')->getSetupTree();

        if ($unsetTSFE) {
            $GLOBALS['TSFE'] = null;
        }

        self::$typoScript = $settingsTree;
        return self::$typoScript;
    }

    public static function getTypoScriptValueByPath(array $tsArray, string $path) {
        $segments = GeneralUtility::trimExplode('.',$path);

        $lastSegment = array_pop($segments);
        foreach ($segments as $segment) {
            if (isset($tsArray[$segment.'.'])) {
                $tsArray = $tsArray[$segment.'.'];
            } else {
                return null;
            }
        }
        if (isset($tsArray[$lastSegment])) return $tsArray[$lastSegment];
        if (isset($tsArray[$lastSegment.'.'])) return $tsArray[$lastSegment.'.'];
        return null;
    }

    /**
     * @param string $basis Extension key underscored
     * @param string $pro Extension key underscored
     * @return array<string, mixed>
     * @throws Exception
     */
    public static function getTypoScriptPluginSettingsMerged(string $basis = '', string $pro = ''): array
    {
        $basis = strtolower($basis);
        $pro = strtolower(str_replace('_', '', $pro));
        if (self::$typoScript === null) {
            throw new Exception('TypoScript not found - please run TypoScriptService::getTypoScript!');
        }
        if (!isset(self::$typoScript['plugin']['tx_' . $basis]['settings'])) {
            throw new Exception('Base extension \'' . $basis . '\' settings not found!');
        }
        if (!isset(self::$typoScript['plugin']['tx_' . $pro]['settings'])) {
            throw new Exception('Pro extension \'' . $pro . '\' settings not found!');
        }
        return array_replace_recursive(
            self::$typoScript['plugin']['tx_' . $basis]['settings'],
            self::$typoScript['plugin']['tx_' . $pro]['settings']
        );
    }
}
