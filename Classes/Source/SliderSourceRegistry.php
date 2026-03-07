<?php

declare(strict_types=1);

namespace WapplerSystems\WsSlider\Source;

use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;

/**
 */
class SliderSourceRegistry
{
    /**
     * @var SliderSourceInterface[] Registered sources
     */
    protected array $sources = [];

    public function __construct(
        #[AutowireIterator('wsslider.source')]
        iterable $sources
    ) {
        foreach ($sources as $source) {
            $this->sources[get_class($source)] = $source;
        }
    }

    public function hasSources(): bool
    {
        return !empty($this->sources);
    }

    /**
     * Get all registered tools
     *
     * @return SliderSourceInterface[]
     */
    public function getSources(): array
    {
        return $this->sources;
    }

    /**
     * Get a specific tool by name
     */
    public function getSource(string $className): ?SliderSourceInterface
    {
        return $this->sources[$className] ?? null;
    }
}
