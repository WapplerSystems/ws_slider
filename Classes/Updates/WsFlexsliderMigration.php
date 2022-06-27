<?php

declare(strict_types=1);

namespace WapplerSystems\WsSlider\Updates;

use Doctrine\DBAL\Driver\Statement;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Restriction\BackendWorkspaceRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\EndTimeRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\FrontendGroupRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\FrontendWorkspaceRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\HiddenRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\StartTimeRestriction;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Install\Updates\ConfirmableInterface;
use TYPO3\CMS\Install\Updates\Confirmation;
use TYPO3\CMS\Install\Updates\DatabaseUpdatedPrerequisite;
use TYPO3\CMS\Install\Updates\UpgradeWizardInterface;


class WsFlexsliderMigration implements UpgradeWizardInterface, ConfirmableInterface
{
    /**
     * @var Confirmation
     */
    protected $confirmation;

    public function __construct()
    {
        $this->confirmation = new Confirmation(
            'Please make sure to read the following carefully:',
            $this->getDescription(),
            false,
            'Yes, I understand!',
            '',
            true
        );
    }

    /**
     * @return string Unique identifier of this updater
     */
    public function getIdentifier(): string
    {
        return 'wssliderWsflexsliderImport';
    }

    /**
     * @return string Title of this updater
     */
    public function getTitle(): string
    {
        return 'ws_slider: Import ws_flexslider';
    }

    /**
     * @return string Longer description of this updater
     */
    public function getDescription(): string
    {
        return 'Converts ws_flexslider elements to ws_slider.';
    }

    /**
     *
     * @return bool Whether an update is required (TRUE) or not (FALSE)
     */
    public function updateNecessary(): bool
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('tt_content');
        $queryBuilder->getRestrictions()->removeByType(HiddenRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(StartTimeRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(EndTimeRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(BackendWorkspaceRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(FrontendGroupRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(FrontendWorkspaceRestriction::class);
        $count = $queryBuilder->count('uid')
            ->from('tt_content')
            ->where($queryBuilder->expr()->eq('list_type', $queryBuilder->createNamedParameter('wsflexslider_pi1')))
            ->execute()->fetchColumn(0);
        return $count > 0;
    }

    /**
     * @return string[] All new fields and tables must exist
     */
    public function getPrerequisites(): array
    {
        return [
            DatabaseUpdatedPrerequisite::class,
        ];
    }

    /**
     * This upgrade wizard has informational character only, it does not perform actions.
     *
     * @return bool Whether everything went smoothly or not
     */
    public function executeUpdate(): bool
    {


        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('tt_content');
        $queryBuilder
            ->update('tt_content')
            ->where(
                $queryBuilder->expr()->and(
                    $queryBuilder->expr()->eq('list_type', $queryBuilder->createNamedParameter('wsflexslider_pi1')),
                    $queryBuilder->expr()->eq('CType', $queryBuilder->createNamedParameter('list'))
                )
            )
            ->set('list_type', '')
            ->set('CType', 'ws_slider')
            ->set('tx_wsslider_renderer', 'flexslider')
            ->executeStatement();


        $flexsliderStatement = $this->loadFlexsliderRecords();
        while ($row = $flexsliderStatement->fetch()) {


            $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('tx_wsslider_domain_model_item');
            $affectedRows = $queryBuilder
                ->insert('tx_wsslider_domain_model_item')
                ->values([
                    'uid' => $row['uid'],
                    'pid' => $row['pid'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'link' => $row['link'],
                    'text_position' => $row['textposition'],
                    'style_class' => $row['styleclass'],
                    'content_uid' => $row['content_uid'],
                    'tstamp' => $row['tstamp'],
                    'crdate' => $row['crdate'],
                    'cruser_id' => $row['cruser_id'],
                    'deleted' => $row['deleted'],
                    'hidden' => $row['hidden'],
                    'starttime' => $row['starttime'],
                    'endtime' => $row['endtime'],
                    'sorting' => $row['sorting'],
                    't3_origuid' => $row['t3_origuid'],
                    'sys_language_uid' => $row['sys_language_uid'],
                    'l10n_parent' => $row['l10n_parent'],
                    'foreground_media' => $row['fal_image'],
                    'l10n_state' => $row['l10n_state'],
                ])
                ->executeStatement();

        }


        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_reference');
        $queryBuilder
            ->update('sys_file_reference')
            ->where(
                $queryBuilder->expr()->and(
                    $queryBuilder->expr()->eq('tablenames', $queryBuilder->createNamedParameter('tx_wsflexslider_domain_model_image')),
                    $queryBuilder->expr()->eq('fieldname', $queryBuilder->createNamedParameter('fal_image'))
                )
            )
            ->set('tablenames', 'tx_wsslider_domain_model_item')
            ->set('fieldname', 'foreground_media')
            ->executeStatement();

        return true;
    }


    /**
     * Return a confirmation message instance
     *
     * @return Confirmation
     */
    public function getConfirmation(): Confirmation
    {
        return $this->confirmation;
    }



    protected function loadFlexsliderRecords(): Statement
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('tx_wsflexslider_domain_model_image');
        $queryBuilder->getRestrictions()->removeByType(HiddenRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(StartTimeRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(EndTimeRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(BackendWorkspaceRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(FrontendGroupRestriction::class);
        $queryBuilder->getRestrictions()->removeByType(FrontendWorkspaceRestriction::class);
        $queryBuilder->select('*')->from('tx_wsflexslider_domain_model_image');
        return $queryBuilder->execute();
    }


}
