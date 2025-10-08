<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\ViewHelpers;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Utility\DebugUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\RequestInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use WapplerSystems\WsSlider\Factory\ArraySliderFactory;
use WapplerSystems\WsSlider\Factory\SliderFactoryInterface;


final class RenderViewHelper extends AbstractViewHelper
{
    /**
     * @var bool
     */
    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        $this->registerArgument('renderer', 'string', 'The renderer.');
        $this->registerArgument('factoryClass', 'string', 'The fully qualified class name of the factory', false);
        $this->registerArgument('parameters', 'array', 'factory specific configuration', false, []);
        $this->registerArgument('items', 'array', 'The items', false, []);
        $this->registerArgument('layout', 'string', 'Custom layout', false, 'Default');
    }

    public function render(): ?string
    {
        $renderer = $this->arguments['renderer'];
        /** @var RequestInterface $request */
        $request = $this->renderingContext->getAttribute(ServerRequestInterface::class);

        if ($this->arguments['factoryClass'] === null) {
            if (GeneralUtility::getContainer()->has('WapplerSystems\WsSlider\Factory\\'.$renderer.'Factory')) {
                $this->arguments['factoryClass'] = 'WapplerSystems\WsSlider\Factory\\' . $renderer . 'Factory';
            } else {
                $this->arguments['factoryClass'] = ArraySliderFactory::class;
            }

            $overrideConfiguration = [
                'renderer' => $renderer,
                'parameters' => $this->arguments['parameters'],
                'items' => $this->arguments['items'],
                'layout' => $this->arguments['layout'],
            ];

        } else {

            $overrideConfiguration = [
                'renderer' => $renderer,
                'parameters' => $this->arguments['parameters'],
                'items' => $this->arguments['items'],
                'layout' => $this->arguments['layout'],
            ];
        }

        /** @var SliderFactoryInterface $factory */
        $factory = GeneralUtility::getContainer()->get($this->arguments['factoryClass']);
        $sliderDefinition = $factory->build($overrideConfiguration, $request);
        return $sliderDefinition->render($request);
    }
}
