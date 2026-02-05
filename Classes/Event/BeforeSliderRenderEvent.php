<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\Event;

use Psr\Http\Message\ServerRequestInterface;

final class BeforeSliderRenderEvent
{
    private array $configuration;
    private array $options;
    private string $javascript;

    public function __construct(
        private readonly ServerRequestInterface $request,
        array $configuration,
        array $options,
        string $javascript
    ) {
        $this->configuration = $configuration;
        $this->options = $options;
        $this->javascript = $javascript;
    }

    public function getRequest(): ServerRequestInterface
    {
        return $this->request;
    }

    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    public function setConfiguration(array $configuration): void
    {
        $this->configuration = $configuration;
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function setOptions(array $options): void
    {
        $this->options = $options;
    }

    public function getJavascript(): string
    {
        return $this->javascript;
    }

    public function setJavascript(string $javascript): void
    {
        $this->javascript = $javascript;
    }
}
