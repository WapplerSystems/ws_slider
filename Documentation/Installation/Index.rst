.. ==================================================
.. FOR YOUR INFORMATION
.. --------------------------------------------------
.. -*- coding: utf-8 -*- with BOM.

.. include:: ../Includes.txt
.. include:: Images.txt

.. _installation:

Installation
============

- Login to the backend of TYPO3 as a user with Administrator privileges

- Download and install the extension EXT:ws\_slider by the **Extension Manager**

Configuration
-------------

To enable the sliders for editors, you have to add them to the page properties in the TSconfig settings. You can decide which slider or layout you want to add. To do this:

1. Go to `List` in your TYPO3 Backend's side menu.
2. Select `YOUR PAGE` in the page hierarchy.
3. Select the `edit page properties` button at the top.
4. Navigate to the `Resources` tab and add the items for the sliders you need in the `Page TSconfig` section as shown in the image below.


|TSconfigIncludes|

Add the template of the extension to your main template by:

1. Going to `List` in your TYPO3 Backend's side menu.
2. Select `YOUR PAGE` in the page hierarchy.
3. Add a new template called `+ext` with the top plus symbol.
4. Edit the template.
5. Go the `Includes` tab and add the items for the sliders you need ad shown in the image below.

|TemplateIncludes|

Adding Content
--------------

Select which slider you want to use and add slider elements. In each slider element you can set an image source.

|Elements|

Slider Settings
---------------

Within the `Settings` tab when editing your content element you can find settings for the specific slider you have selected.
Here is an example for the Owl slider. Each setting has a default value, if you want to change a setting you can select the checkbox and set the specific value.

|OwlSettings|

These settings are built after the respective endpoints the sliders offer.
The respective Documentation that we used can be found here:

* Owl `<https://owlcarousel2.github.io/OwlCarousel2/docs/api-options.html>`_
* FlexSlider `<https://github.com/woocommerce/FlexSlider/wiki/FlexSlider-Properties>`_
* TinySlider `<https://ganlanyuan.github.io/tiny-slider/#options>`_
* Slick `<https://kenwheeler.github.io/slick/>`_