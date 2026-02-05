<?php
namespace WapplerSystems\WsSlider\Factory;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;
use WapplerSystems\WsSlider\Model\SliderDefinition;

/**
 * Factory für Slick Slider Konfigurationen basierend auf TypoScript-Defaults
 */
#[Autoconfigure(public: true, shared: false)]
class SlickFactory extends AbstractSliderFactory
{

    protected array $defaultOptions = [
        'accessibility' => true,
        'adaptiveHeight' => false,
        'autoplay' => false,
        'autoplaySpeed' => 3000,
        'arrows' => true,
        'asNavFor' => null,
        'appendArrows' => '',
        'appendDots' => '',
        'prevArrow' => '<button type="button" class="slick-prev">Previous</button>',
        'nextArrow' => '<button type="button" class="slick-next">Next</button>',
        'centerMode' => false,
        'centerPadding' => '50px',
        'cssEase' => 'ease',
        // 'customPaging' => null, // auskommentiert wie in TypoScript
        'dots' => false,
        'dotsClass' => 'slick-dots',
        'draggable' => true,
        'fade' => false,
        'focusOnSelect' => false,
        'easing' => 'linear',
        'edgeFriction' => 0.15,
        'infinite' => true,
        'initialSlide' => 0,
        'lazyLoad' => 'ondemand',
        'mobileFirst' => false,
        'pauseOnFocus' => true,
        'pauseOnHover' => true,
        'pauseOnDotsHover' => false,
        'respondTo' => 'window',
        'rows' => 1,
        'slidesPerRow' => 1,
        'slidesToShow' => 1,
        'slidesToScroll' => 1,
        'speed' => 300,
        'swipe' => true,
        'swipeToSlide' => false,
        'touchMove' => true,
        'touchThreshold' => 5,
        'useCSS' => true,
        'useTransform' => true,
        'variableWidth' => false,
        'verticalSwiping' => false,
        'rtl' => false,
        'waitForAnimate' => true,
        'zindex' => 1000,
        'vertical' => false,
    ];



    public function build(array $options, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {

        $options = $this->mergeOptions($options);

        $this->sliderPrototype->setOptions($options);

        $optionsJson = $this->js_encode($options);
        $js = "jQuery('#{$identifier}').slick({$optionsJson});\n";
        $this->sliderPrototype->setJavaScript($js);
        $this->sliderPrototype->setIdentifier($identifier);
        return $this->sliderPrototype;
    }


}
