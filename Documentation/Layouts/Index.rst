.. include:: ../Includes.txt

.. _layouts:

Layouts
=======

A layout selects which Fluid section is used to render a single slide. The
:guilabel:`Frontend layout` selector on the content element lists the layouts
that are available for the chosen renderer.

.. _layouts-how-it-works:

How rendering works
-------------------

Two partials are involved per renderer, and only one of them is layout aware:

*  :file:`Resources/Private/Partials/<Renderer>.html` renders the slider frame
   (container, assets, inline JavaScript). It is **always** rendered with the
   section ``Default``. Adding further sections here has no effect.
*  :file:`Resources/Private/Partials/Item/<Renderer>.html` renders a single
   slide. It is rendered with the **layout name as the section name**.

So a layout is a section in the *item* partial:

.. code-block:: html
   :caption: Resources/Private/Partials/Item/Tinyslider.html

   <f:section name="Default">
       ...
   </f:section>

   <f:section name="Cards">
       ...
   </f:section>

If the selected layout has no matching section in the item partial of the
current renderer, Fluid aborts with
``InvalidSectionException: Section "..." does not exist``.

.. _layouts-register:

Registering a layout
--------------------

Layouts are registered in page TSconfig under ``tx_wsslider.templateLayouts``.
The key is the section name, the value is the label:

.. code-block:: typoscript

   tx_wsslider.templateLayouts.Cards = Cards

.. important::

   There is no ``addItems`` here. ``tx_wsslider.templateLayouts.addItems.Cards``
   has no effect - the values are read from ``templateLayouts`` directly.
   (``addItems`` only exists for ``TCEFORM``, which is a different mechanism.)

Because a section only exists in the item partials you provide, restrict the
layout to the renderers that actually implement it:

.. code-block:: typoscript

   tx_wsslider.templateLayouts.Cards = Cards
   tx_wsslider.templateLayouts.Cards.renderers = tinyslider

Without ``renderers`` the layout is offered for every renderer. Selecting it on
a renderer whose item partial lacks the section breaks the frontend.

A layout can also be limited to certain columns:

.. code-block:: typoscript

   tx_wsslider.templateLayouts.Cards.allowedColPos = 0,1

.. _layouts-own:

Adding your own layout
----------------------

1. Add the partial root path of your site package to
   ``plugin.tx_wsslider.view.partialRootPath`` (or to
   ``tt_content.ws_slider.partialRootPaths``) so your files win over the ones
   shipped with the extension.
2. Copy :file:`Item/<Renderer>.html` of the renderer you use into your own
   partial root path and add a section named after your layout.
3. Register the layout in page TSconfig as shown above and restrict it with
   ``renderers`` to the renderer you implemented it for.

.. _layouts-shipped:

Layouts shipped with the extension
----------------------------------

===========  ==========  ==========================================
Layout       Renderer    Page TSconfig file
===========  ==========  ==========================================
Default      all         built in, always available
Cards        tinyslider  :file:`EXT:ws_slider/Configuration/TsConfig/Page/Layout/Cards.tsconfig`
===========  ==========  ==========================================

The shipped file can be selected in the page properties under
:guilabel:`Include static Page TSconfig`.
