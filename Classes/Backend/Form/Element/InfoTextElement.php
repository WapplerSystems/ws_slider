<?php
declare(strict_types=1);

namespace WapplerSystems\WsSlider\Backend\Form\Element;
use TYPO3\CMS\Backend\Form\Element\AbstractFormElement;
use TYPO3\CMS\Core\Localization\LanguageService;

class InfoTextElement extends AbstractFormElement
{
    public function render()
    {
        $parameters = $this->data['parameterArray']['fieldConf']['config']['parameters'];
        $text = $parameters['text'];

        $languageService = $this->getLanguageService();

        return [
            'html' => $languageService->sL($text) ,
        ];
    }

    /**
     * @return LanguageService
     */
    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }
}
