<?php
namespace WapplerSystems\WsSlider\Service;


use Exception;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Cache\Frontend\PhpFrontend;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Error\Http\AbstractServerErrorException;
use TYPO3\CMS\Core\Exception\SiteNotFoundException;
use TYPO3\CMS\Core\Http\PropagateResponseException;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Site\Entity\NullSite;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Core\Site\Set\SetRegistry;
use TYPO3\CMS\Core\Site\SiteFinder;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\TypoScript\FrontendTypoScriptFactory;
use TYPO3\CMS\Core\TypoScript\IncludeTree\SysTemplateRepository;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\RootlineUtility;


class TypoScriptService
{
    /**
     * @var RootNode
     */
    protected static RootNode $typoScript;


    public function __construct(readonly FrontendTypoScriptFactory $frontendTypoScriptFactory,
                                readonly SysTemplateRepository $sysTemplateRepository,
                                #[Autowire(service: 'cache.runtime')]
                                private FrontendInterface $runtimeCache,
                                private SetRegistry $setRegistry,
                                #[Autowire(service: 'cache.typoscript')]
                                private PhpFrontend $typoScriptCache,
    )
    {

    }

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
    public function getTypoScript(int $pageUid, ?ServerRequest $request = null, int $languageUid = 0, array $rootLine = [], ?Site $site = null): array
    {
        $cacheIdentifier = 'extbase-backend-typoscript-pageId-' . $pageUid;
        $setupArray = $this->runtimeCache->get($cacheIdentifier);
        if (is_array($setupArray)) {
            return $setupArray;
        }

        if ($site === null) {
            // If still no site object, have NullSite (usually pid 0).
            $site = new NullSite();
        }

        $rootLine = [];
        $sysTemplateRows = [];
        $sysTemplateFakeRow = [
            'uid' => 0,
            'pid' => 0,
            'title' => 'Fake sys_template row to force extension statics loading',
            'root' => 1,
            'clear' => 3,
            'include_static_file' => '',
            'basedOn' => '',
            'includeStaticAfterBasedOn' => 0,
            'static_file_mode' => false,
            'constants' => '',
            'config' => '',
            'deleted' => 0,
            'hidden' => 0,
            'starttime' => 0,
            'endtime' => 0,
            'sorting' => 0,
        ];
        if ($pageUid > 0) {
            $rootLine = GeneralUtility::makeInstance(RootlineUtility::class, $pageUid)->get();
            $sysTemplateRows = $this->sysTemplateRepository->getSysTemplateRowsByRootline($rootLine, $request);
            ksort($rootLine);
        }

        $sets = $site instanceof Site ? $this->setRegistry->getSets(...$site->getSets()) : [];
        if (empty($sysTemplateRows) && $sets === []) {
            // If there is no page (pid 0 only), or if the first 'is_siteroot' site has no sys_template record or assigned site sets,
            // then we "fake" a sys_template row: This triggers inclusion of 'global' and 'extension static' TypoScript.
            $sysTemplateRows[] = $sysTemplateFakeRow;
        }

        $expressionMatcherVariables = [
            'request' => $request,
            'pageId' => $pageUid,
            'page' => !empty($rootLine) ? $rootLine[array_key_first($rootLine)] : [],
            'fullRootLine' => $rootLine,
            'site' => $site,
        ];

        $typoScript = $this->frontendTypoScriptFactory->createSettingsAndSetupConditions($site, $sysTemplateRows, $expressionMatcherVariables, $this->typoScriptCache);
        $typoScript = $this->frontendTypoScriptFactory->createSetupConfigOrFullSetup(true, $typoScript, $site, $sysTemplateRows, $expressionMatcherVariables, '0', $this->typoScriptCache, null);
        $setupArray = $typoScript->getSetupArray();
        $this->runtimeCache->set($cacheIdentifier, $setupArray);
        return $setupArray;
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
