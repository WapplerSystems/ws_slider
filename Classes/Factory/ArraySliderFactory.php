<?php

declare(strict_types=1);


namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Form\Domain\Configuration\ConfigurationService;
use TYPO3\CMS\Form\Domain\Exception\IdentifierNotValidException;
use TYPO3\CMS\Form\Domain\Exception\RenderingException;
use TYPO3\CMS\Form\Domain\Exception\UnknownCompositRenderableException;
use TYPO3\CMS\Form\Domain\Model\FormDefinition;
use TYPO3\CMS\Form\Domain\Model\FormElements\AbstractSection;
use TYPO3\CMS\Form\Domain\Model\Renderable\CompositeRenderableInterface;
use WapplerSystems\WsSlider\Model\SliderDefinition;

/**
 * A factory that creates a FormDefinition from an array
 *
 * Scope: frontend / backend
 */
#[Autoconfigure(public: true, shared: false)]
class ArraySliderFactory extends AbstractSliderFactory
{
    /**
     * Build a form definition, depending on some configuration.
     *
     * @throws RenderingException
     * @internal
     */
    public function build(
        array $configuration,
        SliderDefinition $slider,
        string $identifier,
        ?ServerRequestInterface $request = null
    ): SliderDefinition {



        return $slider;
    }

    /**
     * Add form elements to the $parentRenderable
     *
     * @return mixed
     * @throws IdentifierNotValidException
     * @throws UnknownCompositRenderableException
     */
    protected function addNestedRenderable(
        array $nestedRenderableConfiguration,
        CompositeRenderableInterface $parentRenderable,
        ?ServerRequestInterface $request = null
    ) {
        if (!isset($nestedRenderableConfiguration['identifier'])) {
            throw new IdentifierNotValidException('Identifier not set.', 1329289436);
        }
        if ($parentRenderable instanceof FormDefinition) {
            $renderable = $parentRenderable->createPage($nestedRenderableConfiguration['identifier'], $nestedRenderableConfiguration['type']);
        } elseif ($parentRenderable instanceof AbstractSection) {
            $renderable = $parentRenderable->createElement($nestedRenderableConfiguration['identifier'], $nestedRenderableConfiguration['type']);
            if ($request !== null && method_exists($renderable, 'setRequest')) {
                $renderable->setRequest($request);
            }
        } else {
            throw new UnknownCompositRenderableException('Unknown composit renderable "' . get_class($parentRenderable) . '"', 1479593622);
        }

        if (isset($nestedRenderableConfiguration['renderables']) && is_array($nestedRenderableConfiguration['renderables'])) {
            $childRenderables = $nestedRenderableConfiguration['renderables'];
        } else {
            $childRenderables = [];
        }

        unset($nestedRenderableConfiguration['type']);
        unset($nestedRenderableConfiguration['identifier']);
        unset($nestedRenderableConfiguration['renderables']);

        $renderable->setOptions($nestedRenderableConfiguration);

        if ($renderable instanceof CompositeRenderableInterface) {
            foreach ($childRenderables as $elementConfiguration) {
                $this->addNestedRenderable($elementConfiguration, $renderable, $request);
            }
        }

        return $renderable;
    }
}
