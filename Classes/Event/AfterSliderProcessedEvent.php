<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\Event;

use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

final class AfterSliderProcessedEvent
{
    public function __construct(
        private readonly ContentObjectRenderer $cObj,
        private readonly array $contentObjectConfiguration,
        private readonly array $processorConfiguration,
        private array $processedData
    ) {
    }

    public function getCObj(): ContentObjectRenderer
    {
        return $this->cObj;
    }

    public function getContentObjectConfiguration(): array
    {
        return $this->contentObjectConfiguration;
    }

    public function getProcessorConfiguration(): array
    {
        return $this->processorConfiguration;
    }

    public function getProcessedData(): array
    {
        return $this->processedData;
    }

    public function setProcessedData(array $processedData): void
    {
        $this->processedData = $processedData;
    }
}
