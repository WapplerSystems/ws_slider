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
 * to Swiper. Detects two cases:
 *   - tt_content.tx_wsslider_renderer = 'owl'
 *   - tt_content.pi_flexform contains <sheet index="owl"> (legacy
 *     records where the renderer column was never populated and
 *     the renderer was inferred from the FlexForm sheet)
 *
 * The Owl-specific FlexForm sheet structure cannot be mapped 1:1
 * to Swiper, so the FlexForm is reset to NULL after migration.
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
            'Owl renderer was removed in ws_slider v14.',
            'This wizard converts every ws_slider content element that '
                . 'still references the Owl renderer (either via the '
                . 'tx_wsslider_renderer column or via a <sheet index="owl"> '
                . 'block in pi_flexform) to the Swiper renderer. Owl '
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
        return 'The Owl Carousel renderer was dropped in ws_slider v14. '
            . 'This wizard converts existing ws_slider content elements '
            . 'configured for Owl to the Swiper renderer. The Owl-specific '
            . 'FlexForm settings are reset; Swiper defaults will be used.';
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

        // Match either renderer column = 'owl' or pi_flexform contains
        // an owl sheet. Use raw SQL so we can apply both criteria with
        // OR in a single UPDATE.
        $connection->executeStatement(
            <<<SQL
                UPDATE tt_content
                   SET tx_wsslider_renderer = :renderer,
                       pi_flexform = NULL
                 WHERE CType = 'ws_slider'
                   AND (
                        tx_wsslider_renderer = 'owl'
                        OR pi_flexform LIKE :flexformPattern
                       )
            SQL,
            [
                'renderer' => self::TARGET_RENDERER,
                'flexformPattern' => '%<sheet index="owl">%',
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
                $queryBuilder->expr()->or(
                    $queryBuilder->expr()->eq(
                        'tx_wsslider_renderer',
                        $queryBuilder->createNamedParameter('owl'),
                    ),
                    $queryBuilder->expr()->like(
                        'pi_flexform',
                        $queryBuilder->createNamedParameter('%<sheet index="owl">%'),
                    ),
                ),
            )
            ->executeQuery()
            ->fetchOne();
    }
}