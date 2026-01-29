<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\ViewHelpers;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\RequestInterface;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use WapplerSystems\WsSlider\Factory\ArraySliderFactory;
use WapplerSystems\WsSlider\Factory\SliderFactoryInterface;
use WapplerSystems\WsSlider\Model\SliderDefinition;


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
                throw new \RuntimeException('No factory found for renderer "' . $renderer . '"', 1666544863);
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
        $prototype = GeneralUtility::makeInstance(SliderDefinition::class);

        /**
         * @var ContentObjectRenderer $currentContentObject
         */
        $currentContentObject = $request->getAttribute('currentContentObject');
        $identifier = 'slider_' . $currentContentObject->data['uid'];

        $sliderDefinition = $factory->build($overrideConfiguration, $prototype, $identifier, $request);
        $sliderDefinition->setIdentifier($identifier);
        return $sliderDefinition->render($request);
    }
}
