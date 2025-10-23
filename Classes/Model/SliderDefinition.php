<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\Model;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\View\ViewFactoryData;
use TYPO3\CMS\Core\View\ViewFactoryInterface;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

#[Autoconfigure(public: true, shared: false)]
class SliderDefinition
{


    private string $javascript = '';

    private array $configuration = [];

    public function __construct(
        private readonly ViewFactoryInterface $viewFactory
    ) {}

    public function render(?ServerRequestInterface $request = null): string
    {
        /**
         * @var ContentObjectRenderer $currentContentObject
         */
        $currentContentObject = $request->getAttribute('currentContentObject');

        $viewFactoryData = new ViewFactoryData(
            templateRootPaths: ['EXT:ws_slider/Resources/Private/Templates/'],
            partialRootPaths: ['EXT:ws_slider/Resources/Private/Partials/'],
            layoutRootPaths: ['EXT:ws_slider/Resources/Private/Layouts/'],
            request: $request,
        );
        $view = $this->viewFactory->create($viewFactoryData);

        $view->assignMultiple($this->configuration);
        $view->assign('inlineJavascript', $this->javascript);
        $view->assign('data', $currentContentObject->data);

        return $view->render('Slider.html');
    }

    public function setJavaScript($javascript): void
    {
        $this->javascript = $javascript;
    }

    public function getConfiguration(): array
    {
        return $this->configuration;
    }

    public function setConfiguration(array $configuration): void
    {
        $this->configuration = $configuration;
    }

    public function setIdentifier(string $identifier)
    {
        $this->configuration['identifier'] = $identifier;
    }


}
