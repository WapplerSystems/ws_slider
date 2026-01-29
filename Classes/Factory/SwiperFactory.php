<?php

namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

#[Autoconfigure(public: true, shared: false)]
class SwiperFactory extends AbstractSliderFactory
{

    public function build(array $configuration, SliderDefinition $slider, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {
        $slider->setConfiguration($configuration);

        $options = [
            'init' => true,
            'direction' => 'horizontal',
            'oneWayMovement' => false,
            'touchEventsTarget' => 'wrapper',
            'initialSlide' => 0,
            'speed' => 300,
            'cssMode' => false,
            'updateOnWindowResize' => true,
            'resizeObserver' => true,
            'observeParents' => false,
            'observeSlideChildren' => false,
            'width' => null,
            'height' => null,
            'preventInteractionOnTransition' => false,
            'userAgent' => null,
            'url' => null,
            'edgeSwipeDetection' => false,
            'edgeSwipeThreshold' => 20,
            'freeMode' => false,
            'freeModeMomentum' => true,
            'freeModeMomentumRatio' => 1,
            'freeModeMomentumBounce' => true,
            'freeModeMomentumBounceRatio' => 1,
            'freeModeMinimumVelocity' => 0.02,
            'freeModeSticky' => false,
            'autoHeight' => false,
            'setWrapperSize' => false,
            'virtualTranslate' => false,
            'effect' => 'slide',
            'breakpoints' => [],
            'breakpointsBase' => 'window',
            'spaceBetween' => 0,
            'slidesPerView' => 1,
            'slidesPerGroup' => 1,
            'slidesPerGroupSkip' => 0,
            'slidesPerGroupAuto' => false,
            'centeredSlides' => false,
            'centeredSlidesBounds' => false,
            'slidesOffsetBefore' => 0,
            'slidesOffsetAfter' => 0,
            'normalizeSlideIndex' => false,
            'centerInsufficientSlides' => false,
            'slidesPerColumn' => 1,
            'slidesPerColumnFill' => 'column',
            'roundLengths' => false,
            'touchRatio' => 1,
            'touchAngle' => 45,
            'simulateTouch' => true,
            'shortSwipes' => true,
            'longSwipes' => true,
            'longSwipesRatio' => 0.5,
            'longSwipesMs' => 300,
            'followFinger' => true,
            'allowTouchMove' => true,
            'threshold' => 0,
            'touchMoveStopPropagation' => false,
            'touchStartPreventDefault' => true,
            'touchStartForcePreventDefault' => false,
            'touchReleaseOnEdges' => false,
            'uniqueNavElements' => true,
            'watchSlidesProgress' => false,
            'watchSlidesVisibility' => false,
            'grabCursor' => false,
            'preventClicks' => true,
            'preventClicksPropagation' => true,
            'slideToClickedSlide' => false,
            'preloadImages' => true,
            'updateOnImagesReady' => true,
            'loop' => false,
            'loopAdditionalSlides' => 0,
            'loopedSlides' => null,
            'loopFillGroupWithBlank' => false,
            'loopPreventsSlide' => true,
            'rewind' => false,
            'allowSlidePrev' => true,
            'allowSlideNext' => true,
            'swipeHandler' => null,
            'noSwiping' => true,
            'noSwipingClass' => 'swiper-no-swiping',
            'noSwipingSelector' => null,
            'passiveListeners' => true,
            'containerModifierClass' => 'swiper-container-',
            'slideClass' => 'swiper-slide',
            'slideActiveClass' => 'swiper-slide-active',
            'slideVisibleClass' => 'swiper-slide-visible',
            'slideNextClass' => 'swiper-slide-next',
            'slidePrevClass' => 'swiper-slide-prev',
            'wrapperClass' => 'swiper-wrapper',
            'runCallbacksOnInit' => true,
            'observer' => false,
            'a11y' => [
                'enabled' => true,
                'prevSlideMessage' => $this->getParameter($configuration, 'a11y.prevSlideMessage'),
                'nextSlideMessage' => $this->getParameter($configuration, 'a11y.nextSlideMessage'),
                'firstSlideMessage' => $this->getParameter($configuration, 'a11y.firstSlideMessage'),
                'lastSlideMessage' => $this->getParameter($configuration, 'a11y.lastSlideMessage'),
                'paginationBulletMessage' => $this->getParameter($configuration, 'a11y.paginationBulletMessage'),
                'notificationClass' => 'swiper-notification',
                'containerMessage' => null,
                'containerRoleDescriptionMessage' => null,
                'itemRoleDescriptionMessage' => null,
                'slideLabelMessage' => $this->getParameter($configuration, 'a11y.slideLabelMessage'),
            ],
            'autoplay' => [
                'enabled' => true,
                'delay' => 3000,
                'waitForTransition' => true,
                'disableOnInteraction' => true,
                'stopOnLastSlide' => false,
                'reverseDirection' => false,
                'pauseOnMouseEnter' => false,
            ],
            'controller' => [
                'control' => null,
                'inverse' => false,
                'by' => 'slide',
            ],
            'coverflowEffect' => [
                'rotate' => 50,
                'stretch' => 0,
                'depth' => 100,
                'modifier' => 1,
                'slideShadows' => true,
            ],
            'cubeEffect' => [
                'slideShadows' => true,
                'shadow' => true,
                'shadowOffset' => 20,
                'shadowScale' => 0.94,
            ],
            'fadeEffect' => [
                'crossFade' => false,
            ],
            'flipEffect' => [
                'slideShadows' => true,
                'limitRotation' => true,
            ],
            'keyboard' => [
                'enabled' => false,
                'onlyInViewport' => true,
                'pageUpDown' => true,
            ],
            'lazy' => [
                'enabled' => false,
                'loadPrevNext' => false,
                'loadPrevNextAmount' => 1,
                'loadOnTransitionStart' => false,
                'scrollingElement' => null,
                'elementClass' => 'swiper-lazy',
                'loadedClass' => 'swiper-lazy-loaded',
                'loadingClass' => 'swiper-lazy-loading',
                'preloaderClass' => 'swiper-lazy-preloader',
            ],
            'mousewheel' => [
                'enabled' => false,
                'forceToAxis' => false,
                'releaseOnEdges' => false,
                'invert' => false,
                'sensitivity' => 1,
                'eventsTarget' => 'container',
            ],
            'navigation' => [
                'nextEl' => '.swiper-button-next',
                'prevEl' => '.swiper-button-prev',
                'hideOnClick' => true,
                'disabledClass' => 'swiper-button-disabled',
                'hiddenClass' => 'swiper-button-hidden',
                'lockClass' => 'swiper-button-lock',
            ],
            'pagination' => [
                'enabled' => true,
                'el' => '.swiper-pagination',
                'type' => 'bullets',
                'bulletElement' => 'span',
                'dynamicBullets' => false,
                'dynamicMainBullets' => 1,
                'hideOnClick' => false,
                'clickable' => true,
                'progressbarOpposite' => false,
                'bulletClass' => 'swiper-pagination-bullet',
                'bulletActiveClass' => 'swiper-pagination-bullet-active',
                'modifierClass' => 'swiper-pagination-',
                'currentClass' => 'swiper-pagination-current',
                'totalClass' => 'swiper-pagination-total',
                'hiddenClass' => 'swiper-pagination-hidden',
                'progressbarFillClass' => 'swiper-pagination-progressbar-fill',
                'clickableClass' => 'swiper-pagination-clickable',
                'lockClass' => 'swiper-pagination-lock',
            ],
            'parallax' => [
                'enabled' => false,
            ],
            'scrollbar' => [
                'el' => null,
                'hide' => false,
                'draggable' => false,
                'snapOnRelease' => true,
                'lockClass' => 'swiper-scrollbar-lock',
                'dragClass' => 'swiper-scrollbar-drag',
            ],
            'thumbs' => [
                'swiper' => null,
                'autoScrollOffset' => 0,
                'slideThumbActiveClass' => 'swiper-slide-thumb-active',
            ],
            'virtual' => [
                'enabled' => false,
                'slides' => [],
                'cache' => true,
                'renderSlide' => null,
                'renderExternal' => null,
                'renderExternalUpdate' => true,
                'addSlidesBefore' => 0,
                'addSlidesAfter' => 0,
            ],
            'zoom' => [
                'enabled' => false,
                'maxRatio' => 3,
                'minRatio' => 1,
                'toggle' => true,
                'containerClass' => 'swiper-zoom-container',
                'zoomedSlideClass' => 'swiper-slide-zoomed',
            ],
            'on' => [],
        ];

        $options = $this->js_encode($options);
        $js = '';
        $onOptions = '';
        if ($configuration['parameters']['autoplayProgress'] ?? false) {
            $js .= <<<JS
    const progressCircle_{$identifier} = document.querySelector(".autoplay-progress svg");
    const progressContent_{$identifier} = document.querySelector(".autoplay-progress span");
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
let options_{$identifier} = {$options};
{$onOptions}
const {$identifier} = new Swiper('#{$identifier}', options_{$identifier});
JS;

        $slider->setJavaScript($js);

        return $slider;
    }
}
