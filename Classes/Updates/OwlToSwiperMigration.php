<?php

declare(strict_types=1);

namespace WapplerSystems\WsSlider\Updates;

use Doctrine\DBAL\Exception;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Install\Attribute\UpgradeWizard;
use TYPO3\CMS\Install\Updates\ConfirmableInterface;
use TYPO3\CMS\Install\Updates\Confirmation;
use TYPO3\CMS\Install\Updates\DatabaseUpdatedPrerequisite;
use TYPO3\CMS\Install\Updates\UpgradeWizardInterface;

/**
 * Migrates ws_slider content elements from the dropped Owl renderer
 * to Swiper. An element counts as "Owl" only when
 * tt_content.tx_wsslider_renderer = 'owl'.
 *
 * Do NOT widen this to pi_flexform LIKE '%<sheet index="owl">%':
 * FormEngine persists a sheet for every renderer it knows, so an
 * (empty) owl sheet sits in virtually every ws_slider record -
 * including elements explicitly configured for Swiper, Flexslider,
 * Slick or TinySlider. Matching on it converted those elements to
 * Swiper and wiped their settings.
 *
 * Elements with an empty renderer column inherit their renderer from
 * plugin.tx_wsslider.settings.defaultRenderer, which is not visible
 * from the database. Sites whose default was 'owl' must set the
 * renderer explicitly before running this wizard - guessing would
 * destroy the configuration of correctly configured elements.
 *
 * The Owl-specific FlexForm sheet structure cannot be mapped 1:1
 * to Swiper, so pi_flexform is reset to NULL after migration.
 * tx_wsslider_layout is also reset to NULL because layout names
 * are not portable across renderers (e.g. an "Cards" layout that
 * only Owl provided would throw InvalidSectionException on Swiper).
 * Affected elements will fall back to Swiper defaults — review
 * each slider visually after running the wizard.
 */
#[UpgradeWizard('wsSliderOwlToSwiperMigration')]
class OwlToSwiperMigration implements UpgradeWizardInterface, ConfirmableInterface
{
    private const TARGET_RENDERER = 'swiper';

    protected Confirmation $confirmation;

    public function __construct()
    {
        $this->confirmation = new Confirmation(
            'Owl renderer was removed in ws_slider 13.3.0.',
            'This wizard converts every ws_slider content element whose '
                . 'renderer is set to Owl over to the Swiper renderer. '
                . 'Elements without an explicit renderer are not touched. Owl '
                . 'FlexForm settings cannot be mapped 1:1 to Swiper, so '
                . 'pi_flexform is reset to NULL — Swiper defaults will '
                . 'apply and you should review the affected sliders '
                . 'visually afterwards. The wizard is optional.',
            false,
            'Yes, migrate Owl to Swiper',
            'No thanks',
            false,
        );
    }

    public function getIdentifier(): string
    {
        return 'wsSliderOwlToSwiperMigration';
    }

    public function getTitle(): string
    {
        return 'ws_slider: Migrate Owl renderer to Swiper';
    }

    public function getDescription(): string
    {
        return 'The Owl Carousel renderer was dropped in ws_slider 13.3.0. '
            . 'This wizard converts existing ws_slider content elements '
            . 'whose renderer is set to Owl over to the Swiper renderer. The '
            . 'Owl-specific FlexForm settings are reset; Swiper defaults will '
            . 'be used. Elements without an explicit renderer are not touched: '
            . 'they inherit it from plugin.tx_wsslider.settings.defaultRenderer.';
    }

    public function getPrerequisites(): array
    {
        return [
            DatabaseUpdatedPrerequisite::class,
        ];
    }

    /**
     * @throws Exception
     */
    public function updateNecessary(): bool
    {
        return $this->countAffectedRows() > 0;
    }

    /**
     * @throws Exception
     */
    public function executeUpdate(): bool
    {
        $connection = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getConnectionForTable('tt_content');

        $connection->executeStatement(
            <<<SQL
                UPDATE tt_content
                   SET tx_wsslider_renderer = :renderer,
                       tx_wsslider_layout = NULL,
                       pi_flexform = NULL
                 WHERE CType = 'ws_slider'
                   AND tx_wsslider_renderer = 'owl'
            SQL,
            [
                'renderer' => self::TARGET_RENDERER,
            ],
        );

        return true;
    }

    public function getConfirmation(): Confirmation
    {
        return $this->confirmation;
    }

    /**
     * @throws Exception
     */
    private function countAffectedRows(): int
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('tt_content');
        $queryBuilder->getRestrictions()->removeAll();
        return (int)$queryBuilder
            ->count('uid')
            ->from('tt_content')
            ->where(
                $queryBuilder->expr()->eq(
                    'CType',
                    $queryBuilder->createNamedParameter('ws_slider'),
                ),
                $queryBuilder->expr()->eq(
                    'tx_wsslider_renderer',
                    $queryBuilder->createNamedParameter('owl'),
                ),
            )
            ->executeQuery()
            ->fetchOne();
    }
}