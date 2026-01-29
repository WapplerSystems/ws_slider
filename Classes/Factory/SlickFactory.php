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
    /**
     * Gibt die Standard-Konfiguration für den Slick Slider zurück
     *
     * @return array
     */
    public static function getDefaultConfig(): array
    {
        return [
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
    }


    public function build(array $configuration, SliderDefinition $slider, string $identifier, ?ServerRequestInterface $request = null): SliderDefinition
    {
        $slider->setConfiguration($configuration);

        $options = self::getDefaultConfig();
        if (isset($configuration['parameters']) && is_array($configuration['parameters'])) {
            foreach ($configuration['parameters'] as $key => $value) {
                $options[$key] = $value;
            }
        }
        $optionsJson = $this->js_encode($options);
        $js = "jQuery('#{$identifier}').slick({$optionsJson});\n";
        $slider->setJavaScript($js);
        $slider->setIdentifier($identifier);
        return $slider;
    }
}
