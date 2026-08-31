<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class SwiperFactory extends AbstractSliderFactory
{

    protected array $defaultOptions = [
        'init' => true,
    ];

    public function build(array $options, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {
        $jsOptions = $this->mergeOptions($options);

        ArrayUtility::mergeRecursiveWithOverrule($jsOptions, [
            'a11y' => [
                'enabled' => true,
                'prevSlideMessage' => $this->getParameter($options, 'a11y.prevSlideMessage'),
                'nextSlideMessage' => $this->getParameter($options, 'a11y.nextSlideMessage'),
                'firstSlideMessage' => $this->getParameter($options, 'a11y.firstSlideMessage'),
                'lastSlideMessage' => $this->getParameter($options, 'a11y.lastSlideMessage'),
                'paginationBulletMessage' => $this->getParameter($options, 'a11y.paginationBulletMessage'),
                'notificationClass' => 'swiper-notification',
                'containerMessage' => null,
                'containerRoleDescriptionMessage' => null,
                'itemRoleDescriptionMessage' => null,
                'slideLabelMessage' => $this->getParameter($options, 'a11y.slideLabelMessage'),
            ],
        ], true, false);

        if (!($jsOptions['hashNavigation']['enabled'] ?? false)) {
             unset($jsOptions['hashNavigation']);
        }
        if (!($jsOptions['freeMode']['enabled'] ?? false)) {
             unset($jsOptions['freeMode']);
        }
        if (!($jsOptions['virtual']['enabled'] ?? false)) {
             unset($jsOptions['virtual']);
        } else {
            unset($jsOptions['virtual']['enabled']);
        }
        if (!($jsOptions['zoom']['enabled'] ?? false)) {
             unset($jsOptions['zoom']);
        } else {
            unset($jsOptions['zoom']['enabled']);
        }
        if (!($jsOptions['pagination']['enabled'] ?? false)) {
             unset($jsOptions['pagination']);
        } else {
            unset($jsOptions['pagination']['enabled']);
        }
        if (!($jsOptions['scrollbar']['enabled'] ?? false)) {
             unset($jsOptions['scrollbar']);
        } else {
            unset($jsOptions['scrollbar']['enabled']);
        }
        if (!($jsOptions['autoplay']['active'] ?? false)) {
             unset($jsOptions['autoplay']);
        }

        if (empty($jsOptions['navigation']['nextEl'])) {
            $jsOptions['navigation']['nextEl'] = '#'.$identifier.'__swiper-button-next';
        }
        if (empty($jsOptions['navigation']['prevEl'])) {
            $jsOptions['navigation']['prevEl'] = '#'.$identifier.'__swiper-button-prev';
        }


        $this->sliderPrototype->setOptions($jsOptions);

        // Template-only flag - Swiper itself must not receive it as an option.
        $autoplayProgress = (bool)($jsOptions['autoplayProgress'] ?? false);
        unset($jsOptions['customClasses'], $jsOptions['autoplayProgress']);

        $jsOptions = $this->js_encode($jsOptions);
        $js = '';
        $onOptions = '';
        if ($autoplayProgress) {
            $js .= <<<JS
    const progressCircle_{$identifier} = document.querySelector("#{$identifier} .autoplay-progress svg");
    const progressContent_{$identifier} = document.querySelector("#{$identifier} .autoplay-progress span");
JS;

            $onOptions = <<<JS
options_{$identifier} = { ...options_{$identifier}, on: {
    autoplayTimeLeft(s, time, progress) {
        progressCircle_{$identifier}.style.setProperty("--progress", 1 - progress);
        progressContent_{$identifier}.textContent = `\${Math.ceil(time / 1000)}s`;
    }
} };
JS;
        }

        $js .= <<<JS
let options_{$identifier} = {$jsOptions};
{$onOptions}
if (options_{$identifier}.debug) {
    console.debug(options_{$identifier});
}
const {$identifier} = new Swiper('#{$identifier}', options_{$identifier});
JS;

        $this->sliderPrototype->setJavaScript($js);


        return $this->sliderPrototype;
    }
}
