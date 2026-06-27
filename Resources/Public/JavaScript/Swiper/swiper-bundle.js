/**
 * Swiper 14.0.0
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * https://swiperjs.com
 *
 * Copyright 2014-2026 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: June 26, 2026
 */

var Swiper = (function () {
    'use strict';

    function classesToTokens(classes = '') {
        return classes
            .trim()
            .split(' ')
            .filter((c) => !!c.trim());
    }

    function deleteProps(obj) {
        Object.keys(obj).forEach((key) => {
            try {
                obj[key] = null;
            }
            catch {
                // no getter for object
            }
            try {
                delete obj[key];
            }
            catch {
                // something got wrong
            }
        });
    }
    function nextTick(callback, delay = 0) {
        return setTimeout(callback, delay);
    }
    function now() {
        return Date.now();
    }
    function getComputedStyle$1(el) {
        return window.getComputedStyle(el, null);
    }
    function getTranslate(el, axis = 'x') {
        const style = getComputedStyle$1(el);
        const transform = style.transform || style.webkitTransform;
        if (!transform || transform === 'none')
            return 0;
        const matrix = new DOMMatrixReadOnly(transform);
        return axis === 'x' ? matrix.m41 : matrix.m42;
    }
    function isObject(o) {
        return (typeof o === 'object' &&
            o !== null &&
            o.constructor === Object &&
            Object.prototype.toString.call(o).slice(8, -1) === 'Object');
    }
    function isNode(node) {
        if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement)
            return true;
        return (!!node &&
            typeof node === 'object' &&
            (node.nodeType === 1 || node.nodeType === 11));
    }
    function extend(target, ...sources) {
        const to = Object(target);
        for (let i = 0; i < sources.length; i += 1) {
            const nextSource = sources[i];
            if (nextSource === undefined || nextSource === null || isNode(nextSource))
                continue;
            const sourceObj = nextSource;
            const keysArray = Object.keys(Object(sourceObj)).filter((key) => key !== '__proto__' && key !== 'constructor' && key !== 'prototype');
            for (const nextKey of keysArray) {
                const desc = Object.getOwnPropertyDescriptor(sourceObj, nextKey);
                if (!desc || !desc.enumerable)
                    continue;
                const sourceVal = sourceObj[nextKey];
                if (isObject(to[nextKey]) && isObject(sourceVal)) {
                    if (sourceVal.__swiper__) {
                        to[nextKey] = sourceVal;
                    }
                    else {
                        extend(to[nextKey], sourceVal);
                    }
                }
                else if (!isObject(to[nextKey]) && isObject(sourceVal)) {
                    to[nextKey] = {};
                    if (sourceVal.__swiper__) {
                        to[nextKey] = sourceVal;
                    }
                    else {
                        extend(to[nextKey], sourceVal);
                    }
                }
                else {
                    to[nextKey] = sourceVal;
                }
            }
        }
        return to;
    }
    function setCSSProperty(el, varName, varValue) {
        el.style.setProperty(varName, varValue);
    }
    function getSlideTransformEl(slideEl) {
        const direct = slideEl.querySelector('.swiper-slide-transform');
        if (direct)
            return direct;
        if (slideEl.shadowRoot) {
            const shadowed = slideEl.shadowRoot.querySelector('.swiper-slide-transform');
            if (shadowed)
                return shadowed;
        }
        return slideEl;
    }
    function elementChildren(element, selector = '') {
        const children = [...element.children];
        if (element instanceof HTMLSlotElement) {
            children.push(...element.assignedElements());
        }
        return selector ? children.filter((el) => el.matches(selector)) : children;
    }
    function elementIsChildOfSlot(el, slot) {
        const queue = [slot];
        while (queue.length > 0) {
            const cur = queue.shift();
            if (el === cur)
                return true;
            queue.push(...cur.children, ...(cur.shadowRoot ? cur.shadowRoot.children : []), ...(cur.assignedElements
                ? cur.assignedElements()
                : []));
        }
        return false;
    }
    function elementIsChildOf(el, parent) {
        let isChild = parent.contains(el);
        if (!isChild && parent instanceof HTMLSlotElement) {
            const children = [...parent.assignedElements()];
            isChild = children.includes(el);
            if (!isChild)
                isChild = elementIsChildOfSlot(el, parent);
        }
        return isChild;
    }
    function showWarning(text) {
        try {
            console.warn(text);
        }
        catch {
            // err
        }
    }
    function createElement(tag, classes = []) {
        const el = document.createElement(tag);
        el.classList.add(...(Array.isArray(classes) ? classes : classesToTokens(classes)));
        return el;
    }
    function elementOffset(el) {
        const box = el.getBoundingClientRect();
        return {
            top: box.top + window.scrollY - (el.clientTop || 0),
            left: box.left + window.scrollX - (el.clientLeft || 0),
        };
    }
    function elementPrevAll(el, selector) {
        const prevEls = [];
        let prev = el.previousElementSibling;
        while (prev) {
            if (!selector || prev.matches(selector))
                prevEls.push(prev);
            prev = prev.previousElementSibling;
        }
        return prevEls;
    }
    function elementNextAll(el, selector) {
        const nextEls = [];
        let next = el.nextElementSibling;
        while (next) {
            if (!selector || next.matches(selector))
                nextEls.push(next);
            next = next.nextElementSibling;
        }
        return nextEls;
    }
    function elementStyle(el, prop) {
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function elementIndex(el) {
        if (!el || !el.parentNode)
            return undefined;
        return [...el.parentNode.children].indexOf(el);
    }
    function elementParents(el, selector) {
        const parents = [];
        let parent = el.parentElement;
        while (parent) {
            if (!selector || parent.matches(selector))
                parents.push(parent);
            parent = parent.parentElement;
        }
        return parents;
    }
    function elementTransitionEnd(el, callback) {
        if (!callback)
            return;
        el.addEventListener('transitionend', function fireCallBack(e) {
            if (e.target !== el)
                return;
            callback.call(el, e);
        }, { once: true });
    }
    function elementOuterSize(el, size, includeMargins) {
        {
            const style = window.getComputedStyle(el, null);
            return (el[size === 'width' ? 'offsetWidth' : 'offsetHeight'] +
                parseFloat(style.getPropertyValue(size === 'width' ? 'margin-right' : 'margin-top')) +
                parseFloat(style.getPropertyValue(size === 'width' ? 'margin-left' : 'margin-bottom')));
        }
    }
    function makeElementsArray(el) {
        return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
    }
    function getRotateFix(swiper) {
        return (v) => {
            if (Math.abs(v) > 0 && swiper.browser && swiper.browser.need3dFix && Math.abs(v) % 90 === 0) {
                return v + 0.001;
            }
            return v;
        };
    }
    function setInnerHTML(el, html = '') {
        const tt = globalThis.trustedTypes;
        if (typeof tt !== 'undefined') {
            el.innerHTML = tt.createPolicy('html', { createHTML: (s) => s }).createHTML(html);
        }
        else {
            el.innerHTML = html;
        }
    }

    let supportCached;
    function calcSupport() {
        if (typeof window === 'undefined')
            return { touch: false };
        return {
            touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        };
    }
    function getSupport() {
        if (!supportCached)
            supportCached = calcSupport();
        return supportCached;
    }

    let deviceCached;
    function calcDevice({ userAgent } = {}) {
        if (typeof window === 'undefined')
            return { ios: false, android: false };
        const support = getSupport();
        const platform = navigator.platform;
        const ua = userAgent || navigator.userAgent;
        const device = { ios: false, android: false };
        const isAndroid = /(Android);?[\s/]+([\d.]+)?/.test(ua);
        const isIPhoneOrIPod = /(iPhone\sOS|iOS|iPod)/.test(ua);
        const isIPadDirect = /iPad/.test(ua);
        // iPad on iPadOS 13+ reports as MacIntel; distinguish from a real Mac by touch capability.
        const isIPadMasquerade = platform === 'MacIntel' && support.touch && navigator.maxTouchPoints > 1;
        const isIPad = isIPadDirect || isIPadMasquerade;
        const isWindows = platform === 'Win32';
        if (isAndroid && !isWindows) {
            device.os = 'android';
            device.android = true;
        }
        if (isIPad || isIPhoneOrIPod) {
            device.os = 'ios';
            device.ios = true;
        }
        return device;
    }
    function getDevice(overrides = {}) {
        if (!deviceCached)
            deviceCached = calcDevice(overrides);
        return deviceCached;
    }

    let browserCached;
    function calcBrowser() {
        if (typeof window === 'undefined') {
            return { isSafari: false, isWebView: false, need3dFix: false };
        }
        const device = getDevice();
        const ua = navigator.userAgent;
        const uaLower = ua.toLowerCase();
        const isSafari = uaLower.includes('safari') && !uaLower.includes('chrome') && !uaLower.includes('android');
        const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
        // 3D transform glitches still affect iOS WebView and Safari at the baseline (16.4+).
        const need3dFix = isSafari || (isWebView && device.ios);
        return { isSafari, isWebView, need3dFix };
    }
    function getBrowser() {
        if (!browserCached)
            browserCached = calcBrowser();
        return browserCached;
    }

    const processLazyPreloader = (swiper, imageEl) => {
        if (!swiper || swiper.destroyed || !swiper.params)
            return;
        const slideSelector = () => (swiper.isElement ? 'swiper-slide' : `.${swiper.params.slideClass}`);
        const slideEl = imageEl.closest(slideSelector());
        if (slideEl) {
            let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (!lazyEl && swiper.isElement) {
                if (slideEl.shadowRoot) {
                    lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                }
                else {
                    requestAnimationFrame(() => {
                        if (slideEl.shadowRoot) {
                            const innerLazy = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                            if (innerLazy && !innerLazy.lazyPreloaderManaged)
                                innerLazy.remove();
                        }
                    });
                }
            }
            if (lazyEl && !lazyEl.lazyPreloaderManaged)
                lazyEl.remove();
        }
    };
    const unlazy = (swiper, index) => {
        if (!swiper.slides[index])
            return;
        const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
        if (imageEl)
            imageEl.removeAttribute('loading');
    };
    const preload = (swiper) => {
        if (!swiper || swiper.destroyed || !swiper.params)
            return;
        let amount = swiper.params.lazyPreloadPrevNext;
        const len = swiper.slides.length;
        if (!len || !amount || amount < 0)
            return;
        amount = Math.min(amount, len);
        const slidesPerView = swiper.params.slidesPerView === 'auto'
            ? swiper.slidesPerViewDynamic()
            : Math.ceil(swiper.params.slidesPerView);
        const activeIndex = swiper.activeIndex;
        if (swiper.params.grid && (swiper.params.grid.rows ?? 1) > 1) {
            const activeColumn = activeIndex;
            const preloadColumns = [activeColumn - amount];
            preloadColumns.push(...Array.from({ length: amount }).map((_, i) => activeColumn + slidesPerView + i));
            swiper.slides.forEach((slideEl, i) => {
                if (slideEl.column !== undefined && preloadColumns.includes(slideEl.column))
                    unlazy(swiper, i);
            });
            return;
        }
        const slideIndexLastInView = activeIndex + slidesPerView - 1;
        if (swiper.params.rewind || swiper.params.loop) {
            for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
                const realIndex = ((i % len) + len) % len;
                if (realIndex < activeIndex || realIndex > slideIndexLastInView)
                    unlazy(swiper, realIndex);
            }
        }
        else {
            for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
                if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
                    unlazy(swiper, i);
                }
            }
        }
    };

    function getBreakpoint(breakpoints, base = 'window', containerEl) {
        if (!breakpoints || (base === 'container' && !containerEl))
            return undefined;
        let breakpoint = false;
        const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
        const points = Object.keys(breakpoints).map((point) => {
            if (typeof point === 'string' && point.indexOf('@') === 0) {
                const minRatio = parseFloat(point.substr(1));
                const value = currentHeight * minRatio;
                return { value, point };
            }
            return { value: point, point };
        });
        points.sort((a, b) => parseInt(String(a.value), 10) - parseInt(String(b.value), 10));
        for (let i = 0; i < points.length; i += 1) {
            const { point, value } = points[i];
            if (base === 'window') {
                if (window.matchMedia(`(min-width: ${value}px)`).matches) {
                    breakpoint = point;
                }
            }
            else if (value <= containerEl.clientWidth) {
                breakpoint = point;
            }
        }
        return breakpoint || 'max';
    }

    const isGridEnabled = (swiper, params) => {
        return !!(swiper.grid && params.grid && params.grid.rows > 1);
    };
    function setBreakpoint() {
        const swiper = this;
        const { realIndex, initialized, params, el } = swiper;
        const breakpoints = params.breakpoints;
        if (!breakpoints || (breakpoints && Object.keys(breakpoints).length === 0))
            return;
        // Get breakpoint for window/container width and update parameters
        const breakpointsBase = params.breakpointsBase === 'window' || !params.breakpointsBase
            ? params.breakpointsBase
            : 'container';
        const breakpointContainer = ['window', 'container'].includes(params.breakpointsBase) || !params.breakpointsBase
            ? swiper.el
            : document.querySelector(params.breakpointsBase);
        const breakpoint = swiper.getBreakpoint(breakpoints, breakpointsBase, breakpointContainer);
        if (!breakpoint || swiper.currentBreakpoint === breakpoint)
            return;
        const breakpointsRecord = breakpoints;
        const breakpointOnlyParams = breakpoint in breakpointsRecord ? breakpointsRecord[breakpoint] : undefined;
        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = isGridEnabled(swiper, params);
        const isMultiRow = isGridEnabled(swiper, breakpointParams);
        const wasGrabCursor = swiper.params.grabCursor;
        const isGrabCursor = breakpointParams.grabCursor;
        const wasEnabled = params.enabled;
        if (wasMultiRow && !isMultiRow) {
            el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        }
        else if (!wasMultiRow && isMultiRow) {
            el.classList.add(`${params.containerModifierClass}grid`);
            if ((breakpointParams.grid.fill && breakpointParams.grid.fill === 'column') ||
                (!breakpointParams.grid.fill && params.grid.fill === 'column')) {
                el.classList.add(`${params.containerModifierClass}grid-column`);
            }
            swiper.emitContainerClasses();
        }
        if (wasGrabCursor && !isGrabCursor) {
            swiper.unsetGrabCursor();
        }
        else if (!wasGrabCursor && isGrabCursor) {
            swiper.setGrabCursor();
        }
        const moduleOpt = (opts, prop) => opts[prop];
        ['navigation', 'pagination', 'scrollbar'].forEach((prop) => {
            const bpOpts = moduleOpt(breakpointParams, prop);
            if (typeof bpOpts === 'undefined')
                return;
            const paramsOpts = moduleOpt(params, prop);
            const wasModuleEnabled = typeof paramsOpts === 'object' && paramsOpts !== null && paramsOpts.enabled;
            const isModuleEnabled = typeof bpOpts === 'object' && bpOpts !== null && bpOpts.enabled;
            const moduleApi = swiper[prop];
            if (wasModuleEnabled && !isModuleEnabled)
                moduleApi?.disable?.();
            if (!wasModuleEnabled && isModuleEnabled)
                moduleApi?.enable?.();
        });
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
        const wasLoop = params.loop;
        if (directionChanged && initialized) {
            swiper.changeDirection();
        }
        extend(swiper.params, breakpointParams);
        const isEnabled = swiper.params.enabled;
        const hasLoop = swiper.params.loop;
        Object.assign(swiper, {
            allowTouchMove: swiper.params.allowTouchMove,
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev,
        });
        if (wasEnabled && !isEnabled) {
            swiper.disable();
        }
        else if (!wasEnabled && isEnabled) {
            swiper.enable();
        }
        swiper.currentBreakpoint = breakpoint;
        swiper.emit('_beforeBreakpoint', breakpointParams);
        if (initialized) {
            if (needsReLoop) {
                swiper.loopDestroy();
                swiper.loopCreate(realIndex);
                swiper.updateSlides();
            }
            else if (!wasLoop && hasLoop) {
                swiper.loopCreate(realIndex);
                swiper.updateSlides();
            }
            else if (wasLoop && !hasLoop) {
                swiper.loopDestroy();
            }
        }
        swiper.emit('breakpoint', breakpointParams);
    }

    var breakpoints = { setBreakpoint, getBreakpoint };

    function checkOverflow() {
        const swiper = this;
        const { isLocked: wasLocked, params } = swiper;
        const { slidesOffsetBefore } = params;
        if (slidesOffsetBefore) {
            const lastSlideIndex = swiper.slides.length - 1;
            const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] +
                swiper.slidesSizesGrid[lastSlideIndex] +
                slidesOffsetBefore * 2;
            swiper.isLocked = swiper.size > lastSlideRightEdge;
        }
        else {
            swiper.isLocked = swiper.snapGrid.length === 1;
        }
        if (params.allowSlideNext === true) {
            swiper.allowSlideNext = !swiper.isLocked;
        }
        if (params.allowSlidePrev === true) {
            swiper.allowSlidePrev = !swiper.isLocked;
        }
        if (wasLocked && wasLocked !== swiper.isLocked) {
            swiper.isEnd = false;
        }
        if (wasLocked !== swiper.isLocked) {
            swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
        }
    }
    var checkOverflow$1 = { checkOverflow };

    function prepareClasses(entries, prefix) {
        const resultClasses = [];
        entries.forEach((item) => {
            if (typeof item === 'object') {
                Object.keys(item).forEach((classNames) => {
                    if (item[classNames]) {
                        resultClasses.push(prefix + classNames);
                    }
                });
            }
            else if (typeof item === 'string') {
                resultClasses.push(prefix + item);
            }
        });
        return resultClasses;
    }
    function addClasses() {
        const swiper = this;
        const { classNames, params, rtl, el, device } = swiper;
        // oxfmt-ignore
        const suffixes = prepareClasses([
            'initialized',
            params.direction,
            { 'free-mode': swiper.params.freeMode && params.freeMode.enabled },
            { 'autoheight': params.autoHeight },
            { 'rtl': rtl },
            { 'grid': params.grid && params.grid.rows > 1 },
            { 'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column' },
            { 'android': device.android },
            { 'ios': device.ios },
            { 'css-mode': params.cssMode },
            { 'centered': params.cssMode && params.centeredSlides },
            { 'watch-progress': params.watchSlidesProgress },
        ], params.containerModifierClass);
        classNames.push(...suffixes);
        el.classList.add(...classNames);
        swiper.emitContainerClasses();
    }

    function removeClasses() {
        const swiper = this;
        const { el, classNames } = swiper;
        if (!el || typeof el === 'string')
            return;
        el.classList.remove(...classNames);
        swiper.emitContainerClasses();
    }

    var classes = { addClasses, removeClasses };

    const defaults = {
        init: true,
        direction: 'horizontal',
        oneWayMovement: false,
        swiperElementNodeName: 'SWIPER-CONTAINER',
        touchEventsTarget: 'wrapper',
        initialSlide: 0,
        speed: 300,
        cssMode: false,
        updateOnWindowResize: true,
        resizeObserver: true,
        nested: false,
        createElements: false,
        eventsPrefix: 'swiper',
        enabled: true,
        focusableElements: 'input, select, option, textarea, button, video, label',
        // Overrides
        width: null,
        height: null,
        //
        preventInteractionOnTransition: false,
        // ssr
        userAgent: null,
        url: null,
        // To support iOS's swipe-to-go-back gesture (when being used in-app).
        edgeSwipeDetection: false,
        edgeSwipeThreshold: 20,
        // Autoheight
        autoHeight: false,
        // Set wrapper width
        setWrapperSize: false,
        // Virtual Translate
        virtualTranslate: false,
        // Effects
        effect: 'slide',
        // Breakpoints
        breakpoints: undefined,
        breakpointsBase: 'window',
        // Slides grid
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: true,
        centerInsufficientSlides: false,
        snapToSlideEdge: false,
        // Disable swiper and hide navigation when container not overflow
        watchOverflow: true,
        // Round length
        roundLengths: false,
        // Touches
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: 0.5,
        longSwipesMs: 300,
        followFinger: true,
        allowTouchMove: true,
        threshold: 5,
        touchMoveStopPropagation: false,
        touchStartPreventDefault: true,
        touchStartForcePreventDefault: false,
        touchReleaseOnEdges: false,
        // Unique Navigation Elements
        uniqueNavElements: true,
        // Resistance
        resistance: true,
        resistanceRatio: 0.85,
        // Progress
        watchSlidesProgress: false,
        // Cursor
        grabCursor: false,
        // Clicks
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        // loop
        loop: false,
        loopAddBlankSlides: true,
        loopAdditionalSlides: 0,
        loopPreventsSliding: true,
        // rewind
        rewind: false,
        // Swiping/no swiping
        allowSlidePrev: true,
        allowSlideNext: true,
        swipeHandler: null,
        noSwiping: true,
        noSwipingClass: 'swiper-no-swiping',
        noSwipingSelector: null,
        // Passive Listeners
        passiveListeners: true,
        maxBackfaceHiddenSlides: 10,
        // NS
        containerModifierClass: 'swiper-',
        slideClass: 'swiper-slide',
        slideBlankClass: 'swiper-slide-blank',
        slideActiveClass: 'swiper-slide-active',
        slideVisibleClass: 'swiper-slide-visible',
        slideFullyVisibleClass: 'swiper-slide-fully-visible',
        slideNextClass: 'swiper-slide-next',
        slidePrevClass: 'swiper-slide-prev',
        wrapperClass: 'swiper-wrapper',
        lazyPreloaderClass: 'swiper-lazy-preloader',
        lazyPreloadPrevNext: 0,
        // Callbacks
        runCallbacksOnInit: true,
        // Internals
        _emitClasses: false,
    };

    var eventsEmitter = {
        on(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed)
                return self;
            if (typeof handler !== 'function')
                return self;
            const method = priority ? 'unshift' : 'push';
            events.split(' ').forEach((event) => {
                if (!self.eventsListeners[event])
                    self.eventsListeners[event] = [];
                self.eventsListeners[event][method](handler);
            });
            return self;
        },
        once(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed)
                return self;
            if (typeof handler !== 'function')
                return self;
            const onceHandler = function onceHandlerFn(...args) {
                self.off(events, onceHandler);
                if (onceHandler.__emitterProxy) {
                    delete onceHandler.__emitterProxy;
                }
                handler.apply(self, args);
            };
            onceHandler.__emitterProxy = handler;
            return self.on(events, onceHandler, priority);
        },
        onAny(handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed)
                return self;
            if (typeof handler !== 'function')
                return self;
            const method = priority ? 'unshift' : 'push';
            if (self.eventsAnyListeners.indexOf(handler) < 0) {
                self.eventsAnyListeners[method](handler);
            }
            return self;
        },
        offAny(handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed)
                return self;
            if (!self.eventsAnyListeners)
                return self;
            const index = self.eventsAnyListeners.indexOf(handler);
            if (index >= 0) {
                self.eventsAnyListeners.splice(index, 1);
            }
            return self;
        },
        off(events, handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed)
                return self;
            if (!self.eventsListeners)
                return self;
            events.split(' ').forEach((event) => {
                if (typeof handler === 'undefined') {
                    self.eventsListeners[event] = [];
                }
                else if (self.eventsListeners[event]) {
                    self.eventsListeners[event].forEach((eventHandler, index) => {
                        if (eventHandler === handler ||
                            (eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler)) {
                            self.eventsListeners[event].splice(index, 1);
                        }
                    });
                }
            });
            return self;
        },
        emit(...args) {
            const self = this;
            if (!self.eventsListeners || self.destroyed)
                return self;
            if (!self.eventsListeners)
                return self;
            let events;
            let data;
            let context;
            if (typeof args[0] === 'string' || Array.isArray(args[0])) {
                events = args[0];
                data = args.slice(1, args.length);
                context = self;
            }
            else {
                const opts = args[0];
                events = opts.events;
                data = opts.data ?? [];
                context = opts.context || self;
            }
            data.unshift(context);
            const eventsArray = Array.isArray(events) ? events : events.split(' ');
            eventsArray.forEach((event) => {
                if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
                    self.eventsAnyListeners.forEach((eventHandler) => {
                        eventHandler.apply(context, [event, ...data]);
                    });
                }
                if (self.eventsListeners && self.eventsListeners[event]) {
                    self.eventsListeners[event].forEach((eventHandler) => {
                        eventHandler.apply(context, data);
                    });
                }
            });
            return self;
        },
    };

    function onClick(e) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        if (!swiper.enabled)
            return;
        if (!swiper.allowClick) {
            if (swiper.params.preventClicks)
                e.preventDefault();
            if (swiper.params.preventClicksPropagation && swiper.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }

    function onDocumentTouchStart() {
        const swiper = this;
        if (swiper.destroyed)
            return;
        if (swiper.documentTouchHandlerProceeded)
            return;
        swiper.documentTouchHandlerProceeded = true;
        if (swiper.params.touchReleaseOnEdges) {
            swiper.el.style.touchAction = 'auto';
        }
    }

    function onLoad(e) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        processLazyPreloader(swiper, e.target);
        if (swiper.params.cssMode ||
            (swiper.params.slidesPerView !== 'auto' && !swiper.params.autoHeight)) {
            return;
        }
        swiper.update();
    }

    function onResize() {
        const swiper = this;
        const { params, el } = swiper;
        if (el && el.offsetWidth === 0)
            return;
        // Breakpoints
        if (params.breakpoints) {
            swiper.setBreakpoint();
        }
        // Save locks
        const { allowSlideNext, allowSlidePrev, snapGrid } = swiper;
        const isVirtual = swiper.virtual && swiper.params.virtual?.enabled;
        // Disable locks on resize
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateSlidesClasses();
        const isVirtualLoop = isVirtual && params.loop;
        if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) &&
            swiper.isEnd &&
            !swiper.isBeginning &&
            !swiper.params.centeredSlides &&
            !isVirtualLoop) {
            const slidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
            swiper.slideTo(slidesLength - 1, 0, false, true);
        }
        else {
            if (swiper.params.loop && !isVirtual) {
                swiper.slideToLoop(swiper.realIndex, 0, false, true);
            }
            else {
                swiper.slideTo(swiper.activeIndex, 0, false, true);
            }
        }
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            const autoplay = swiper.autoplay;
            clearTimeout(autoplay.resizeTimeout);
            autoplay.resizeTimeout = setTimeout(() => {
                if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
                    swiper.autoplay.resume();
                }
            }, 500);
        }
        // Return locks after resize
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
            swiper.checkOverflow();
        }
    }

    function onScroll() {
        const swiper = this;
        if (swiper.destroyed)
            return;
        const { wrapperEl, rtlTranslate, enabled } = swiper;
        if (!enabled)
            return;
        swiper.previousTranslate = swiper.translate;
        if (swiper.isHorizontal()) {
            swiper.translate = -wrapperEl.scrollLeft;
        }
        else {
            swiper.translate = -wrapperEl.scrollTop;
        }
        if (swiper.translate === 0)
            swiper.translate = 0;
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) {
            newProgress = 0;
        }
        else {
            newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
        }
        if (newProgress !== swiper.progress) {
            swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
        }
        swiper.emit('setTranslate', swiper.translate, false);
    }

    function onTouchEnd(event) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        const data = swiper.touchEventsData;
        let e = event.originalEvent ?? event;
        const isTouchEvent = e.type === 'touchend' || e.type === 'touchcancel';
        if (!isTouchEvent) {
            if (data.touchId !== null)
                return; // return from pointer if we use touch
            const pe = e;
            if (pe.pointerId !== data.pointerId)
                return;
        }
        else {
            const te = e;
            const found = [...te.changedTouches].find((t) => t.identifier === data.touchId);
            if (!found || found.identifier !== data.touchId)
                return;
        }
        if (['pointercancel', 'pointerout', 'pointerleave', 'contextmenu'].includes(e.type)) {
            const proceed = ['pointercancel', 'contextmenu'].includes(e.type) &&
                (swiper.browser.isSafari || swiper.browser.isWebView);
            if (!proceed) {
                return;
            }
        }
        data.pointerId = null;
        data.touchId = null;
        const { params, touches, rtlTranslate: rtl, slidesGrid, enabled } = swiper;
        if (!enabled)
            return;
        if (!params.simulateTouch && e.pointerType === 'mouse')
            return;
        if (data.allowTouchCallbacks) {
            swiper.emit('touchEnd', e);
        }
        data.allowTouchCallbacks = false;
        if (!data.isTouched) {
            if (data.isMoved && params.grabCursor) {
                swiper.setGrabCursor(false);
            }
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        // Return Grab Cursor
        if (params.grabCursor &&
            data.isMoved &&
            data.isTouched &&
            (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
            swiper.setGrabCursor(false);
        }
        // Time diff
        const touchEndTime = now();
        const timeDiff = touchEndTime - data.touchStartTime;
        // Tap, doubleTap, Click
        if (swiper.allowClick) {
            // Legacy `e.path` was a non-standard Chrome extension; `composedPath()` is the modern API.
            const pathTree = e.path ?? (e.composedPath && e.composedPath());
            swiper.updateClickedSlide((pathTree && pathTree[0]), pathTree);
            swiper.emit('tap click', e);
            if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
                swiper.emit('doubleTap doubleClick', e);
            }
        }
        data.lastClickTime = now();
        nextTick(() => {
            if (!swiper.destroyed)
                swiper.allowClick = true;
        });
        if (!data.isTouched ||
            !data.isMoved ||
            !swiper.swipeDirection ||
            (touches.diff === 0 && !data.loopSwapReset) ||
            (data.currentTranslate === data.startTranslate && !data.loopSwapReset)) {
            data.isTouched = false;
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        let currentPos;
        if (params.followFinger) {
            currentPos = rtl ? swiper.translate : -swiper.translate;
        }
        else {
            currentPos = -(data.currentTranslate ?? 0);
        }
        if (params.cssMode) {
            return;
        }
        if (params.freeMode && params.freeMode.enabled) {
            swiper.freeMode.onTouchEnd({ currentPos });
            return;
        }
        // Find current slide
        const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
        let stopIndex = 0;
        let groupSize = swiper.slidesSizesGrid[0];
        for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
            const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
            if (typeof slidesGrid[i + increment] !== 'undefined') {
                if (swipeToLast ||
                    (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment])) {
                    stopIndex = i;
                    groupSize = slidesGrid[i + increment] - slidesGrid[i];
                }
            }
            else if (swipeToLast || currentPos >= slidesGrid[i]) {
                stopIndex = i;
                groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
            }
        }
        let rewindFirstIndex = null;
        let rewindLastIndex = null;
        if (params.rewind) {
            if (swiper.isBeginning) {
                rewindLastIndex =
                    params.virtual?.enabled && swiper.virtual
                        ? swiper.virtual.slides.length - 1
                        : swiper.slides.length - 1;
            }
            else if (swiper.isEnd) {
                rewindFirstIndex = 0;
            }
        }
        // Find current slide size
        const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
        const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (timeDiff > params.longSwipesMs) {
            // Long touches
            if (!params.longSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (swiper.swipeDirection === 'next') {
                if (ratio >= params.longSwipesRatio)
                    swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
                else
                    swiper.slideTo(stopIndex);
            }
            if (swiper.swipeDirection === 'prev') {
                if (ratio > 1 - params.longSwipesRatio) {
                    swiper.slideTo(stopIndex + increment);
                }
                else if (rewindLastIndex !== null &&
                    ratio < 0 &&
                    Math.abs(ratio) > params.longSwipesRatio) {
                    swiper.slideTo(rewindLastIndex);
                }
                else {
                    swiper.slideTo(stopIndex);
                }
            }
        }
        else {
            // Short swipes
            if (!params.shortSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            const isNavButtonTarget = swiper.navigation &&
                (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
            if (!isNavButtonTarget) {
                if (swiper.swipeDirection === 'next') {
                    swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
                }
                if (swiper.swipeDirection === 'prev') {
                    swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
                }
            }
            else if (e.target === swiper.navigation.nextEl) {
                swiper.slideTo(stopIndex + increment);
            }
            else {
                swiper.slideTo(stopIndex);
            }
        }
    }

    function onTouchMove(event) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        const data = swiper.touchEventsData;
        const { params, touches, rtlTranslate: rtl, enabled } = swiper;
        if (!enabled)
            return;
        if (!params.simulateTouch && event.pointerType === 'mouse')
            return;
        // Legacy event wrappers nest the native event under .originalEvent.
        const wrapped = event;
        const e = wrapped.originalEvent ?? wrapped;
        if (e.type === 'pointermove') {
            if (data.touchId !== null)
                return; // return from pointer if we use touch
            const pe = e;
            if (pe.pointerId !== data.pointerId)
                return;
        }
        let targetTouch;
        if (e.type === 'touchmove') {
            const te = e;
            const found = [...te.changedTouches].find((t) => t.identifier === data.touchId);
            if (!found || found.identifier !== data.touchId)
                return;
            targetTouch = found;
        }
        else {
            targetTouch = e;
        }
        if (!data.isTouched) {
            if (data.startMoving && data.isScrolling) {
                swiper.emit('touchMoveOpposite', e);
            }
            return;
        }
        const pageX = targetTouch.pageX;
        const pageY = targetTouch.pageY;
        if (e.preventedByNestedSwiper) {
            touches.startX = pageX;
            touches.startY = pageY;
            return;
        }
        if (!swiper.allowTouchMove) {
            if (!e.target.matches(data.focusableElements)) {
                swiper.allowClick = false;
            }
            if (data.isTouched) {
                Object.assign(touches, {
                    startX: pageX,
                    startY: pageY,
                    currentX: pageX,
                    currentY: pageY,
                });
                data.touchStartTime = now();
            }
            return;
        }
        if (params.touchReleaseOnEdges && !params.loop) {
            if (swiper.isVertical()) {
                // Vertical
                if ((pageY < touches.startY && swiper.translate <= swiper.maxTranslate()) ||
                    (pageY > touches.startY && swiper.translate >= swiper.minTranslate())) {
                    data.isTouched = false;
                    data.isMoved = false;
                    return;
                }
            }
            else if (rtl &&
                ((pageX > touches.startX && -swiper.translate <= swiper.maxTranslate()) ||
                    (pageX < touches.startX && -swiper.translate >= swiper.minTranslate()))) {
                return;
            }
            else if (!rtl &&
                ((pageX < touches.startX && swiper.translate <= swiper.maxTranslate()) ||
                    (pageX > touches.startX && swiper.translate >= swiper.minTranslate()))) {
                return;
            }
        }
        if (document.activeElement &&
            document.activeElement.matches(data.focusableElements) &&
            document.activeElement !== e.target &&
            e.pointerType !== 'mouse') {
            document.activeElement.blur();
        }
        if (document.activeElement) {
            if (e.target === document.activeElement &&
                e.target.matches(data.focusableElements)) {
                data.isMoved = true;
                swiper.allowClick = false;
                return;
            }
        }
        if (data.allowTouchCallbacks) {
            swiper.emit('touchMove', e);
        }
        touches.previousX = touches.currentX;
        touches.previousY = touches.currentY;
        touches.currentX = pageX;
        touches.currentY = pageY;
        const diffX = touches.currentX - touches.startX;
        const diffY = touches.currentY - touches.startY;
        if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold)
            return;
        if (typeof data.isScrolling === 'undefined') {
            let touchAngle;
            if ((swiper.isHorizontal() && touches.currentY === touches.startY) ||
                (swiper.isVertical() && touches.currentX === touches.startX)) {
                data.isScrolling = false;
            }
            else {
                if (diffX * diffX + diffY * diffY >= 25) {
                    touchAngle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
                    data.isScrolling = swiper.isHorizontal()
                        ? touchAngle > params.touchAngle
                        : 90 - touchAngle > params.touchAngle;
                }
            }
        }
        if (data.isScrolling) {
            swiper.emit('touchMoveOpposite', e);
        }
        if (typeof data.startMoving === 'undefined') {
            if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
                data.startMoving = true;
            }
        }
        if (data.isScrolling || (e.type === 'touchmove' && data.preventTouchMoveFromPointerMove)) {
            data.isTouched = false;
            return;
        }
        if (!data.startMoving) {
            return;
        }
        swiper.allowClick = false;
        if (!params.cssMode && e.cancelable) {
            e.preventDefault();
        }
        if (params.touchMoveStopPropagation && !params.nested) {
            e.stopPropagation();
        }
        let diff = swiper.isHorizontal() ? diffX : diffY;
        let touchesDiff = swiper.isHorizontal()
            ? touches.currentX - touches.previousX
            : touches.currentY - touches.previousY;
        if (params.oneWayMovement) {
            diff = Math.abs(diff) * (rtl ? 1 : -1);
            touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
        }
        touches.diff = diff;
        diff *= params.touchRatio;
        if (rtl) {
            diff = -diff;
            touchesDiff = -touchesDiff;
        }
        const prevTouchesDirection = swiper.touchesDirection;
        swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
        swiper.touchesDirection = touchesDiff > 0 ? 'prev' : 'next';
        const isLoop = swiper.params.loop && !params.cssMode;
        const allowLoopFix = (swiper.touchesDirection === 'next' && swiper.allowSlideNext) ||
            (swiper.touchesDirection === 'prev' && swiper.allowSlidePrev);
        if (!data.isMoved) {
            if (isLoop && allowLoopFix) {
                swiper.loopFix({ direction: swiper.swipeDirection });
            }
            data.startTranslate = swiper.getTranslate();
            swiper.setTransition(0);
            if (swiper.animating) {
                const evt = new window.CustomEvent('transitionend', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        bySwiperTouchMove: true,
                    },
                });
                swiper.wrapperEl.dispatchEvent(evt);
            }
            data.allowMomentumBounce = false;
            // Grab Cursor
            if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
                swiper.setGrabCursor(true);
            }
            swiper.emit('sliderFirstMove', e);
        }
        new Date().getTime();
        if (params._loopSwapReset !== false &&
            data.isMoved &&
            data.allowThresholdMove &&
            prevTouchesDirection !== swiper.touchesDirection &&
            isLoop &&
            allowLoopFix &&
            Math.abs(diff) >= 1) {
            Object.assign(touches, {
                startX: pageX,
                startY: pageY,
                currentX: pageX,
                currentY: pageY,
                startTranslate: data.currentTranslate,
            });
            data.loopSwapReset = true;
            data.startTranslate = data.currentTranslate;
            return;
        }
        swiper.emit('sliderMove', e);
        data.isMoved = true;
        // startTranslate is guaranteed to be set by this point (set in onTouchStart-side init).
        const startTranslate = data.startTranslate ?? 0;
        data.currentTranslate = diff + startTranslate;
        let disableParentSwiper = true;
        let resistanceRatio = params.resistanceRatio;
        if (params.touchReleaseOnEdges) {
            resistanceRatio = 0;
        }
        if (diff > 0) {
            if (isLoop &&
                allowLoopFix &&
                true &&
                data.allowThresholdMove &&
                data.currentTranslate >
                    (params.centeredSlides
                        ? swiper.minTranslate() -
                            swiper.slidesSizesGrid[swiper.activeIndex + 1] -
                            (params.slidesPerView !== 'auto' &&
                                swiper.slides.length - params.slidesPerView >= 2
                                ? swiper.slidesSizesGrid[swiper.activeIndex + 1] +
                                    swiper.params.spaceBetween
                                : 0) -
                            swiper.params.spaceBetween
                        : swiper.minTranslate())) {
                swiper.loopFix({ direction: 'prev', setTranslate: true, activeSlideIndex: 0 });
            }
            if (data.currentTranslate > swiper.minTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) {
                    data.currentTranslate =
                        swiper.minTranslate() -
                            1 +
                            (-swiper.minTranslate() + startTranslate + diff) ** resistanceRatio;
                }
            }
        }
        else if (diff < 0) {
            if (isLoop &&
                allowLoopFix &&
                true &&
                data.allowThresholdMove &&
                data.currentTranslate <
                    (params.centeredSlides
                        ? swiper.maxTranslate() +
                            swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] +
                            swiper.params.spaceBetween +
                            (params.slidesPerView !== 'auto' &&
                                swiper.slides.length - params.slidesPerView >= 2
                                ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] +
                                    swiper.params.spaceBetween
                                : 0)
                        : swiper.maxTranslate())) {
                swiper.loopFix({
                    direction: 'next',
                    setTranslate: true,
                    activeSlideIndex: swiper.slides.length -
                        (params.slidesPerView === 'auto'
                            ? swiper.slidesPerViewDynamic()
                            : Math.ceil(parseFloat(String(params.slidesPerView)))),
                });
            }
            if (data.currentTranslate < swiper.maxTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) {
                    data.currentTranslate =
                        swiper.maxTranslate() +
                            1 -
                            (swiper.maxTranslate() - startTranslate - diff) ** resistanceRatio;
                }
            }
        }
        if (disableParentSwiper) {
            e.preventedByNestedSwiper = true;
        }
        // Directions locks
        if (!swiper.allowSlideNext &&
            swiper.swipeDirection === 'next' &&
            (data.currentTranslate ?? 0) < startTranslate) {
            data.currentTranslate = startTranslate;
        }
        if (!swiper.allowSlidePrev &&
            swiper.swipeDirection === 'prev' &&
            (data.currentTranslate ?? 0) > startTranslate) {
            data.currentTranslate = startTranslate;
        }
        if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
            data.currentTranslate = startTranslate;
        }
        // Threshold
        if (params.threshold > 0) {
            if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
                if (!data.allowThresholdMove) {
                    data.allowThresholdMove = true;
                    touches.startX = touches.currentX;
                    touches.startY = touches.currentY;
                    data.currentTranslate = data.startTranslate;
                    touches.diff = swiper.isHorizontal()
                        ? touches.currentX - touches.startX
                        : touches.currentY - touches.startY;
                    return;
                }
            }
            else {
                data.currentTranslate = data.startTranslate;
                return;
            }
        }
        if (!params.followFinger || params.cssMode)
            return;
        // Update active index in free mode
        if ((params.freeMode && params.freeMode.enabled && swiper.freeMode) ||
            params.watchSlidesProgress) {
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
            swiper.freeMode.onTouchMove();
        }
        // Update progress
        swiper.updateProgress(data.currentTranslate);
        // Update translate
        swiper.setTranslate(data.currentTranslate ?? 0);
    }

    // Modified from https://stackoverflow.com/questions/54520554/custom-element-getrootnode-closest-function-crossing-multiple-parent-shadowd
    function closestElement(selector, base) {
        function __closestFrom(el) {
            if (!el || el === document || el === window)
                return null;
            let cur = el;
            if (cur.assignedSlot)
                cur = cur.assignedSlot;
            const found = cur.closest(selector);
            if (!found && !cur.getRootNode) {
                return null;
            }
            const root = cur.getRootNode();
            return found || __closestFrom(root.host);
        }
        return __closestFrom(base);
    }
    function preventEdgeSwipe(swiper, event, startX) {
        const { params } = swiper;
        const edgeSwipeDetection = params.edgeSwipeDetection;
        const edgeSwipeThreshold = params.edgeSwipeThreshold;
        if (edgeSwipeDetection &&
            (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
            if (edgeSwipeDetection === 'prevent') {
                event.preventDefault();
                return true;
            }
            return false;
        }
        return true;
    }
    function onTouchStart(event) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        const e = event.originalEvent ?? event;
        const data = swiper.touchEventsData;
        if (e.type === 'pointerdown') {
            const pe = e;
            if (data.pointerId !== null && data.pointerId !== pe.pointerId) {
                return;
            }
            data.pointerId = pe.pointerId;
        }
        else if (e.type === 'touchstart' && e.targetTouches.length === 1) {
            data.touchId = e.targetTouches[0].identifier;
        }
        if (e.type === 'touchstart') {
            // don't proceed touch event
            preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
            return;
        }
        const { params, touches, enabled } = swiper;
        if (!enabled)
            return;
        if (!params.simulateTouch && e.pointerType === 'mouse')
            return;
        if (swiper.animating && params.preventInteractionOnTransition) {
            return;
        }
        if (!swiper.animating && params.cssMode && params.loop) {
            swiper.loopFix();
        }
        let targetEl = e.target;
        if (params.touchEventsTarget === 'wrapper') {
            if (!elementIsChildOf(targetEl, swiper.wrapperEl))
                return;
        }
        // Secondary mouse buttons (right-click / middle-click) shouldn't start a swipe.
        const mouseLike = e;
        if (typeof mouseLike.which === 'number' && mouseLike.which === 3)
            return;
        if (typeof mouseLike.button === 'number' && mouseLike.button > 0)
            return;
        if (data.isTouched && data.isMoved)
            return;
        // change target el for shadow root component
        const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';
        // `path` is a non-standard Chrome extension; `composedPath()` is the modern API.
        const eventPath = e.composedPath
            ? e.composedPath()
            : e.path;
        if (swipingClassHasValue &&
            e.target &&
            e.target.shadowRoot &&
            eventPath) {
            targetEl = eventPath[0];
        }
        const noSwipingSelector = params.noSwipingSelector
            ? params.noSwipingSelector
            : `.${params.noSwipingClass}`;
        const isTargetShadow = !!(e.target && e.target.shadowRoot);
        // use closestElement for shadow root element to get the actual closest for nested shadow root element
        if (params.noSwiping &&
            (isTargetShadow
                ? closestElement(noSwipingSelector, targetEl)
                : targetEl.closest(noSwipingSelector))) {
            swiper.allowClick = true;
            return;
        }
        if (params.swipeHandler) {
            if (typeof params.swipeHandler === 'string' && !targetEl.closest(params.swipeHandler))
                return;
        }
        // At this point `e` is a PointerEvent or MouseEvent (touchstart returned earlier).
        const pe = e;
        touches.currentX = pe.pageX;
        touches.currentY = pe.pageY;
        const startX = touches.currentX;
        const startY = touches.currentY;
        // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore
        if (!preventEdgeSwipe(swiper, e, startX)) {
            return;
        }
        Object.assign(data, {
            isTouched: true,
            isMoved: false,
            allowTouchCallbacks: true,
            isScrolling: undefined,
            startMoving: undefined,
        });
        touches.startX = startX;
        touches.startY = startY;
        data.touchStartTime = now();
        swiper.allowClick = true;
        swiper.updateSize();
        swiper.swipeDirection = undefined;
        if (params.threshold > 0)
            data.allowThresholdMove = false;
        let preventDefault = true;
        if (targetEl.matches(data.focusableElements)) {
            preventDefault = false;
            if (targetEl.nodeName === 'SELECT') {
                data.isTouched = false;
            }
        }
        if (document.activeElement &&
            document.activeElement.matches(data.focusableElements) &&
            document.activeElement !== targetEl &&
            (pe.pointerType === 'mouse' ||
                (pe.pointerType !== 'mouse' && !targetEl.matches(data.focusableElements)))) {
            document.activeElement.blur();
        }
        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if ((params.touchStartForcePreventDefault || shouldPreventDefault) &&
            !targetEl.isContentEditable) {
            e.preventDefault();
        }
        if (params.freeMode &&
            params.freeMode.enabled &&
            swiper.freeMode &&
            swiper.animating &&
            !params.cssMode) {
            swiper.freeMode.onTouchStart();
        }
        swiper.emit('touchStart', e);
    }

    const events = (swiper, method) => {
        const { params, el, wrapperEl, device } = swiper;
        const capture = !!params.nested;
        const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
        const swiperMethod = method;
        if (!el || typeof el === 'string')
            return;
        // Touch Events
        document[domMethod]('touchstart', swiper.onDocumentTouchStart, {
            passive: false,
            capture,
        });
        el[domMethod]('touchstart', swiper.onTouchStart, { passive: false });
        el[domMethod]('pointerdown', swiper.onTouchStart, { passive: false });
        document[domMethod]('touchmove', swiper.onTouchMove, {
            passive: false,
            capture,
        });
        document[domMethod]('pointermove', swiper.onTouchMove, {
            passive: false,
            capture,
        });
        document[domMethod]('touchend', swiper.onTouchEnd, { passive: true });
        document[domMethod]('pointerup', swiper.onTouchEnd, { passive: true });
        document[domMethod]('pointercancel', swiper.onTouchEnd, { passive: true });
        document[domMethod]('touchcancel', swiper.onTouchEnd, { passive: true });
        document[domMethod]('pointerout', swiper.onTouchEnd, { passive: true });
        document[domMethod]('pointerleave', swiper.onTouchEnd, { passive: true });
        document[domMethod]('contextmenu', swiper.onTouchEnd, { passive: true });
        // Prevent Links Clicks
        if (params.preventClicks || params.preventClicksPropagation) {
            el[domMethod]('click', swiper.onClick, true);
        }
        if (params.cssMode) {
            wrapperEl[domMethod]('scroll', swiper.onScroll);
        }
        // Resize handler
        const subscribe = (events) => {
            swiper[swiperMethod](events, onResize, true);
        };
        if (params.updateOnWindowResize) {
            subscribe(device.ios || device.android
                ? 'resize orientationchange observerUpdate'
                : 'resize observerUpdate');
        }
        else {
            subscribe('observerUpdate');
        }
        // Images loader
        el[domMethod]('load', swiper.onLoad, { capture: true });
    };
    function attachEvents() {
        const swiper = this;
        const { params } = swiper;
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
        swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
        if (params.cssMode) {
            swiper.onScroll = onScroll.bind(swiper);
        }
        swiper.onClick = onClick.bind(swiper);
        swiper.onLoad = onLoad.bind(swiper);
        events(swiper, 'on');
    }
    function detachEvents() {
        const swiper = this;
        events(swiper, 'off');
    }
    var events$1 = {
        attachEvents,
        detachEvents,
    };

    function setGrabCursor(moving) {
        const swiper = this;
        if (!swiper.params.simulateTouch ||
            (swiper.params.watchOverflow && swiper.isLocked) ||
            swiper.params.cssMode)
            return;
        const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
        if (swiper.isElement) {
            swiper.__preventObserver__ = true;
        }
        el.style.cursor = 'move';
        el.style.cursor = moving ? 'grabbing' : 'grab';
        if (swiper.isElement) {
            requestAnimationFrame(() => {
                swiper.__preventObserver__ = false;
            });
        }
    }

    function unsetGrabCursor() {
        const swiper = this;
        if ((swiper.params.watchOverflow && swiper.isLocked) || swiper.params.cssMode) {
            return;
        }
        if (swiper.isElement) {
            swiper.__preventObserver__ = true;
        }
        swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
        if (swiper.isElement) {
            requestAnimationFrame(() => {
                swiper.__preventObserver__ = false;
            });
        }
    }

    var grabCursor = {
        setGrabCursor,
        unsetGrabCursor,
    };

    function loopCreate(slideRealIndex, initial) {
        const swiper = this;
        const { params, slidesEl } = swiper;
        if (!params.loop || (swiper.virtual && swiper.params.virtual?.enabled))
            return;
        const initSlides = () => {
            const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            slides.forEach((el, index) => {
                el.setAttribute('data-swiper-slide-index', String(index));
            });
        };
        const clearBlankSlides = () => {
            const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
            slides.forEach((el) => {
                el.remove();
            });
            if (slides.length > 0) {
                swiper.recalcSlides();
                swiper.updateSlides();
            }
        };
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
            clearBlankSlides();
        }
        const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
        const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
        const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
        const addBlankSlides = (amountOfSlides) => {
            for (let i = 0; i < amountOfSlides; i += 1) {
                const slideEl = swiper.isElement
                    ? createElement('swiper-slide', [params.slideBlankClass])
                    : createElement('div', [params.slideClass, params.slideBlankClass]);
                swiper.slidesEl.append(slideEl);
            }
        };
        if (shouldFillGroup) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = slidesPerGroup - (swiper.slides.length % slidesPerGroup);
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            }
            else {
                showWarning('Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
            }
            initSlides();
        }
        else if (shouldFillGrid) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = params.grid.rows - (swiper.slides.length % params.grid.rows);
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            }
            else {
                showWarning('Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
            }
            initSlides();
        }
        else {
            initSlides();
        }
        const bothDirections = params.centeredSlides || !!params.slidesOffsetBefore || !!params.slidesOffsetAfter;
        swiper.loopFix({
            slideRealIndex,
            direction: bothDirections ? undefined : 'next',
            initial,
        });
    }

    function loopDestroy() {
        const swiper = this;
        const { params, slidesEl } = swiper;
        if (!params.loop || !slidesEl || (swiper.virtual && swiper.params.virtual?.enabled))
            return;
        swiper.recalcSlides();
        const newSlidesOrder = [];
        swiper.slides.forEach((slideEl) => {
            const loopSlideEl = slideEl;
            const index = typeof loopSlideEl.swiperSlideIndex === 'undefined'
                ? Number(slideEl.getAttribute('data-swiper-slide-index'))
                : loopSlideEl.swiperSlideIndex;
            newSlidesOrder[index] = slideEl;
        });
        swiper.slides.forEach((slideEl) => {
            slideEl.removeAttribute('data-swiper-slide-index');
        });
        newSlidesOrder.forEach((slideEl) => {
            slidesEl.append(slideEl);
        });
        swiper.recalcSlides();
        swiper.slideTo(swiper.realIndex, 0);
    }

    function loopFix(options = {}) {
        const { slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex: activeSlideIndexParam, initial, byController, byMousewheel, } = options;
        let activeSlideIndex = activeSlideIndexParam;
        const swiper = this;
        if (!swiper.params.loop)
            return;
        swiper.emit('beforeLoopFix');
        const { slides, allowSlidePrev, allowSlideNext, slidesEl, params } = swiper;
        const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter, initialSlide } = params;
        const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
        swiper.allowSlidePrev = true;
        swiper.allowSlideNext = true;
        if (swiper.virtual && params.virtual?.enabled) {
            if (slideTo) {
                const virtualSlidesLength = swiper.virtual.slides.length;
                const virtualSlidesBefore = swiper.virtual.slidesBefore ?? 0;
                if (!bothDirections && swiper.snapIndex === 0) {
                    swiper.slideTo(virtualSlidesLength, 0, false, true);
                }
                else if (bothDirections && swiper.snapIndex < params.slidesPerView) {
                    swiper.slideTo(virtualSlidesLength + swiper.snapIndex, 0, false, true);
                }
                else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
                    swiper.slideTo(virtualSlidesBefore, 0, false, true);
                }
            }
            swiper.allowSlidePrev = allowSlidePrev;
            swiper.allowSlideNext = allowSlideNext;
            swiper.emit('loopFix');
            return;
        }
        let slidesPerView = params.slidesPerView;
        if (slidesPerView === 'auto') {
            slidesPerView = swiper.slidesPerViewDynamic();
        }
        else {
            slidesPerView = Math.ceil(parseFloat(String(params.slidesPerView)));
            if (bothDirections && slidesPerView % 2 === 0) {
                slidesPerView = slidesPerView + 1;
            }
        }
        const slidesPerGroup = params.slidesPerGroupAuto
            ? slidesPerView
            : params.slidesPerGroup;
        let loopedSlides = bothDirections
            ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2))
            : slidesPerGroup;
        if (loopedSlides % slidesPerGroup !== 0) {
            loopedSlides += slidesPerGroup - (loopedSlides % slidesPerGroup);
        }
        loopedSlides += params.loopAdditionalSlides;
        swiper.loopedSlides = loopedSlides;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (slides.length < slidesPerView + loopedSlides ||
            (swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2)) {
            showWarning('Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters');
        }
        else if (gridEnabled && params.grid.fill === 'row') {
            showWarning('Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`');
        }
        const prependSlidesIndexes = [];
        const appendSlidesIndexes = [];
        const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
        const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !bothDirections;
        let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
        if (typeof activeSlideIndex === 'undefined') {
            activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
        }
        else {
            activeIndex = activeSlideIndex;
        }
        const isNext = direction === 'next' || !direction;
        const isPrev = direction === 'prev' || !direction;
        let slidesPrepended = 0;
        let slidesAppended = 0;
        const activeColIndex = gridEnabled
            ? (slides[activeSlideIndex].column ?? 0)
            : activeSlideIndex;
        const activeColIndexWithShift = activeColIndex +
            (bothDirections && typeof setTranslate === 'undefined' ? -slidesPerView / 2 + 0.5 : 0);
        // prepend last slides before start
        if (activeColIndexWithShift < loopedSlides) {
            slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
            for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) {
                    const colIndexToPrepend = cols - index - 1;
                    for (let j = slides.length - 1; j >= 0; j -= 1) {
                        if (slides[j].column === colIndexToPrepend)
                            prependSlidesIndexes.push(j);
                    }
                }
                else {
                    prependSlidesIndexes.push(cols - index - 1);
                }
            }
        }
        else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
            slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
            if (isInitialOverflow) {
                slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
            }
            for (let i = 0; i < slidesAppended; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) {
                    slides.forEach((slide, slideIndex) => {
                        if (slide.column === index)
                            appendSlidesIndexes.push(slideIndex);
                    });
                }
                else {
                    appendSlidesIndexes.push(index);
                }
            }
        }
        swiper.__preventObserver__ = true;
        requestAnimationFrame(() => {
            swiper.__preventObserver__ = false;
        });
        if (swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2) {
            if (appendSlidesIndexes.includes(activeSlideIndex)) {
                appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
            }
            if (prependSlidesIndexes.includes(activeSlideIndex)) {
                prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
            }
        }
        if (isPrev) {
            prependSlidesIndexes.forEach((index) => {
                const slideEl = slides[index];
                slideEl.swiperLoopMoveDOM = true;
                slidesEl.prepend(slideEl);
                slideEl.swiperLoopMoveDOM = false;
            });
        }
        if (isNext) {
            appendSlidesIndexes.forEach((index) => {
                const slideEl = slides[index];
                slideEl.swiperLoopMoveDOM = true;
                slidesEl.append(slideEl);
                slideEl.swiperLoopMoveDOM = false;
            });
        }
        swiper.recalcSlides();
        if (params.slidesPerView === 'auto') {
            swiper.updateSlides();
        }
        else if (gridEnabled &&
            ((prependSlidesIndexes.length > 0 && isPrev) || (appendSlidesIndexes.length > 0 && isNext))) {
            swiper.slides.forEach((slide, slideIndex) => {
                swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
            });
        }
        if (params.watchSlidesProgress) {
            swiper.updateSlidesOffset();
        }
        if (slideTo) {
            if (prependSlidesIndexes.length > 0 && isPrev) {
                if (typeof slideRealIndex === 'undefined') {
                    const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                    const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                    const diff = newSlideTranslate - currentSlideTranslate;
                    if (byMousewheel) {
                        swiper.setTranslate(swiper.translate - diff);
                    }
                    else {
                        swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
                        if (setTranslate) {
                            swiper.touchEventsData.startTranslate =
                                swiper.touchEventsData.startTranslate - diff;
                            swiper.touchEventsData.currentTranslate =
                                swiper.touchEventsData.currentTranslate - diff;
                        }
                    }
                }
                else {
                    if (setTranslate) {
                        const shift = gridEnabled
                            ? prependSlidesIndexes.length / params.grid.rows
                            : prependSlidesIndexes.length;
                        swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
                        swiper.touchEventsData.currentTranslate = swiper.translate;
                    }
                }
            }
            else if (appendSlidesIndexes.length > 0 && isNext) {
                if (typeof slideRealIndex === 'undefined') {
                    const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                    const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
                    const diff = newSlideTranslate - currentSlideTranslate;
                    if (byMousewheel) {
                        swiper.setTranslate(swiper.translate - diff);
                    }
                    else {
                        swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                        if (setTranslate) {
                            swiper.touchEventsData.startTranslate =
                                swiper.touchEventsData.startTranslate - diff;
                            swiper.touchEventsData.currentTranslate =
                                swiper.touchEventsData.currentTranslate - diff;
                        }
                    }
                }
                else {
                    const shift = gridEnabled
                        ? appendSlidesIndexes.length / params.grid.rows
                        : appendSlidesIndexes.length;
                    swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
                }
            }
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        const controlled = swiper.controller?.control;
        if (controlled && !byController) {
            const loopParams = {
                slideRealIndex,
                direction,
                setTranslate,
                activeSlideIndex,
                byController: true,
            };
            if (Array.isArray(controlled)) {
                controlled.forEach((c) => {
                    if (!c.destroyed && c.params.loop)
                        c.loopFix({
                            ...loopParams,
                            slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false,
                        });
                });
            }
            else if (controlled instanceof swiper.constructor &&
                controlled.params.loop) {
                controlled.loopFix({
                    ...loopParams,
                    slideTo: controlled.params.slidesPerView === params.slidesPerView ? slideTo : false,
                });
            }
        }
        swiper.emit('loopFix');
    }

    var loop = {
        loopCreate,
        loopFix,
        loopDestroy,
    };

    function moduleExtendParams(params, allModulesParams) {
        return function extendParams(obj = {}) {
            const moduleParamName = Object.keys(obj)[0];
            const moduleParams = obj[moduleParamName];
            if (typeof moduleParams !== 'object' || moduleParams === null) {
                extend(allModulesParams, obj);
                return;
            }
            if (params[moduleParamName] === true) {
                params[moduleParamName] = { enabled: true };
            }
            if (moduleParamName === 'navigation' &&
                params[moduleParamName] &&
                params[moduleParamName].enabled &&
                !params[moduleParamName].prevEl &&
                !params[moduleParamName].nextEl) {
                params[moduleParamName].auto = true;
            }
            if (['pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 &&
                params[moduleParamName] &&
                params[moduleParamName].enabled &&
                !params[moduleParamName].el) {
                params[moduleParamName].auto = true;
            }
            if (!(moduleParamName in params && 'enabled' in moduleParams)) {
                extend(allModulesParams, obj);
                return;
            }
            if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
                params[moduleParamName].enabled = true;
            }
            if (!params[moduleParamName])
                params[moduleParamName] = { enabled: false };
            extend(allModulesParams, obj);
        };
    }

    const Observer = ({ swiper, extendParams, on }) => {
        const observers = [];
        const attach = (target, options = {}) => {
            const ObserverFunc = window.MutationObserver ||
                window
                    .WebkitMutationObserver;
            if (!ObserverFunc)
                return;
            const observer = new ObserverFunc((mutations) => {
                // The observerUpdate event should only be triggered
                // once despite the number of mutations.  Additional
                // triggers are redundant and are very costly
                if (swiper.__preventObserver__)
                    return;
                if (mutations.length === 1) {
                    swiper.emit('observerUpdate', mutations[0]);
                    return;
                }
                const observerUpdate = function observerUpdate() {
                    swiper.emit('observerUpdate', mutations[0]);
                };
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(observerUpdate);
                }
                else {
                    window.setTimeout(observerUpdate, 0);
                }
            });
            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: swiper.isElement || (typeof options.childList === 'undefined' ? true : options.childList),
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData,
            });
            observers.push(observer);
        };
        const init = () => {
            if (!swiper.params.observer)
                return;
            if (swiper.params.observeParents) {
                const containerParents = elementParents(swiper.hostEl);
                for (let i = 0; i < containerParents.length; i += 1) {
                    attach(containerParents[i]);
                }
            }
            // Observe container
            attach(swiper.hostEl, {
                childList: swiper.params.observeSlideChildren,
            });
            // Observe wrapper
            attach(swiper.wrapperEl, { attributes: false });
        };
        const destroy = () => {
            observers.forEach((observer) => {
                observer.disconnect();
            });
            observers.splice(0, observers.length);
        };
        extendParams({
            observer: false,
            observeParents: false,
            observeSlideChildren: false,
        });
        on('init', init);
        on('destroy', destroy);
    };

    const Resize = ({ swiper, on, emit }) => {
        let observer = null;
        let animationFrame = null;
        const resizeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized)
                return;
            emit('beforeResize');
            emit('resize');
        };
        const createObserver = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized)
                return;
            observer = new ResizeObserver((entries) => {
                animationFrame = window.requestAnimationFrame(() => {
                    const { width, height } = swiper;
                    let newWidth = width;
                    let newHeight = height;
                    entries.forEach(({ contentBoxSize, contentRect, target }) => {
                        if (target && target !== swiper.el)
                            return;
                        // Older Safari (≤15) exposed `contentBoxSize` as a single object instead of an array.
                        const box = Array.isArray(contentBoxSize)
                            ? contentBoxSize[0]
                            : contentBoxSize;
                        newWidth = contentRect ? contentRect.width : box.inlineSize;
                        newHeight = contentRect ? contentRect.height : box.blockSize;
                    });
                    if (newWidth !== width || newHeight !== height) {
                        resizeHandler();
                    }
                });
            });
            observer.observe(swiper.el);
        };
        const removeObserver = () => {
            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
            }
            if (observer && observer.unobserve && swiper.el) {
                observer.unobserve(swiper.el);
                observer = null;
            }
        };
        const orientationChangeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized)
                return;
            emit('orientationchange');
        };
        on('init', () => {
            if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
                createObserver();
                return;
            }
            window.addEventListener('resize', resizeHandler);
            window.addEventListener('orientationchange', orientationChangeHandler);
        });
        on('destroy', () => {
            removeObserver();
            window.removeEventListener('resize', resizeHandler);
            window.removeEventListener('orientationchange', orientationChangeHandler);
        });
    };

    function slideNext(speed, runCallbacks = true, internal) {
        const swiper = this;
        const { enabled, params, animating } = swiper;
        if (!enabled || swiper.destroyed)
            return swiper;
        if (typeof speed === 'undefined') {
            speed = swiper.params.speed;
        }
        let perGroup = params.slidesPerGroup;
        if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
            perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
        }
        const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
        const isVirtual = swiper.virtual && params.virtual?.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding)
                return false;
            swiper.loopFix({ direction: 'next' });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
            if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
                requestAnimationFrame(() => {
                    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
                });
                return true;
            }
        }
        if (params.rewind && swiper.isEnd) {
            return swiper.slideTo(0, speed, runCallbacks, internal);
        }
        return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }

    function slidePrev(speed, runCallbacks = true, internal) {
        const swiper = this;
        const { params, snapGrid, slidesGrid, rtlTranslate, enabled, animating } = swiper;
        if (!enabled || swiper.destroyed)
            return swiper;
        if (typeof speed === 'undefined') {
            speed = swiper.params.speed;
        }
        const isVirtual = swiper.virtual && params.virtual?.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding)
                return false;
            swiper.loopFix({ direction: 'prev' });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
        }
        const translate = rtlTranslate ? swiper.translate : -swiper.translate;
        function normalize(val) {
            if (val < 0)
                return -Math.floor(Math.abs(val));
            return Math.floor(val);
        }
        const normalizedTranslate = normalize(translate);
        const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
        const isFreeMode = params.freeMode && params.freeMode.enabled;
        let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
        if (typeof prevSnap === 'undefined' && (params.cssMode || isFreeMode)) {
            let prevSnapIndex;
            snapGrid.forEach((snap, snapIndex) => {
                if (normalizedTranslate >= snap) {
                    prevSnapIndex = snapIndex;
                }
            });
            if (typeof prevSnapIndex !== 'undefined') {
                prevSnap = isFreeMode
                    ? snapGrid[prevSnapIndex]
                    : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
            }
        }
        let prevIndex = 0;
        if (typeof prevSnap !== 'undefined') {
            prevIndex = slidesGrid.indexOf(prevSnap);
            if (prevIndex < 0)
                prevIndex = swiper.activeIndex - 1;
            if (params.slidesPerView === 'auto' &&
                params.slidesPerGroup === 1 &&
                params.slidesPerGroupAuto) {
                prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
                prevIndex = Math.max(prevIndex, 0);
            }
        }
        if (params.rewind && swiper.isBeginning) {
            const lastIndex = swiper.params.virtual?.enabled && swiper.virtual
                ? swiper.virtual.slides.length - 1
                : swiper.slides.length - 1;
            return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
        }
        else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
            requestAnimationFrame(() => {
                swiper.slideTo(prevIndex, speed, runCallbacks, internal);
            });
            return true;
        }
        return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }

    function slideReset(speed, runCallbacks = true, internal) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        if (typeof speed === 'undefined') {
            speed = swiper.params.speed;
        }
        return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }

    function slideTo(index = 0, speed, runCallbacks = true, internal, initial) {
        if (typeof index === 'string') {
            index = parseInt(index, 10);
        }
        const swiper = this;
        let slideIndex = index;
        if (slideIndex < 0)
            slideIndex = 0;
        const { params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled, } = swiper;
        if ((!enabled && !internal && !initial) ||
            swiper.destroyed ||
            (swiper.animating && params.preventInteractionOnTransition)) {
            return false;
        }
        if (typeof speed === 'undefined') {
            speed = swiper.params.speed;
        }
        const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
        let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
        if (snapIndex >= snapGrid.length)
            snapIndex = snapGrid.length - 1;
        const translate = -snapGrid[snapIndex];
        // Normalize slideIndex
        if (params.normalizeSlideIndex) {
            for (let i = 0; i < slidesGrid.length; i += 1) {
                const normalizedTranslate = -Math.floor(translate * 100);
                const normalizedGrid = Math.floor(slidesGrid[i] * 100);
                const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
                if (typeof slidesGrid[i + 1] !== 'undefined') {
                    if (normalizedTranslate >= normalizedGrid &&
                        normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
                        slideIndex = i;
                    }
                    else if (normalizedTranslate >= normalizedGrid &&
                        normalizedTranslate < normalizedGridNext) {
                        slideIndex = i + 1;
                    }
                }
                else if (normalizedTranslate >= normalizedGrid) {
                    slideIndex = i;
                }
            }
        }
        // Directions locks
        if (swiper.initialized && slideIndex !== activeIndex) {
            if (!swiper.allowSlideNext &&
                (rtl
                    ? translate > swiper.translate && translate > swiper.minTranslate()
                    : translate < swiper.translate && translate < swiper.minTranslate())) {
                return false;
            }
            if (!swiper.allowSlidePrev &&
                translate > swiper.translate &&
                translate > swiper.maxTranslate()) {
                if ((activeIndex || 0) !== slideIndex) {
                    return false;
                }
            }
        }
        if (slideIndex !== (previousIndex || 0) && runCallbacks) {
            swiper.emit('beforeSlideChangeStart');
        }
        // Update progress
        swiper.updateProgress(translate);
        let direction;
        if (slideIndex > activeIndex)
            direction = 'next';
        else if (slideIndex < activeIndex)
            direction = 'prev';
        else
            direction = 'reset';
        // initial virtual
        const isVirtual = swiper.virtual && swiper.params.virtual?.enabled;
        const isInitialVirtual = isVirtual && initial;
        // Update Index
        if (!isInitialVirtual &&
            ((rtl && -translate === swiper.translate) || (!rtl && translate === swiper.translate))) {
            swiper.updateActiveIndex(slideIndex);
            // Update Height
            if (params.autoHeight) {
                swiper.updateAutoHeight();
            }
            swiper.updateSlidesClasses();
            if (params.effect !== 'slide') {
                swiper.setTranslate(translate);
            }
            if (direction !== 'reset') {
                swiper.transitionStart(runCallbacks, direction);
                swiper.transitionEnd(runCallbacks, direction);
            }
            return false;
        }
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            const t = rtl ? translate : -translate;
            if (speed === 0) {
                if (isVirtual) {
                    swiper.wrapperEl.style.scrollSnapType = 'none';
                    swiper._immediateVirtual = true;
                }
                if (isVirtual && !swiper._cssModeVirtualInitialSet && (swiper.params.initialSlide ?? 0) > 0) {
                    swiper._cssModeVirtualInitialSet = true;
                    requestAnimationFrame(() => {
                        wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
                    });
                }
                else {
                    wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
                }
                if (isVirtual) {
                    requestAnimationFrame(() => {
                        swiper.wrapperEl.style.scrollSnapType = '';
                        swiper._immediateVirtual = false;
                    });
                }
            }
            else {
                wrapperEl.scrollTo({
                    [isH ? 'left' : 'top']: t,
                    behavior: 'smooth',
                });
            }
            return true;
        }
        const browser = getBrowser();
        const isSafari = browser.isSafari;
        if (isVirtual && !initial && isSafari && swiper.isElement) {
            swiper.virtual.update(false, false, slideIndex);
        }
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit('beforeTransitionStart', speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (speed === 0) {
            swiper.transitionEnd(runCallbacks, direction);
        }
        else if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onSlideToWrapperTransitionEnd) {
                swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed)
                        return;
                    if (e.target !== this)
                        return;
                    swiper.wrapperEl.removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
                    swiper.onSlideToWrapperTransitionEnd = null;
                    delete swiper.onSlideToWrapperTransitionEnd;
                    swiper.transitionEnd(runCallbacks, direction);
                };
            }
            swiper.wrapperEl.addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
        }
        return true;
    }

    function slideToClickedSlide() {
        const swiper = this;
        if (swiper.destroyed)
            return;
        const { params, slidesEl, clickedSlide, clickedIndex } = swiper;
        if (clickedSlide === undefined || clickedIndex === undefined)
            return;
        const slidesPerView = params.slidesPerView === 'auto'
            ? swiper.slidesPerViewDynamic()
            : params.slidesPerView;
        let slideToIndex = swiper.getSlideIndexWhenGrid(clickedIndex);
        let realIndex;
        const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
        const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        if (params.loop) {
            if (swiper.animating)
                return;
            realIndex = parseInt(clickedSlide.getAttribute('data-swiper-slide-index'), 10);
            if (params.centeredSlides) {
                swiper.slideToLoop(realIndex);
            }
            else if (slideToIndex >
                (isGrid
                    ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1)
                    : swiper.slides.length - slidesPerView)) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                nextTick(() => {
                    swiper.slideTo(slideToIndex);
                });
            }
            else {
                swiper.slideTo(slideToIndex);
            }
        }
        else {
            swiper.slideTo(slideToIndex);
        }
    }

    function slideToClosest(speed, runCallbacks = true, internal, threshold = 0.5) {
        const swiper = this;
        if (swiper.destroyed)
            return;
        if (typeof speed === 'undefined') {
            speed = swiper.params.speed;
        }
        let index = swiper.activeIndex;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
        const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        if (translate >= swiper.snapGrid[snapIndex]) {
            // The current translate is on or after the current snap index, so the choice
            // is between the current index and the one after it.
            const currentSnap = swiper.snapGrid[snapIndex];
            const nextSnap = swiper.snapGrid[snapIndex + 1];
            if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
                index += swiper.params.slidesPerGroup;
            }
        }
        else {
            // The current translate is before the current snap index, so the choice
            // is between the current index and the one before it.
            const prevSnap = swiper.snapGrid[snapIndex - 1];
            const currentSnap = swiper.snapGrid[snapIndex];
            if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
                index -= swiper.params.slidesPerGroup;
            }
        }
        index = Math.max(index, 0);
        index = Math.min(index, swiper.slidesGrid.length - 1);
        return swiper.slideTo(index, speed, runCallbacks, internal);
    }

    function slideToLoop(index = 0, speed, runCallbacks = true, internal) {
        if (typeof index === 'string') {
            const indexAsNumber = parseInt(index, 10);
            index = indexAsNumber;
        }
        const swiper = this;
        if (swiper.destroyed)
            return;
        if (typeof speed === 'undefined') {
            speed = swiper.params.speed;
        }
        const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        let newIndex = index;
        if (swiper.params.loop) {
            if (swiper.virtual && swiper.params.virtual?.enabled) {
                newIndex = newIndex + (swiper.virtual.slidesBefore ?? 0);
            }
            else {
                let targetSlideIndex;
                if (gridEnabled) {
                    const slideIndex = newIndex * swiper.params.grid.rows;
                    const targetSlideEl = swiper.slides.find((slideEl) => Number(slideEl.getAttribute('data-swiper-slide-index')) === slideIndex);
                    targetSlideIndex = targetSlideEl?.column ?? 0;
                }
                else {
                    targetSlideIndex = swiper.getSlideIndexByData(newIndex);
                }
                const cols = gridEnabled
                    ? Math.ceil(swiper.slides.length / swiper.params.grid.rows)
                    : swiper.slides.length;
                const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter } = swiper.params;
                const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
                let slidesPerView;
                if (swiper.params.slidesPerView === 'auto') {
                    slidesPerView = swiper.slidesPerViewDynamic();
                }
                else {
                    slidesPerView = Math.ceil(parseFloat(String(swiper.params.slidesPerView)));
                    if (bothDirections && slidesPerView % 2 === 0) {
                        slidesPerView = slidesPerView + 1;
                    }
                }
                let needLoopFix = cols - targetSlideIndex < slidesPerView;
                if (bothDirections) {
                    needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
                }
                if (internal && bothDirections && swiper.params.slidesPerView !== 'auto' && !gridEnabled) {
                    needLoopFix = false;
                }
                if (needLoopFix) {
                    const direction = bothDirections
                        ? targetSlideIndex < swiper.activeIndex
                            ? 'prev'
                            : 'next'
                        : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView
                            ? 'next'
                            : 'prev';
                    swiper.loopFix({
                        direction,
                        slideTo: true,
                        activeSlideIndex: direction === 'next' ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
                        slideRealIndex: direction === 'next' ? swiper.realIndex : undefined,
                    });
                }
                if (gridEnabled) {
                    const slideIndex = newIndex * swiper.params.grid.rows;
                    const targetSlideEl = swiper.slides.find((slideEl) => Number(slideEl.getAttribute('data-swiper-slide-index')) === slideIndex);
                    newIndex = targetSlideEl?.column ?? 0;
                }
                else {
                    newIndex = swiper.getSlideIndexByData(newIndex);
                }
            }
        }
        requestAnimationFrame(() => {
            swiper.slideTo(newIndex, speed, runCallbacks, internal);
        });
        return swiper;
    }

    var slide = {
        slideTo,
        slideToLoop,
        slideNext,
        slidePrev,
        slideReset,
        slideToClosest,
        slideToClickedSlide,
    };

    function setTransition(duration, byController) {
        const swiper = this;
        if (!swiper.params.cssMode) {
            swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
            swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : '';
        }
        swiper.emit('setTransition', duration, byController);
    }

    function transitionEmit({ swiper, runCallbacks, direction, step, }) {
        const { activeIndex, previousIndex } = swiper;
        let dir = direction;
        if (!dir) {
            if (activeIndex > previousIndex)
                dir = 'next';
            else if (activeIndex < previousIndex)
                dir = 'prev';
            else
                dir = 'reset';
        }
        swiper.emit(`transition${step}`);
        if (runCallbacks && dir === 'reset') {
            swiper.emit(`slideResetTransition${step}`);
        }
        else if (runCallbacks && activeIndex !== previousIndex) {
            swiper.emit(`slideChangeTransition${step}`);
            if (dir === 'next') {
                swiper.emit(`slideNextTransition${step}`);
            }
            else {
                swiper.emit(`slidePrevTransition${step}`);
            }
        }
    }

    function transitionEnd(runCallbacks = true, direction) {
        const swiper = this;
        const { params } = swiper;
        swiper.animating = false;
        if (params.cssMode)
            return;
        swiper.setTransition(0);
        transitionEmit({ swiper, runCallbacks, direction, step: 'End' });
    }

    function transitionStart(runCallbacks = true, direction) {
        const swiper = this;
        const { params } = swiper;
        if (params.cssMode)
            return;
        if (params.autoHeight) {
            swiper.updateAutoHeight();
        }
        transitionEmit({ swiper, runCallbacks, direction, step: 'Start' });
    }

    var transition = {
        setTransition,
        transitionStart,
        transitionEnd,
    };

    function getSwiperTranslate(axis = this.isHorizontal() ? 'x' : 'y') {
        const swiper = this;
        const { params, rtlTranslate: rtl, translate, wrapperEl } = swiper;
        if (params.virtualTranslate) {
            return rtl ? -translate : translate;
        }
        if (params.cssMode) {
            return translate;
        }
        let currentTranslate = getTranslate(wrapperEl, axis);
        currentTranslate += swiper.cssOverflowAdjustment();
        if (rtl)
            currentTranslate = -currentTranslate;
        return currentTranslate || 0;
    }

    function maxTranslate() {
        return -this.snapGrid[this.snapGrid.length - 1];
    }

    function minTranslate() {
        return -this.snapGrid[0];
    }

    function setTranslate(translate, byController) {
        const swiper = this;
        const { rtlTranslate: rtl, params, wrapperEl, progress } = swiper;
        let x = 0;
        let y = 0;
        const z = 0;
        if (swiper.isHorizontal()) {
            x = rtl ? -translate : translate;
        }
        else {
            y = translate;
        }
        if (params.roundLengths) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        swiper.previousTranslate = swiper.translate;
        swiper.translate = swiper.isHorizontal() ? x : y;
        if (params.cssMode) {
            wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
        }
        else if (!params.virtualTranslate) {
            if (swiper.isHorizontal()) {
                x -= swiper.cssOverflowAdjustment();
            }
            else {
                y -= swiper.cssOverflowAdjustment();
            }
            wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        }
        // Check if we need to update progress
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) {
            newProgress = 0;
        }
        else {
            newProgress = (translate - swiper.minTranslate()) / translatesDiff;
        }
        if (newProgress !== progress) {
            swiper.updateProgress(translate);
        }
        swiper.emit('setTranslate', swiper.translate, byController);
    }

    function translateTo(translate = 0, speed = this.params.speed, runCallbacks = true, translateBounds = true, internal) {
        const swiper = this;
        const { params, wrapperEl } = swiper;
        if (swiper.animating && params.preventInteractionOnTransition) {
            return false;
        }
        const minTranslate = swiper.minTranslate();
        const maxTranslate = swiper.maxTranslate();
        let newTranslate;
        if (translateBounds && translate > minTranslate)
            newTranslate = minTranslate;
        else if (translateBounds && translate < maxTranslate)
            newTranslate = maxTranslate;
        else
            newTranslate = translate;
        // Update progress
        swiper.updateProgress(newTranslate);
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            if (speed === 0) {
                wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
            }
            else {
                wrapperEl.scrollTo({
                    [isH ? 'left' : 'top']: -newTranslate,
                    behavior: 'smooth',
                });
            }
            return true;
        }
        if (speed === 0) {
            swiper.setTransition(0);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit('beforeTransitionStart', speed, internal);
                swiper.emit('transitionEnd');
            }
        }
        else {
            swiper.setTransition(speed);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit('beforeTransitionStart', speed, internal);
                swiper.emit('transitionStart');
            }
            if (!swiper.animating) {
                swiper.animating = true;
                if (!swiper.onTranslateToWrapperTransitionEnd) {
                    swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                        if (!swiper || swiper.destroyed)
                            return;
                        if (e.target !== this)
                            return;
                        swiper.wrapperEl.removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
                        swiper.onTranslateToWrapperTransitionEnd = null;
                        delete swiper.onTranslateToWrapperTransitionEnd;
                        swiper.animating = false;
                        if (runCallbacks) {
                            swiper.emit('transitionEnd');
                        }
                    };
                }
                swiper.wrapperEl.addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
            }
        }
        return true;
    }

    var translate = {
        getTranslate: getSwiperTranslate,
        setTranslate,
        minTranslate,
        maxTranslate,
        translateTo,
    };

    function getActiveIndexByTranslate(swiper) {
        const { slidesGrid, params } = swiper;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        let activeIndex;
        for (let i = 0; i < slidesGrid.length; i += 1) {
            if (typeof slidesGrid[i + 1] !== 'undefined') {
                if (translate >= slidesGrid[i] &&
                    translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
                    activeIndex = i;
                }
                else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
                    activeIndex = i + 1;
                }
            }
            else if (translate >= slidesGrid[i]) {
                activeIndex = i;
            }
        }
        // Normalize slideIndex
        if (params.normalizeSlideIndex) {
            if (activeIndex < 0 || typeof activeIndex === 'undefined')
                activeIndex = 0;
        }
        return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
        const swiper = this;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        const { snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex, } = swiper;
        let activeIndex = newActiveIndex;
        let snapIndex;
        const getVirtualRealIndex = (aIndex) => {
            const virtualSlides = swiper.virtual.slides;
            let realIndex = aIndex - (swiper.virtual.slidesBefore ?? 0);
            if (realIndex < 0) {
                realIndex = virtualSlides.length + realIndex;
            }
            if (realIndex >= virtualSlides.length) {
                realIndex -= virtualSlides.length;
            }
            return realIndex;
        };
        if (typeof activeIndex === 'undefined') {
            activeIndex = getActiveIndexByTranslate(swiper);
        }
        if (snapGrid.indexOf(translate) >= 0) {
            snapIndex = snapGrid.indexOf(translate);
        }
        else {
            const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
            snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
        }
        if (snapIndex >= snapGrid.length)
            snapIndex = snapGrid.length - 1;
        if (activeIndex === previousIndex && !swiper.params.loop) {
            if (snapIndex !== previousSnapIndex) {
                swiper.snapIndex = snapIndex;
                swiper.emit('snapIndexChange');
            }
            return;
        }
        if (activeIndex === previousIndex &&
            swiper.params.loop &&
            swiper.virtual &&
            swiper.params.virtual?.enabled) {
            swiper.realIndex = getVirtualRealIndex(activeIndex);
            return;
        }
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        // Get real index
        let realIndex;
        if (swiper.virtual && params.virtual?.enabled) {
            if (params.loop) {
                realIndex = getVirtualRealIndex(activeIndex);
            }
            else {
                realIndex = activeIndex;
            }
        }
        else if (gridEnabled) {
            const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
            let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute('data-swiper-slide-index'), 10);
            if (Number.isNaN(activeSlideIndex)) {
                activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
            }
            realIndex = Math.floor(activeSlideIndex / params.grid.rows);
        }
        else if (swiper.slides[activeIndex]) {
            const slideIndex = swiper.slides[activeIndex].getAttribute('data-swiper-slide-index');
            if (slideIndex) {
                realIndex = parseInt(slideIndex, 10);
            }
            else {
                realIndex = activeIndex;
            }
        }
        else {
            realIndex = activeIndex;
        }
        Object.assign(swiper, {
            previousSnapIndex,
            snapIndex,
            previousRealIndex,
            realIndex,
            previousIndex,
            activeIndex,
        });
        if (swiper.initialized) {
            preload(swiper);
        }
        swiper.emit('activeIndexChange');
        swiper.emit('snapIndexChange');
        if (swiper.initialized || swiper.params.runCallbacksOnInit) {
            if (previousRealIndex !== realIndex) {
                swiper.emit('realIndexChange');
            }
            swiper.emit('slideChange');
        }
    }

    function updateAutoHeight(speed) {
        const swiper = this;
        const activeSlides = [];
        const isVirtual = swiper.virtual && swiper.params.virtual?.enabled;
        let newHeight = 0;
        let i;
        if (typeof speed === 'number') {
            swiper.setTransition(speed);
        }
        else if (speed === true) {
            swiper.setTransition(swiper.params.speed);
        }
        const getSlideByIndex = (index) => {
            if (isVirtual) {
                return swiper.slides[swiper.getSlideIndexByData(index)];
            }
            return swiper.slides[index];
        };
        // Find slides currently in view
        if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
            if (swiper.params.centeredSlides) {
                (swiper.visibleSlides || []).forEach((slide) => {
                    activeSlides.push(slide);
                });
            }
            else {
                for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
                    const index = swiper.activeIndex + i;
                    if (index > swiper.slides.length && !isVirtual)
                        break;
                    const slide = getSlideByIndex(index);
                    if (slide)
                        activeSlides.push(slide);
                }
            }
        }
        else {
            const slide = getSlideByIndex(swiper.activeIndex);
            if (slide)
                activeSlides.push(slide);
        }
        // Find new height from highest slide in view
        for (i = 0; i < activeSlides.length; i += 1) {
            if (typeof activeSlides[i] !== 'undefined') {
                const height = activeSlides[i].offsetHeight;
                newHeight = height > newHeight ? height : newHeight;
            }
        }
        // Update Height
        if (newHeight || newHeight === 0)
            swiper.wrapperEl.style.height = `${newHeight}px`;
    }

    function updateClickedSlide(el, path) {
        const swiper = this;
        const params = swiper.params;
        let slide = el.closest(`.${params.slideClass}, swiper-slide`);
        if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) {
            [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
                if (!slide &&
                    pathEl.matches &&
                    pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
                    slide = pathEl;
                }
            });
        }
        let slideFound = false;
        let slideIndex;
        if (slide) {
            for (let i = 0; i < swiper.slides.length; i += 1) {
                if (swiper.slides[i] === slide) {
                    slideFound = true;
                    slideIndex = i;
                    break;
                }
            }
        }
        if (slide && slideFound) {
            swiper.clickedSlide = slide;
            if (swiper.virtual && swiper.params.virtual?.enabled) {
                swiper.clickedIndex = parseInt(slide.getAttribute('data-swiper-slide-index'), 10);
            }
            else {
                swiper.clickedIndex = slideIndex;
            }
        }
        else {
            swiper.clickedSlide = undefined;
            swiper.clickedIndex = undefined;
            return;
        }
        if (params.slideToClickedSlide &&
            swiper.clickedIndex !== undefined &&
            swiper.clickedIndex !== swiper.activeIndex) {
            swiper.slideToClickedSlide();
        }
    }

    function updateProgress(translate) {
        const swiper = this;
        if (typeof translate === 'undefined') {
            const multiplier = swiper.rtlTranslate ? -1 : 1;
            translate = (swiper && swiper.translate && swiper.translate * multiplier) || 0;
        }
        const params = swiper.params;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        let { progress, isBeginning, isEnd } = swiper;
        let progressLoop = swiper.progressLoop;
        const wasBeginning = isBeginning;
        const wasEnd = isEnd;
        if (translatesDiff === 0) {
            progress = 0;
            isBeginning = true;
            isEnd = true;
        }
        else {
            progress = (translate - swiper.minTranslate()) / translatesDiff;
            const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
            const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
            isBeginning = isBeginningRounded || progress <= 0;
            isEnd = isEndRounded || progress >= 1;
            if (isBeginningRounded)
                progress = 0;
            if (isEndRounded)
                progress = 1;
        }
        if (params.loop) {
            const firstSlideIndex = swiper.getSlideIndexByData(0);
            const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
            const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
            const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
            const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
            const translateAbs = Math.abs(translate);
            if (translateAbs >= firstSlideTranslate) {
                progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
            }
            else {
                progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
            }
            if (progressLoop > 1)
                progressLoop -= 1;
        }
        Object.assign(swiper, {
            progress,
            progressLoop,
            isBeginning,
            isEnd,
        });
        if (params.watchSlidesProgress || (params.centeredSlides && params.autoHeight))
            swiper.updateSlidesProgress(translate);
        if (isBeginning && !wasBeginning) {
            swiper.emit('reachBeginning toEdge');
        }
        if (isEnd && !wasEnd) {
            swiper.emit('reachEnd toEdge');
        }
        if ((wasBeginning && !isBeginning) || (wasEnd && !isEnd)) {
            swiper.emit('fromEdge');
        }
        swiper.emit('progress', progress);
    }

    function updateSize() {
        const swiper = this;
        let width;
        let height;
        const el = swiper.el;
        if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
            width = swiper.params.width;
        }
        else {
            width = el.clientWidth;
        }
        if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
            height = swiper.params.height;
        }
        else {
            height = el.clientHeight;
        }
        if ((width === 0 && swiper.isHorizontal()) || (height === 0 && swiper.isVertical())) {
            return;
        }
        // Subtract paddings
        width =
            width -
                parseInt(elementStyle(el, 'padding-left') || '0', 10) -
                parseInt(elementStyle(el, 'padding-right') || '0', 10);
        height =
            height -
                parseInt(elementStyle(el, 'padding-top') || '0', 10) -
                parseInt(elementStyle(el, 'padding-bottom') || '0', 10);
        if (Number.isNaN(width))
            width = 0;
        if (Number.isNaN(height))
            height = 0;
        Object.assign(swiper, {
            width,
            height,
            size: swiper.isHorizontal() ? width : height,
        });
    }

    function updateSlides() {
        const swiper = this;
        function getDirectionPropertyValue(node, label) {
            return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || '0');
        }
        const params = swiper.params;
        const { wrapperEl, slidesEl, rtlTranslate: rtl, wrongRTL } = swiper;
        const isVirtual = !!(swiper.virtual && params.virtual?.enabled);
        const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
        const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
        let snapGrid = [];
        const slidesGrid = [];
        const slidesSizesGrid = [];
        const resolveOffset = (value) => typeof value === 'function' ? value.call(swiper) : value;
        const offsetBefore = resolveOffset(params.slidesOffsetBefore);
        const offsetAfter = resolveOffset(params.slidesOffsetAfter);
        const previousSnapGridLength = swiper.snapGrid.length;
        const previousSlidesGridLength = swiper.slidesGrid.length;
        const swiperSize = swiper.size - offsetBefore - offsetAfter;
        let spaceBetween = params.spaceBetween;
        let slidePosition = -offsetBefore;
        let prevSlideSize = 0;
        let index = 0;
        if (typeof swiperSize === 'undefined') {
            return;
        }
        if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
            spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiperSize;
        }
        else if (typeof spaceBetween === 'string') {
            spaceBetween = parseFloat(spaceBetween);
        }
        swiper.virtualSize =
            -spaceBetween - offsetBefore - offsetAfter;
        // reset margins
        slides.forEach((slideEl) => {
            if (rtl) {
                slideEl.style.marginLeft = '';
            }
            else {
                slideEl.style.marginRight = '';
            }
            slideEl.style.marginBottom = '';
            slideEl.style.marginTop = '';
        });
        // reset cssMode offsets
        if (params.centeredSlides && params.cssMode) {
            setCSSProperty(wrapperEl, '--swiper-centered-offset-before', '');
            setCSSProperty(wrapperEl, '--swiper-centered-offset-after', '');
        }
        // set cssMode offsets
        if (params.cssMode) {
            setCSSProperty(wrapperEl, '--swiper-slides-offset-before', `${offsetBefore}px`);
            setCSSProperty(wrapperEl, '--swiper-slides-offset-after', `${offsetAfter}px`);
        }
        const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
        if (gridEnabled) {
            swiper.grid.initSlides(slides);
        }
        else if (swiper.grid) {
            swiper.grid.unsetSlides();
        }
        // Calc slides
        let slideSize = 0;
        const shouldResetSlideSize = params.slidesPerView === 'auto' &&
            params.breakpoints &&
            Object.keys(params.breakpoints).filter((key) => {
                const bp = params.breakpoints[key];
                return typeof bp?.slidesPerView !== 'undefined';
            }).length > 0;
        for (let i = 0; i < slidesLength; i += 1) {
            slideSize = 0;
            const slide = slides[i];
            if (slide) {
                if (gridEnabled) {
                    swiper.grid.updateSlide(i, slide, slides);
                }
                if (elementStyle(slide, 'display') === 'none')
                    continue;
            }
            if (isVirtual && params.slidesPerView === 'auto') {
                if (params.virtual?.slidesPerViewAutoSlideSize) {
                    slideSize = params.virtual.slidesPerViewAutoSlideSize;
                }
                if (slideSize && slide) {
                    if (params.roundLengths)
                        slideSize = Math.floor(slideSize);
                    slide.style[swiper.getDirectionLabel('width')] =
                        `${slideSize}px`;
                }
            }
            else if (params.slidesPerView === 'auto') {
                if (shouldResetSlideSize) {
                    slide.style[swiper.getDirectionLabel('width')] = ``;
                }
                const slideStyles = getComputedStyle(slide);
                const currentTransform = slide.style.transform;
                const currentWebKitTransform = slide.style.webkitTransform;
                if (currentTransform) {
                    slide.style.transform = 'none';
                }
                if (currentWebKitTransform) {
                    slide.style.webkitTransform =
                        'none';
                }
                if (params.roundLengths) {
                    slideSize = swiper.isHorizontal()
                        ? elementOuterSize(slide, 'width')
                        : elementOuterSize(slide, 'height');
                }
                else {
                    const width = getDirectionPropertyValue(slideStyles, 'width');
                    const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
                    const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
                    const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
                    const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
                    const boxSizing = slideStyles.getPropertyValue('box-sizing');
                    if (boxSizing && boxSizing === 'border-box') {
                        slideSize = width + marginLeft + marginRight;
                    }
                    else {
                        const { clientWidth, offsetWidth } = slide;
                        slideSize =
                            width +
                                paddingLeft +
                                paddingRight +
                                marginLeft +
                                marginRight +
                                (offsetWidth - clientWidth);
                    }
                }
                if (currentTransform) {
                    slide.style.transform = currentTransform;
                }
                if (currentWebKitTransform) {
                    slide.style.webkitTransform =
                        currentWebKitTransform;
                }
                if (params.roundLengths)
                    slideSize = Math.floor(slideSize);
            }
            else {
                slideSize =
                    (swiperSize - (params.slidesPerView - 1) * spaceBetween) /
                        params.slidesPerView;
                if (params.roundLengths)
                    slideSize = Math.floor(slideSize);
                if (slide) {
                    slide.style[swiper.getDirectionLabel('width')] =
                        `${slideSize}px`;
                }
            }
            if (slide) {
                slide.swiperSlideSize = slideSize;
            }
            slidesSizesGrid.push(slideSize);
            if (params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (prevSlideSize === 0 && i !== 0)
                    slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (i === 0)
                    slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1000)
                    slidePosition = 0;
                if (params.roundLengths)
                    slidePosition = Math.floor(slidePosition);
                if (index % params.slidesPerGroup === 0)
                    snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
            }
            else {
                if (params.roundLengths)
                    slidePosition = Math.floor(slidePosition);
                if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) %
                    swiper.params.slidesPerGroup ===
                    0)
                    snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
            swiper.virtualSize += slideSize + spaceBetween;
            prevSlideSize = slideSize;
            index += 1;
        }
        swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
        if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
            wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
        }
        if (params.setWrapperSize) {
            wrapperEl.style[swiper.getDirectionLabel('width')] = `${swiper.virtualSize + spaceBetween}px`;
        }
        if (gridEnabled) {
            swiper.grid.updateWrapperSize(slideSize, snapGrid);
        }
        // Remove last grid elements depending on width
        if (!params.centeredSlides) {
            // Check if snapToSlideEdge should be applied
            const isFractionalSlidesPerView = params.slidesPerView !== 'auto' && params.slidesPerView % 1 !== 0;
            const shouldSnapToSlideEdge = params.snapToSlideEdge &&
                !params.loop &&
                (params.slidesPerView === 'auto' || isFractionalSlidesPerView);
            // Calculate the last allowed snap index when snapToSlideEdge is enabled
            // This ensures minimum slides are visible at the end
            let lastAllowedSnapIndex = snapGrid.length;
            if (shouldSnapToSlideEdge) {
                let minVisibleSlides;
                if (params.slidesPerView === 'auto') {
                    // For 'auto' mode, calculate how many slides fit based on actual sizes
                    minVisibleSlides = 1;
                    let accumulatedSize = 0;
                    for (let i = slidesSizesGrid.length - 1; i >= 0; i -= 1) {
                        accumulatedSize +=
                            slidesSizesGrid[i] + (i < slidesSizesGrid.length - 1 ? spaceBetween : 0);
                        if (accumulatedSize <= swiperSize) {
                            minVisibleSlides = slidesSizesGrid.length - i;
                        }
                        else {
                            break;
                        }
                    }
                }
                else {
                    minVisibleSlides = Math.floor(params.slidesPerView);
                }
                lastAllowedSnapIndex = Math.max(slidesLength - minVisibleSlides, 0);
            }
            const newSlidesGrid = [];
            for (let i = 0; i < snapGrid.length; i += 1) {
                let slidesGridItem = snapGrid[i];
                if (params.roundLengths)
                    slidesGridItem = Math.floor(slidesGridItem);
                if (shouldSnapToSlideEdge) {
                    // When snapToSlideEdge is enabled, only keep snaps up to lastAllowedSnapIndex
                    if (i <= lastAllowedSnapIndex) {
                        newSlidesGrid.push(slidesGridItem);
                    }
                }
                else if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
                    // When snapToSlideEdge is disabled, keep snaps that fit within scrollable area
                    newSlidesGrid.push(slidesGridItem);
                }
            }
            snapGrid = newSlidesGrid;
            if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) >
                1) {
                // Only add edge-aligned snap if snapToSlideEdge is not enabled
                if (!shouldSnapToSlideEdge) {
                    snapGrid.push(swiper.virtualSize - swiperSize);
                }
            }
        }
        if (isVirtual && params.loop) {
            const size = slidesSizesGrid[0] + spaceBetween;
            const slidesBefore = swiper.virtual.slidesBefore ?? 0;
            const slidesAfter = swiper.virtual.slidesAfter ?? 0;
            const virtualLoopCount = slidesBefore + slidesAfter;
            if (params.slidesPerGroup > 1) {
                const groups = Math.ceil(virtualLoopCount / params.slidesPerGroup);
                const groupSize = size * params.slidesPerGroup;
                for (let i = 0; i < groups; i += 1) {
                    snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
                }
            }
            for (let i = 0; i < virtualLoopCount; i += 1) {
                if (params.slidesPerGroup === 1) {
                    snapGrid.push(snapGrid[snapGrid.length - 1] + size);
                }
                slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
                swiper.virtualSize += size;
            }
        }
        if (snapGrid.length === 0)
            snapGrid = [0];
        if (spaceBetween !== 0) {
            const key = swiper.isHorizontal() && rtl ? 'marginLeft' : swiper.getDirectionLabel('marginRight');
            slides
                .filter((_, slideIndex) => {
                if (!params.cssMode || params.loop)
                    return true;
                if (slideIndex === slides.length - 1) {
                    return false;
                }
                return true;
            })
                .forEach((slideEl) => {
                slideEl.style[key] = `${spaceBetween}px`;
            });
        }
        if (params.centeredSlides && params.centeredSlidesBounds) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue) => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            });
            allSlidesSize -= spaceBetween;
            const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
            snapGrid = snapGrid.map((snap) => {
                if (snap <= 0)
                    return -offsetBefore;
                if (snap > maxSnap)
                    return maxSnap + offsetAfter;
                return snap;
            });
        }
        if (params.centerInsufficientSlides) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue) => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            });
            allSlidesSize -= spaceBetween;
            if (allSlidesSize < swiperSize) {
                const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
                snapGrid.forEach((snap, snapIndex) => {
                    snapGrid[snapIndex] = snap - allSlidesOffset;
                });
                slidesGrid.forEach((snap, snapIndex) => {
                    slidesGrid[snapIndex] = snap + allSlidesOffset;
                });
            }
        }
        Object.assign(swiper, {
            slides,
            snapGrid,
            slidesGrid,
            slidesSizesGrid,
        });
        if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
            setCSSProperty(wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
            setCSSProperty(wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
            const addToSnapGrid = -swiper.snapGrid[0];
            const addToSlidesGrid = -swiper.slidesGrid[0];
            swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
            swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
        }
        if (slidesLength !== previousSlidesLength) {
            swiper.emit('slidesLengthChange');
        }
        if (snapGrid.length !== previousSnapGridLength) {
            if (swiper.params.watchOverflow)
                swiper.checkOverflow();
            swiper.emit('snapGridLengthChange');
        }
        if (slidesGrid.length !== previousSlidesGridLength) {
            swiper.emit('slidesGridLengthChange');
        }
        if (params.watchSlidesProgress) {
            swiper.updateSlidesOffset();
        }
        swiper.emit('slidesUpdated');
        if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
            const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
            const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
            if (slidesLength <= params.maxBackfaceHiddenSlides) {
                if (!hasClassBackfaceClassAdded)
                    swiper.el.classList.add(backFaceHiddenClass);
            }
            else if (hasClassBackfaceClassAdded) {
                swiper.el.classList.remove(backFaceHiddenClass);
            }
        }
    }

    const toggleSlideClasses$1 = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) {
            slideEl.classList.add(className);
        }
        else if (!condition && slideEl.classList.contains(className)) {
            slideEl.classList.remove(className);
        }
    };
    function updateSlidesClasses() {
        const swiper = this;
        const { slides, params, slidesEl, activeIndex } = swiper;
        const isVirtual = !!(swiper.virtual && params.virtual?.enabled);
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const getFilteredSlide = (selector) => {
            return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
        };
        let activeSlide;
        let prevSlide;
        let nextSlide;
        if (isVirtual) {
            if (params.loop) {
                const virtualSlides = swiper.virtual.slides;
                let slideIndex = activeIndex - (swiper.virtual.slidesBefore ?? 0);
                if (slideIndex < 0)
                    slideIndex = virtualSlides.length + slideIndex;
                if (slideIndex >= virtualSlides.length)
                    slideIndex -= virtualSlides.length;
                activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
            }
            else {
                activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
            }
        }
        else if (gridEnabled) {
            activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
            nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
            prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
        }
        else {
            activeSlide = slides[activeIndex];
        }
        if (activeSlide) {
            if (!gridEnabled) {
                // Next Slide
                nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
                if (params.loop && !nextSlide) {
                    nextSlide = slides[0];
                }
                // Prev Slide
                prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
                // NOTE: legacy guard from v9; `(!prevSlide) === 0` is always false, but we preserve
                // the original behaviour (no-op) to avoid runtime changes in v14. Audit candidate.
                if (params.loop && !prevSlide === 0) {
                    prevSlide = slides[slides.length - 1];
                }
            }
        }
        slides.forEach((slideEl) => {
            toggleSlideClasses$1(slideEl, slideEl === activeSlide, params.slideActiveClass);
            toggleSlideClasses$1(slideEl, slideEl === nextSlide, params.slideNextClass);
            toggleSlideClasses$1(slideEl, slideEl === prevSlide, params.slidePrevClass);
        });
        swiper.emitSlidesClasses();
    }

    function updateSlidesOffset() {
        const swiper = this;
        const slides = swiper.slides;
        const minusOffset = swiper.isElement
            ? swiper.isHorizontal()
                ? swiper.wrapperEl.offsetLeft
                : swiper.wrapperEl.offsetTop
            : 0;
        for (let i = 0; i < slides.length; i += 1) {
            slides[i].swiperSlideOffset =
                (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) -
                    minusOffset -
                    swiper.cssOverflowAdjustment();
        }
    }

    const toggleSlideClasses = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) {
            slideEl.classList.add(className);
        }
        else if (!condition && slideEl.classList.contains(className)) {
            slideEl.classList.remove(className);
        }
    };
    function updateSlidesProgress(translate = (this && this.translate) || 0) {
        const swiper = this;
        const params = swiper.params;
        const { slides, rtlTranslate: rtl, snapGrid } = swiper;
        if (slides.length === 0)
            return;
        if (typeof slides[0].swiperSlideOffset === 'undefined')
            swiper.updateSlidesOffset();
        let offsetCenter = -translate;
        if (rtl)
            offsetCenter = translate;
        swiper.visibleSlidesIndexes = [];
        swiper.visibleSlides = [];
        let spaceBetween = params.spaceBetween;
        if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
            spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiper.size;
        }
        else if (typeof spaceBetween === 'string') {
            spaceBetween = parseFloat(spaceBetween);
        }
        for (let i = 0; i < slides.length; i += 1) {
            const slide = slides[i];
            let slideOffset = slide.swiperSlideOffset ?? 0;
            if (params.cssMode && params.centeredSlides) {
                slideOffset -= slides[0].swiperSlideOffset ?? 0;
            }
            const slideSize = slide.swiperSlideSize ?? 0;
            const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) /
                (slideSize + spaceBetween);
            const originalSlideProgress = (offsetCenter -
                snapGrid[0] +
                (params.centeredSlides ? swiper.minTranslate() : 0) -
                slideOffset) /
                (slideSize + spaceBetween);
            const slideBefore = -(offsetCenter - slideOffset);
            const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
            const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
            const isVisible = (slideBefore >= 0 && slideBefore < swiper.size - 1) ||
                (slideAfter > 1 && slideAfter <= swiper.size) ||
                (slideBefore <= 0 && slideAfter >= swiper.size);
            if (isVisible) {
                swiper.visibleSlides.push(slide);
                swiper.visibleSlidesIndexes.push(i);
            }
            toggleSlideClasses(slide, isVisible, params.slideVisibleClass);
            toggleSlideClasses(slide, isFullyVisible, params.slideFullyVisibleClass);
            slide.progress = rtl ? -slideProgress : slideProgress;
            slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
        }
    }

    var update = {
        updateSize,
        updateSlides,
        updateAutoHeight,
        updateSlidesOffset,
        updateSlidesProgress,
        updateProgress,
        updateSlidesClasses,
        updateActiveIndex,
        updateClickedSlide,
    };

    const prototypes = {
        eventsEmitter,
        update,
        translate,
        transition,
        slide,
        loop,
        grabCursor,
        events: events$1,
        breakpoints,
        checkOverflow: checkOverflow$1,
        classes,
    };
    const extendedDefaults = {};
    class Swiper {
        static extendedDefaults;
        static defaults;
        constructor(...args) {
            let el;
            let params;
            if (args.length === 1 &&
                args[0] !== null &&
                typeof args[0] === 'object' &&
                Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
                params = args[0];
            }
            else {
                [el, params] = args;
            }
            if (!params)
                params = {};
            params = extend({}, params);
            if (el && !params.el)
                params.el = el;
            if (params.el &&
                typeof params.el === 'string' &&
                typeof document !== 'undefined' &&
                document.querySelectorAll(params.el).length > 1) {
                const swipers = [];
                document.querySelectorAll(params.el).forEach((containerEl) => {
                    const newParams = extend({}, params, { el: containerEl });
                    swipers.push(new Swiper(newParams));
                });
                return swipers;
            }
            // Swiper Instance
            const swiper = this;
            swiper.__swiper__ = true;
            swiper.support = getSupport();
            swiper.device = getDevice({ userAgent: params.userAgent ?? undefined });
            swiper.browser = getBrowser();
            swiper.eventsListeners = {};
            swiper.eventsAnyListeners = [];
            swiper.modules = [...(swiper.__modules__ || [])];
            if (params.modules && Array.isArray(params.modules)) {
                params.modules.forEach((mod) => {
                    const fn = mod;
                    if (typeof fn === 'function' && swiper.modules.indexOf(fn) < 0) {
                        swiper.modules.push(fn);
                    }
                });
            }
            const allModulesParams = {};
            swiper.modules.forEach((mod) => {
                mod({
                    params: params,
                    swiper,
                    extendParams: moduleExtendParams(params, allModulesParams),
                    on: swiper.on.bind(swiper),
                    once: swiper.once.bind(swiper),
                    off: swiper.off.bind(swiper),
                    emit: swiper.emit.bind(swiper),
                });
            });
            // Extend defaults with modules params
            const swiperParams = extend({}, defaults, allModulesParams);
            // Extend defaults with passed params
            swiper.params = extend({}, swiperParams, extendedDefaults, params);
            swiper.originalParams = extend({}, swiper.params);
            swiper.passedParams = extend({}, params);
            // add event listeners
            if (swiper.params && swiper.params.on) {
                const onHandlers = swiper.params.on;
                Object.keys(onHandlers).forEach((eventName) => {
                    const handler = onHandlers[eventName];
                    if (handler)
                        swiper.on(eventName, handler);
                });
            }
            if (swiper.params && swiper.params.onAny) {
                swiper.onAny(swiper.params.onAny);
            }
            // Extend Swiper
            Object.assign(swiper, {
                enabled: swiper.params.enabled,
                el,
                // Classes
                classNames: [],
                // Slides
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                // isDirection
                isHorizontal() {
                    return swiper.params.direction === 'horizontal';
                },
                isVertical() {
                    return swiper.params.direction === 'vertical';
                },
                // Indexes
                activeIndex: 0,
                realIndex: 0,
                //
                isBeginning: true,
                isEnd: false,
                // Props
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: false,
                cssOverflowAdjustment() {
                    // Returns 0 unless `translate` is > 2**23
                    // Should be subtracted from css values to prevent overflow
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                // Locks
                allowSlideNext: swiper.params.allowSlideNext,
                allowSlidePrev: swiper.params.allowSlidePrev,
                // Touch Events
                touchEventsData: {
                    isTouched: undefined,
                    isMoved: undefined,
                    allowTouchCallbacks: undefined,
                    touchStartTime: undefined,
                    isScrolling: undefined,
                    currentTranslate: undefined,
                    startTranslate: undefined,
                    allowThresholdMove: undefined,
                    // Form elements to match
                    focusableElements: swiper.params.focusableElements,
                    // Last click time
                    lastClickTime: 0,
                    clickTimeout: undefined,
                    // Velocities
                    velocities: [],
                    allowMomentumBounce: undefined,
                    startMoving: undefined,
                    pointerId: null,
                    touchId: null,
                },
                // Clicks
                allowClick: true,
                // Touches
                allowTouchMove: swiper.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0,
                },
                // Images
                imagesToLoad: [],
                imagesLoaded: 0,
            });
            swiper.emit('_swiper');
            // Init
            if (swiper.params.init) {
                swiper.init();
            }
            // Return app instance
            return swiper;
        }
        getDirectionLabel(property) {
            if (this.isHorizontal()) {
                return property;
            }
            // oxfmt-ignore
            return {
                'width': 'height',
                'margin-top': 'margin-left',
                'margin-bottom ': 'margin-right',
                'margin-left': 'margin-top',
                'margin-right': 'margin-bottom',
                'padding-left': 'padding-top',
                'padding-right': 'padding-bottom',
                'marginRight': 'marginBottom',
            }[property];
        }
        /**
         * !INTERNAL
         */
        isHorizontal() {
            return this.params.direction === 'horizontal';
        }
        isVertical() {
            return this.params.direction === 'vertical';
        }
        cssOverflowAdjustment() {
            return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
        }
        getSlideIndex(slideEl) {
            const { slidesEl, params } = this;
            const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            const firstSlideIndex = elementIndex(slides[0]);
            return elementIndex(slideEl) - (firstSlideIndex ?? 0);
        }
        getSlideIndexByData(index) {
            return this.getSlideIndex(this.slides.find((slideEl) => Number(slideEl.getAttribute('data-swiper-slide-index')) === index));
        }
        getSlideIndexWhenGrid(index) {
            if (this.grid && this.params.grid && this.params.grid.rows > 1) {
                if (this.params.grid.fill === 'column') {
                    index = Math.floor(index / this.params.grid.rows);
                }
                else if (this.params.grid.fill === 'row') {
                    index = index % Math.ceil(this.slides.length / this.params.grid.rows);
                }
            }
            return index;
        }
        recalcSlides() {
            const { slidesEl, params } = this;
            this.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        }
        /**
         * Enable Swiper (if it was disabled)
         */
        enable() {
            if (this.enabled)
                return;
            this.enabled = true;
            if (this.params.grabCursor) {
                this.setGrabCursor();
            }
            this.emit('enable');
        }
        /**
         * Disable Swiper (if it was enabled). When Swiper is disabled, it will hide all navigation elements and won't respond to any events and interactions
         */
        disable() {
            if (!this.enabled)
                return;
            this.enabled = false;
            if (this.params.grabCursor) {
                this.unsetGrabCursor();
            }
            this.emit('disable');
        }
        /**
         * Set Swiper translate progress (from 0 to 1). Where 0 - its initial position (offset) on first slide, and 1 - its maximum position (offset) on last slide
         *
         * @param progress Swiper translate progress (from 0 to 1).
         * @param speed Transition duration (in ms).
         */
        setProgress(progress, speed) {
            progress = Math.min(Math.max(progress, 0), 1);
            const min = this.minTranslate();
            const max = this.maxTranslate();
            const current = (max - min) * progress + min;
            this.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
            this.updateActiveIndex();
            this.updateSlidesClasses();
        }
        emitContainerClasses() {
            if (!this.params._emitClasses || !this.el)
                return;
            const cls = this.el.className.split(' ').filter((className) => {
                return (className.indexOf('swiper') === 0 ||
                    className.indexOf(this.params.containerModifierClass) === 0);
            });
            this.emit('_containerClasses', cls.join(' '));
        }
        getSlideClasses(slideEl) {
            if (this.destroyed)
                return '';
            return slideEl.className
                .split(' ')
                .filter((className) => {
                return (className.indexOf('swiper-slide') === 0 ||
                    className.indexOf(this.params.slideClass) === 0);
            })
                .join(' ');
        }
        emitSlidesClasses() {
            if (!this.params._emitClasses || !this.el)
                return;
            const updates = [];
            this.slides.forEach((slideEl) => {
                const classNames = this.getSlideClasses(slideEl);
                updates.push({ slideEl, classNames });
                this.emit('_slideClass', slideEl, classNames);
            });
            this.emit('_slideClasses', updates);
        }
        /**
         * Get dynamically calculated amount of slides per view, useful only when slidesPerView set to `auto`
         */
        slidesPerViewDynamic(view = 'current', exact = false) {
            const { params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex } = this;
            let spv = 1;
            if (typeof params.slidesPerView === 'number')
                return params.slidesPerView;
            if (params.centeredSlides) {
                let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize ?? 0) : 0;
                let breakLoop = false;
                for (let i = activeIndex + 1; i < slides.length; i += 1) {
                    if (slides[i] && !breakLoop) {
                        slideSize += Math.ceil(slides[i].swiperSlideSize ?? 0);
                        spv += 1;
                        if (slideSize > swiperSize)
                            breakLoop = true;
                    }
                }
                for (let i = activeIndex - 1; i >= 0; i -= 1) {
                    if (slides[i] && !breakLoop) {
                        slideSize += slides[i].swiperSlideSize ?? 0;
                        spv += 1;
                        if (slideSize > swiperSize)
                            breakLoop = true;
                    }
                }
            }
            else if (view === 'current') {
                for (let i = activeIndex + 1; i < slides.length; i += 1) {
                    const slideInView = exact
                        ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize
                        : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                    if (slideInView) {
                        spv += 1;
                    }
                }
            }
            else {
                // previous
                for (let i = activeIndex - 1; i >= 0; i -= 1) {
                    const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                    if (slideInView) {
                        spv += 1;
                    }
                }
            }
            return spv;
        }
        /**
         * You should call it after you add/remove slides
         * manually, or after you hide/show it, or do any
         * custom DOM modifications with Swiper
         * This method also includes subcall of the following
         * methods which you can use separately:
         */
        update() {
            const swiper = this;
            if (!swiper || swiper.destroyed)
                return;
            const { snapGrid, params } = swiper;
            // Breakpoints
            if (params.breakpoints) {
                swiper.setBreakpoint();
            }
            [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
                if (imageEl.complete) {
                    processLazyPreloader(swiper, imageEl);
                }
            });
            swiper.updateSize();
            swiper.updateSlides();
            swiper.updateProgress();
            swiper.updateSlidesClasses();
            function setTranslate() {
                const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
                const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
                swiper.setTranslate(newTranslate);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            let translated;
            if (params.freeMode?.enabled && !params.cssMode) {
                setTranslate();
                if (params.autoHeight) {
                    swiper.updateAutoHeight();
                }
            }
            else {
                if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) &&
                    swiper.isEnd &&
                    !params.centeredSlides) {
                    const slidesLength = swiper.virtual && params.virtual?.enabled
                        ? swiper.virtual.slides.length
                        : swiper.slides.length;
                    translated = swiper.slideTo(slidesLength - 1, 0, false, true);
                }
                else {
                    translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
                }
                if (!translated) {
                    setTranslate();
                }
            }
            if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
                swiper.checkOverflow();
            }
            swiper.emit('update');
        }
        /**
         * Changes slider direction from horizontal to vertical and back.
         *
         * @param direction New direction. If not specified, then will automatically changed to opposite direction
         * @param needUpdate Will call swiper.update(). Default true
         */
        changeDirection(newDirection, needUpdate = true) {
            const swiper = this;
            const currentDirection = swiper.params.direction;
            if (!newDirection) {
                newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
            }
            if (newDirection === currentDirection ||
                (newDirection !== 'horizontal' && newDirection !== 'vertical')) {
                return swiper;
            }
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
            swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
            swiper.emitContainerClasses();
            swiper.params.direction = newDirection;
            swiper.slides.forEach((slideEl) => {
                if (newDirection === 'vertical') {
                    slideEl.style.width = '';
                }
                else {
                    slideEl.style.height = '';
                }
            });
            swiper.emit('changeDirection');
            if (needUpdate)
                swiper.update();
            return swiper;
        }
        /**
         * Changes slider language
         *
         * @param direction New direction. Should be `rtl` or `ltr`
         */
        changeLanguageDirection(direction) {
            const swiper = this;
            if ((swiper.rtl && direction === 'rtl') || (!swiper.rtl && direction === 'ltr'))
                return;
            swiper.rtl = direction === 'rtl';
            swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;
            if (swiper.rtl) {
                swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = 'rtl';
            }
            else {
                swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = 'ltr';
            }
            swiper.update();
        }
        mount(element) {
            const swiper = this;
            if (swiper.mounted)
                return true;
            // No DOM (SSR / Node) — nothing to mount to.
            if (typeof document === 'undefined')
                return false;
            // Find el (params.el can be a CSSSelector, HTMLElement, or undefined)
            const initialEl = element ?? swiper.params.el;
            let el = null;
            if (typeof initialEl === 'string') {
                el = document.querySelector(initialEl);
            }
            else if (initialEl instanceof HTMLElement) {
                el = initialEl;
            }
            if (!el) {
                return false;
            }
            el.swiper = swiper;
            const parent = el.parentNode;
            if (parent &&
                parent.host &&
                parent.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
                swiper.isElement = true;
            }
            const getWrapperSelector = () => {
                return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
            };
            const getWrapper = () => {
                if (el && el.shadowRoot) {
                    const res = el.shadowRoot.querySelector(getWrapperSelector());
                    // Children needs to return slot items
                    return res;
                }
                return elementChildren(el, getWrapperSelector())[0];
            };
            // Find Wrapper
            let wrapperEl = getWrapper();
            if (!wrapperEl && swiper.params.createElements) {
                wrapperEl = createElement('div', swiper.params.wrapperClass);
                el.append(wrapperEl);
                elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
                    wrapperEl.append(slideEl);
                });
            }
            const host = swiper.isElement ? el.parentNode.host : null;
            Object.assign(swiper, {
                el,
                wrapperEl,
                slidesEl: swiper.isElement && !host.slideSlots ? el.parentNode : wrapperEl,
                hostEl: swiper.isElement ? host : el,
                mounted: true,
                // RTL
                rtl: el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl',
                rtlTranslate: swiper.params.direction === 'horizontal' &&
                    (el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl'),
                wrongRTL: elementStyle(wrapperEl, 'display') === '-webkit-box',
            });
            return true;
        }
        /**
         * Initialize slider
         */
        init(el) {
            const swiper = this;
            if (swiper.initialized)
                return swiper;
            const mounted = swiper.mount(el);
            if (mounted === false)
                return swiper;
            swiper.emit('beforeInit');
            // Set breakpoint
            if (swiper.params.breakpoints) {
                swiper.setBreakpoint();
            }
            // Add Classes
            swiper.addClasses();
            // Update size
            swiper.updateSize();
            // Update slides
            swiper.updateSlides();
            if (swiper.params.watchOverflow) {
                swiper.checkOverflow();
            }
            // Set Grab Cursor
            if (swiper.params.grabCursor && swiper.enabled) {
                swiper.setGrabCursor();
            }
            // Slide To Initial Slide
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual?.enabled) {
                swiper.slideTo((swiper.params.initialSlide ?? 0) + (swiper.virtual.slidesBefore ?? 0), 0, swiper.params.runCallbacksOnInit, false, true);
            }
            else {
                swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
            }
            // Create loop
            if (swiper.params.loop) {
                swiper.loopCreate(undefined, true);
            }
            // Attach events
            swiper.attachEvents();
            const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
            if (swiper.isElement) {
                lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            }
            lazyElements.forEach((imageEl) => {
                if (imageEl.complete) {
                    processLazyPreloader(swiper, imageEl);
                }
                else {
                    imageEl.addEventListener('load', (e) => {
                        processLazyPreloader(swiper, e.target);
                    });
                }
            });
            preload(swiper);
            // Init Flag
            swiper.initialized = true;
            preload(swiper);
            // Emit
            swiper.emit('init');
            swiper.emit('afterInit');
            return swiper;
        }
        /**
         * Destroy slider instance and detach all events listeners
         *
         * @param deleteInstance Set it to false (by default it is true) to not to delete Swiper instance
         * @param cleanStyles Set it to true (by default it is true) and all custom styles will be removed from slides, wrapper and container.
         * Useful if you need to destroy Swiper and to init again with new options or in different direction
         */
        destroy(deleteInstance = true, cleanStyles = true) {
            const swiper = this;
            const { params, el, wrapperEl, slides } = swiper;
            if (typeof swiper.params === 'undefined' || swiper.destroyed) {
                return null;
            }
            swiper.emit('beforeDestroy');
            // Init Flag
            swiper.initialized = false;
            // Detach events
            swiper.detachEvents();
            // Destroy loop
            if (params.loop) {
                swiper.loopDestroy();
            }
            // Cleanup styles
            if (cleanStyles) {
                swiper.removeClasses();
                if (el && typeof el !== 'string') {
                    el.removeAttribute('style');
                }
                if (wrapperEl) {
                    wrapperEl.removeAttribute('style');
                }
                if (slides && slides.length) {
                    slides.forEach((slideEl) => {
                        slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                        slideEl.removeAttribute('style');
                        slideEl.removeAttribute('data-swiper-slide-index');
                    });
                }
            }
            swiper.emit('destroy');
            // Detach emitter events
            Object.keys(swiper.eventsListeners).forEach((eventName) => {
                swiper.off(eventName);
            });
            if (deleteInstance !== false) {
                if (swiper.el && typeof swiper.el !== 'string') {
                    swiper.el.swiper = null;
                }
                deleteProps(swiper);
            }
            swiper.destroyed = true;
            return null;
        }
        static extendDefaults(newDefaults) {
            extend(extendedDefaults, newDefaults);
        }
        static installModule(mod) {
            if (!Swiper.prototype.__modules__)
                Swiper.prototype.__modules__ = [];
            const modules = Swiper.prototype.__modules__;
            if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
                modules.push(mod);
            }
        }
        static use(module) {
            if (Array.isArray(module)) {
                module.forEach((m) => Swiper.installModule(m));
                return Swiper;
            }
            Swiper.installModule(module);
            return Swiper;
        }
    }
    Object.defineProperty(Swiper, 'extendedDefaults', {
        get() {
            return extendedDefaults;
        },
    });
    Object.defineProperty(Swiper, 'defaults', {
        get() {
            return defaults;
        },
    });
    // Attach prototype-mixin method groups onto Swiper.prototype. Each group is a
    // plain record of method-name → function; we copy them across as-is.
    const prototypeRecord = prototypes;
    const swiperProto = Swiper.prototype;
    Object.keys(prototypeRecord).forEach((prototypeGroup) => {
        const group = prototypeRecord[prototypeGroup];
        Object.keys(group).forEach((protoMethod) => {
            swiperProto[protoMethod] = group[protoMethod];
        });
    });
    Swiper.use([Resize, Observer]);

    const Virtual = ({ swiper, extendParams, on, emit }) => {
        extendParams({
            virtual: {
                enabled: false,
                slides: [],
                cache: true,
                slidesPerViewAutoSlideSize: 320,
                renderSlide: null,
                renderExternal: null,
                renderExternalUpdate: true,
                addSlidesBefore: 0,
                addSlidesAfter: 0,
            },
        });
        let cssModeTimeout;
        // Methods (appendSlide/prependSlide/removeSlide/removeAllSlides/update) are
        // attached via Object.assign below once they're defined. Cast through
        // Partial<> so the initial state-only literal can be assigned without
        // pretending the methods exist yet.
        swiper.virtual = {
            cache: {},
            from: 0,
            to: 0,
            slides: [],
            offset: 0,
            slidesGrid: [],
        };
        function getParams() {
            return swiper.params.virtual;
        }
        // Created lazily so module init does not touch the DOM (SSR / Node safe).
        let tempDOM;
        const getTempDOM = () => (tempDOM ??= document.createElement('div'));
        function renderSlide(slide, index) {
            const params = getParams();
            if (params.cache && swiper.virtual.cache[index]) {
                return swiper.virtual.cache[index];
            }
            let slideEl;
            if (params.renderSlide) {
                const rendered = params.renderSlide.call(swiper, slide, index);
                if (typeof rendered === 'string') {
                    const el = getTempDOM();
                    setInnerHTML(el, rendered);
                    slideEl = el.children[0];
                }
                else {
                    slideEl = rendered;
                }
            }
            else if (swiper.isElement) {
                slideEl = createElement('swiper-slide');
            }
            else {
                slideEl = createElement('div', swiper.params.slideClass);
            }
            slideEl.setAttribute('data-swiper-slide-index', String(index));
            if (!params.renderSlide) {
                setInnerHTML(slideEl, slide);
            }
            if (params.cache) {
                swiper.virtual.cache[index] = slideEl;
            }
            return slideEl;
        }
        function update(force, beforeInit, forceActiveIndex) {
            const { slidesPerGroup, centeredSlides, slidesPerView, loop: isLoop, initialSlide, } = swiper.params;
            if (beforeInit && !isLoop && (initialSlide ?? 0) > 0) {
                return;
            }
            const { addSlidesBefore, addSlidesAfter, slidesPerViewAutoSlideSize } = getParams();
            const { from: previousFrom, to: previousTo, slides, slidesGrid: previousSlidesGrid, offset: previousOffset, } = swiper.virtual;
            if (!swiper.params.cssMode) {
                swiper.updateActiveIndex();
            }
            const activeIndex = typeof forceActiveIndex === 'undefined' ? swiper.activeIndex || 0 : forceActiveIndex;
            let offsetProp;
            if (swiper.rtlTranslate)
                offsetProp = 'right';
            else
                offsetProp = swiper.isHorizontal() ? 'left' : 'top';
            let slidesPerViewNumeric;
            if (slidesPerView === 'auto') {
                if (slidesPerViewAutoSlideSize) {
                    let swiperSize = swiper.size;
                    if (!swiperSize) {
                        swiperSize = swiper.isHorizontal()
                            ? swiper.el.getBoundingClientRect().width
                            : swiper.el.getBoundingClientRect().height;
                    }
                    slidesPerViewNumeric = Math.max(1, Math.ceil(swiperSize / slidesPerViewAutoSlideSize));
                }
                else {
                    slidesPerViewNumeric = 1;
                }
            }
            else {
                slidesPerViewNumeric = slidesPerView ?? 1;
            }
            const groupSize = slidesPerGroup ?? 1;
            let slidesAfter;
            let slidesBefore;
            if (centeredSlides) {
                slidesAfter = Math.floor(slidesPerViewNumeric / 2) + groupSize + addSlidesAfter;
                slidesBefore = Math.floor(slidesPerViewNumeric / 2) + groupSize + addSlidesBefore;
            }
            else {
                slidesAfter = slidesPerViewNumeric + (groupSize - 1) + addSlidesAfter;
                slidesBefore = (isLoop ? slidesPerViewNumeric : groupSize) + addSlidesBefore;
            }
            let from = activeIndex - slidesBefore;
            let to = activeIndex + slidesAfter;
            if (!isLoop) {
                from = Math.max(from, 0);
                to = Math.min(to, slides.length - 1);
            }
            let offset = (swiper.slidesGrid[from] || 0) - (swiper.slidesGrid[0] || 0);
            if (isLoop && activeIndex >= slidesBefore) {
                from -= slidesBefore;
                if (!centeredSlides)
                    offset += swiper.slidesGrid[0];
            }
            else if (isLoop && activeIndex < slidesBefore) {
                from = -slidesBefore;
                if (centeredSlides)
                    offset += swiper.slidesGrid[0];
            }
            Object.assign(swiper.virtual, {
                from,
                to,
                offset,
                slidesGrid: swiper.slidesGrid,
                slidesBefore,
                slidesAfter,
            });
            function onRendered() {
                swiper.updateSlides();
                swiper.updateProgress();
                swiper.updateSlidesClasses();
                emit('virtualUpdate');
            }
            if (previousFrom === from && previousTo === to && !force) {
                if (swiper.slidesGrid !== previousSlidesGrid && offset !== previousOffset) {
                    swiper.slides.forEach((slideEl) => {
                        slideEl.style.setProperty(offsetProp, `${offset - Math.abs(swiper.cssOverflowAdjustment())}px`);
                    });
                }
                swiper.updateProgress();
                emit('virtualUpdate');
                return;
            }
            const virtualParams = getParams();
            if (virtualParams.renderExternal) {
                const slidesToRender = [];
                for (let i = from; i <= to; i += 1) {
                    slidesToRender.push(slides[i]);
                }
                virtualParams.renderExternal.call(swiper, {
                    offset,
                    from,
                    to,
                    slides: slidesToRender,
                });
                if (virtualParams.renderExternalUpdate) {
                    onRendered();
                }
                else {
                    emit('virtualUpdate');
                }
                return;
            }
            const prependIndexes = [];
            const appendIndexes = [];
            const getSlideIndex = (index) => {
                let slideIndex = index;
                if (index < 0) {
                    slideIndex = slides.length + index;
                }
                else if (slideIndex >= slides.length) {
                    slideIndex = slideIndex - slides.length;
                }
                return slideIndex;
            };
            if (force) {
                swiper.slides
                    .filter((el) => el.matches(`.${swiper.params.slideClass}, swiper-slide`))
                    .forEach((slideEl) => {
                    slideEl.remove();
                });
            }
            else {
                for (let i = previousFrom; i <= previousTo; i += 1) {
                    if (i < from || i > to) {
                        const slideIndex = getSlideIndex(i);
                        swiper.slides
                            .filter((el) => el.matches(`.${swiper.params.slideClass}[data-swiper-slide-index="${slideIndex}"], swiper-slide[data-swiper-slide-index="${slideIndex}"]`))
                            .forEach((slideEl) => {
                            slideEl.remove();
                        });
                    }
                }
            }
            const loopFrom = isLoop ? -slides.length : 0;
            const loopTo = isLoop ? slides.length * 2 : slides.length;
            for (let i = loopFrom; i < loopTo; i += 1) {
                if (i >= from && i <= to) {
                    const slideIndex = getSlideIndex(i);
                    if (typeof previousTo === 'undefined' || force) {
                        appendIndexes.push(slideIndex);
                    }
                    else {
                        if (i > previousTo)
                            appendIndexes.push(slideIndex);
                        if (i < previousFrom)
                            prependIndexes.push(slideIndex);
                    }
                }
            }
            appendIndexes.forEach((index) => {
                swiper.slidesEl.append(renderSlide(slides[index], index));
            });
            if (isLoop) {
                for (let i = prependIndexes.length - 1; i >= 0; i -= 1) {
                    const index = prependIndexes[i];
                    swiper.slidesEl.prepend(renderSlide(slides[index], index));
                }
            }
            else {
                prependIndexes.sort((a, b) => b - a);
                prependIndexes.forEach((index) => {
                    swiper.slidesEl.prepend(renderSlide(slides[index], index));
                });
            }
            elementChildren(swiper.slidesEl, '.swiper-slide, swiper-slide').forEach((slideEl) => {
                slideEl.style.setProperty(offsetProp, `${offset - Math.abs(swiper.cssOverflowAdjustment())}px`);
            });
            onRendered();
        }
        function appendSlide(slides) {
            if (slides !== null &&
                typeof slides === 'object' &&
                'length' in slides) {
                const arr = slides;
                for (let i = 0; i < arr.length; i += 1) {
                    if (arr[i])
                        swiper.virtual.slides.push(arr[i]);
                }
            }
            else {
                swiper.virtual.slides.push(slides);
            }
            update(true);
        }
        function prependSlide(slides) {
            const activeIndex = swiper.activeIndex;
            let newActiveIndex = activeIndex + 1;
            let numberOfNewSlides = 1;
            if (Array.isArray(slides)) {
                for (let i = 0; i < slides.length; i += 1) {
                    if (slides[i])
                        swiper.virtual.slides.unshift(slides[i]);
                }
                newActiveIndex = activeIndex + slides.length;
                numberOfNewSlides = slides.length;
            }
            else {
                swiper.virtual.slides.unshift(slides);
            }
            if (getParams().cache) {
                const cache = swiper.virtual.cache;
                const newCache = {};
                Object.keys(cache).forEach((cachedIndex) => {
                    const cachedEl = cache[Number(cachedIndex)];
                    const cachedElIndex = cachedEl.getAttribute('data-swiper-slide-index');
                    if (cachedElIndex) {
                        cachedEl.setAttribute('data-swiper-slide-index', String(parseInt(cachedElIndex, 10) + numberOfNewSlides));
                    }
                    newCache[parseInt(cachedIndex, 10) + numberOfNewSlides] = cachedEl;
                });
                swiper.virtual.cache = newCache;
            }
            update(true);
            swiper.slideTo(newActiveIndex, 0);
        }
        function removeSlide(slidesIndexes) {
            if (typeof slidesIndexes === 'undefined' || slidesIndexes === null)
                return;
            let activeIndex = swiper.activeIndex;
            const shiftCacheDownFrom = (removedIndex) => {
                Object.keys(swiper.virtual.cache).forEach((key) => {
                    const numericKey = Number(key);
                    if (numericKey > removedIndex) {
                        const shifted = swiper.virtual.cache[numericKey];
                        swiper.virtual.cache[numericKey - 1] = shifted;
                        shifted.setAttribute('data-swiper-slide-index', String(numericKey - 1));
                        delete swiper.virtual.cache[numericKey];
                    }
                });
            };
            if (Array.isArray(slidesIndexes)) {
                for (let i = slidesIndexes.length - 1; i >= 0; i -= 1) {
                    if (getParams().cache) {
                        delete swiper.virtual.cache[slidesIndexes[i]];
                        shiftCacheDownFrom(slidesIndexes[i]);
                    }
                    swiper.virtual.slides.splice(slidesIndexes[i], 1);
                    if (slidesIndexes[i] < activeIndex)
                        activeIndex -= 1;
                    activeIndex = Math.max(activeIndex, 0);
                }
            }
            else {
                if (getParams().cache) {
                    delete swiper.virtual.cache[slidesIndexes];
                    shiftCacheDownFrom(slidesIndexes);
                }
                swiper.virtual.slides.splice(slidesIndexes, 1);
                if (slidesIndexes < activeIndex)
                    activeIndex -= 1;
                activeIndex = Math.max(activeIndex, 0);
            }
            update(true);
            swiper.slideTo(activeIndex, 0);
        }
        function removeAllSlides() {
            swiper.virtual.slides = [];
            if (getParams().cache) {
                swiper.virtual.cache = {};
            }
            update(true);
            swiper.slideTo(0, 0);
        }
        on('beforeInit', () => {
            if (!getParams().enabled)
                return;
            let domSlidesAssigned = false;
            const passedVirtual = swiper.passedParams.virtual;
            const passedSlidesUndefined = !passedVirtual || typeof passedVirtual !== 'object' || passedVirtual.slides === undefined;
            if (passedSlidesUndefined) {
                const slides = [...swiper.slidesEl.children].filter((el) => el.matches(`.${swiper.params.slideClass}, swiper-slide`));
                if (slides && slides.length) {
                    swiper.virtual.slides = [...slides];
                    domSlidesAssigned = true;
                    slides.forEach((slideEl, slideIndex) => {
                        slideEl.setAttribute('data-swiper-slide-index', String(slideIndex));
                        swiper.virtual.cache[slideIndex] = slideEl;
                        slideEl.remove();
                    });
                }
            }
            if (!domSlidesAssigned) {
                swiper.virtual.slides = getParams().slides;
            }
            swiper.classNames.push(`${swiper.params.containerModifierClass}virtual`);
            swiper.params.watchSlidesProgress = true;
            swiper.originalParams.watchSlidesProgress = true;
            update(false, true);
        });
        on('setTranslate', () => {
            if (!getParams().enabled)
                return;
            if (swiper.params.cssMode && !swiper._immediateVirtual) {
                clearTimeout(cssModeTimeout);
                cssModeTimeout = setTimeout(() => {
                    update();
                }, 100);
            }
            else {
                update();
            }
        });
        on('init update resize', () => {
            if (!getParams().enabled)
                return;
            if (swiper.params.cssMode) {
                setCSSProperty(swiper.wrapperEl, '--swiper-virtual-size', `${swiper.virtualSize}px`);
            }
        });
        Object.assign(swiper.virtual, {
            appendSlide,
            prependSlide,
            removeSlide,
            removeAllSlides,
            update,
        });
    };

    const Keyboard = ({ swiper, extendParams, on, emit }) => {
        extendParams({
            keyboard: {
                enabled: false,
                onlyInViewport: true,
                pageUpDown: true,
                speed: undefined,
            },
        });
        function getParams() {
            return swiper.params.keyboard;
        }
        function handle(event) {
            if (!swiper.enabled)
                return;
            const { rtlTranslate: rtl } = swiper;
            const e = 'originalEvent' in event && event.originalEvent ? event.originalEvent : event;
            const kc = e.keyCode || e.charCode;
            const params = getParams();
            const pageUpDown = !!params.pageUpDown;
            const isPageUp = pageUpDown && kc === 33;
            const isPageDown = pageUpDown && kc === 34;
            const isArrowLeft = kc === 37;
            const isArrowRight = kc === 39;
            const isArrowUp = kc === 38;
            const isArrowDown = kc === 40;
            // Directions locks
            if (!swiper.allowSlideNext &&
                ((swiper.isHorizontal() && isArrowRight) ||
                    (swiper.isVertical() && isArrowDown) ||
                    isPageDown)) {
                return false;
            }
            if (!swiper.allowSlidePrev &&
                ((swiper.isHorizontal() && isArrowLeft) || (swiper.isVertical() && isArrowUp) || isPageUp)) {
                return false;
            }
            if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
                return undefined;
            }
            const activeElement = document.activeElement;
            if (activeElement &&
                (activeElement.isContentEditable ||
                    (activeElement.nodeName &&
                        (activeElement.nodeName.toLowerCase() === 'input' ||
                            activeElement.nodeName.toLowerCase() === 'textarea')))) {
                return undefined;
            }
            if (params.onlyInViewport &&
                (isPageUp || isPageDown || isArrowLeft || isArrowRight || isArrowUp || isArrowDown)) {
                let inView = false;
                // Check that swiper should be inside of visible area of window
                if (elementParents(swiper.el, `.${swiper.params.slideClass}, swiper-slide`).length > 0 &&
                    elementParents(swiper.el, `.${swiper.params.slideActiveClass}`).length === 0) {
                    return undefined;
                }
                const el = swiper.el;
                const swiperWidth = el.clientWidth;
                const swiperHeight = el.clientHeight;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const swiperOffset = elementOffset(el);
                if (rtl)
                    swiperOffset.left -= el.scrollLeft;
                const swiperCoord = [
                    [swiperOffset.left, swiperOffset.top],
                    [swiperOffset.left + swiperWidth, swiperOffset.top],
                    [swiperOffset.left, swiperOffset.top + swiperHeight],
                    [swiperOffset.left + swiperWidth, swiperOffset.top + swiperHeight],
                ];
                for (let i = 0; i < swiperCoord.length; i += 1) {
                    const point = swiperCoord[i];
                    if (point[0] >= 0 && point[0] <= windowWidth && point[1] >= 0 && point[1] <= windowHeight) {
                        if (point[0] === 0 && point[1] === 0)
                            continue;
                        inView = true;
                    }
                }
                if (!inView)
                    return undefined;
            }
            const speed = params.speed;
            if (swiper.isHorizontal()) {
                if (isPageUp || isPageDown || isArrowLeft || isArrowRight) {
                    if (e.cancelable)
                        e.preventDefault();
                }
                if (((isPageDown || isArrowRight) && !rtl) || ((isPageUp || isArrowLeft) && rtl))
                    swiper.slideNext(speed);
                if (((isPageUp || isArrowLeft) && !rtl) || ((isPageDown || isArrowRight) && rtl))
                    swiper.slidePrev(speed);
            }
            else {
                if (isPageUp || isPageDown || isArrowUp || isArrowDown) {
                    if (e.cancelable)
                        e.preventDefault();
                }
                if (isPageDown || isArrowDown)
                    swiper.slideNext(speed);
                if (isPageUp || isArrowUp)
                    swiper.slidePrev(speed);
            }
            emit('keyPress', kc);
            return undefined;
        }
        function enable() {
            if (swiper.keyboard.enabled)
                return;
            document.addEventListener('keydown', handle);
            swiper.keyboard.enabled = true;
        }
        function disable() {
            if (!swiper.keyboard.enabled)
                return;
            document.removeEventListener('keydown', handle);
            swiper.keyboard.enabled = false;
        }
        swiper.keyboard = {
            enabled: false,
            enable,
            disable,
        };
        on('init', () => {
            if (getParams().enabled) {
                enable();
            }
        });
        on('destroy', () => {
            if (swiper.keyboard.enabled) {
                disable();
            }
        });
    };

    const Mousewheel = ({ swiper, extendParams, on, emit }) => {
        extendParams({
            mousewheel: {
                enabled: false,
                releaseOnEdges: false,
                invert: false,
                forceToAxis: false,
                sensitivity: 1,
                eventsTarget: 'container',
                thresholdDelta: null,
                thresholdTime: null,
                noMousewheelClass: 'swiper-no-mousewheel',
            },
        });
        let timeout;
        let lastScrollTime = now();
        let lastEventBeforeSnap;
        let mouseEntered = false;
        const recentWheelEvents = [];
        function getParams() {
            return swiper.params.mousewheel;
        }
        function normalize(e) {
            // Reasonable defaults
            const PIXEL_STEP = 10;
            const LINE_HEIGHT = 40;
            const PAGE_HEIGHT = 800;
            const ev = e;
            let sX = 0;
            let sY = 0; // spinX, spinY
            let pX = 0;
            let pY = 0; // pixelX, pixelY
            // Legacy
            if (ev.detail !== undefined) {
                sY = ev.detail;
            }
            if (ev.wheelDelta !== undefined) {
                sY = -ev.wheelDelta / 120;
            }
            if (ev.wheelDeltaY !== undefined) {
                sY = -ev.wheelDeltaY / 120;
            }
            if (ev.wheelDeltaX !== undefined) {
                sX = -ev.wheelDeltaX / 120;
            }
            // side scrolling on FF with DOMMouseScroll
            if (ev.axis !== undefined &&
                ev.HORIZONTAL_AXIS !== undefined &&
                ev.axis === ev.HORIZONTAL_AXIS) {
                sX = sY;
                sY = 0;
            }
            pX = sX * PIXEL_STEP;
            pY = sY * PIXEL_STEP;
            if (ev.deltaY !== undefined) {
                pY = ev.deltaY;
            }
            if (ev.deltaX !== undefined) {
                pX = ev.deltaX;
            }
            if (ev.shiftKey && !pX) {
                // if user scrolls with shift he wants horizontal scroll
                pX = pY;
                pY = 0;
            }
            if ((pX || pY) && ev.deltaMode) {
                if (ev.deltaMode === 1) {
                    // delta in LINE units
                    pX *= LINE_HEIGHT;
                    pY *= LINE_HEIGHT;
                }
                else {
                    // delta in PAGE units
                    pX *= PAGE_HEIGHT;
                    pY *= PAGE_HEIGHT;
                }
            }
            // Fall-back if spin cannot be determined
            if (pX && !sX) {
                sX = pX < 1 ? -1 : 1;
            }
            if (pY && !sY) {
                sY = pY < 1 ? -1 : 1;
            }
            return {
                spinX: sX,
                spinY: sY,
                pixelX: pX,
                pixelY: pY,
            };
        }
        function handleMouseEnter() {
            if (!swiper.enabled)
                return;
            mouseEntered = true;
        }
        function handleMouseLeave() {
            if (!swiper.enabled)
                return;
            mouseEntered = false;
        }
        function animateSlider(newEvent) {
            const params = getParams();
            if (params.thresholdDelta && newEvent.delta < params.thresholdDelta) {
                // Prevent if delta of wheel scroll delta is below configured threshold
                return false;
            }
            if (params.thresholdTime && now() - lastScrollTime < params.thresholdTime) {
                // Prevent if time between scrolls is below configured threshold
                return false;
            }
            // If the movement is NOT big enough and
            // if the last time the user scrolled was too close to the current one (avoid continuously triggering the slider):
            //   Don't go any further (avoid insignificant scroll movement).
            if (newEvent.delta >= 6 && now() - lastScrollTime < 60) {
                // Return false as a default
                return true;
            }
            if (newEvent.direction < 0) {
                if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
                    swiper.slideNext();
                    emit('scroll', newEvent.raw);
                }
            }
            else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
                swiper.slidePrev();
                emit('scroll', newEvent.raw);
            }
            // If you got here is because an animation has been triggered so store the current time
            lastScrollTime = new window.Date().getTime();
            // Return false as a default
            return false;
        }
        function releaseScroll(newEvent) {
            const params = getParams();
            if (newEvent.direction < 0) {
                if (swiper.isEnd && !swiper.params.loop && params.releaseOnEdges) {
                    // Return true to animate scroll on edges
                    return true;
                }
            }
            else if (swiper.isBeginning && !swiper.params.loop && params.releaseOnEdges) {
                // Return true to animate scroll on edges
                return true;
            }
            return false;
        }
        function handle(event) {
            let e = 'originalEvent' in event && event.originalEvent ? event.originalEvent : event;
            let disableParentSwiper = true;
            if (!swiper.enabled)
                return false;
            // Ignore event if the target or its parents have the swiper-no-mousewheel class
            const params = getParams();
            if (event.target.closest(`.${params.noMousewheelClass}`))
                return false;
            if (swiper.params.cssMode) {
                e.preventDefault();
            }
            let targetEl = swiper.el;
            if (params.eventsTarget !== 'container') {
                targetEl = document.querySelector(params.eventsTarget);
            }
            const targetElContainsTarget = targetEl && targetEl.contains(e.target);
            if (!mouseEntered && !targetElContainsTarget && !params.releaseOnEdges)
                return true;
            let delta = 0;
            const rtlFactor = swiper.rtlTranslate ? -1 : 1;
            const data = normalize(e);
            if (params.forceToAxis) {
                if (swiper.isHorizontal()) {
                    if (Math.abs(data.pixelX) > Math.abs(data.pixelY))
                        delta = -data.pixelX * rtlFactor;
                    else
                        return true;
                }
                else if (Math.abs(data.pixelY) > Math.abs(data.pixelX))
                    delta = -data.pixelY;
                else
                    return true;
            }
            else {
                delta =
                    Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
            }
            if (delta === 0)
                return true;
            if (params.invert)
                delta = -delta;
            // Get the scroll positions
            let positions = swiper.getTranslate() + delta * (params.sensitivity ?? 1);
            if (positions >= swiper.minTranslate())
                positions = swiper.minTranslate();
            if (positions <= swiper.maxTranslate())
                positions = swiper.maxTranslate();
            // When loop is true:
            //     the disableParentSwiper will be true.
            // When loop is false:
            //     if the scroll positions is not on edge,
            //     then the disableParentSwiper will be true.
            //     if the scroll on edge positions,
            //     then the disableParentSwiper will be false.
            disableParentSwiper = swiper.params.loop
                ? true
                : !(positions === swiper.minTranslate() || positions === swiper.maxTranslate());
            if (disableParentSwiper && swiper.params.nested)
                e.stopPropagation();
            const freeModeParams = swiper.params.freeMode;
            if (!swiper.params.freeMode || !freeModeParams?.enabled) {
                // Register the new event in a variable which stores the relevant data
                const newEvent = {
                    time: now(),
                    delta: Math.abs(delta),
                    direction: Math.sign(delta),
                    raw: event,
                };
                // Keep the most recent events
                if (recentWheelEvents.length >= 2) {
                    recentWheelEvents.shift(); // only store the last N events
                }
                const prevEvent = recentWheelEvents.length
                    ? recentWheelEvents[recentWheelEvents.length - 1]
                    : undefined;
                recentWheelEvents.push(newEvent);
                if (prevEvent) {
                    if (newEvent.direction !== prevEvent.direction ||
                        newEvent.delta > prevEvent.delta ||
                        newEvent.time > prevEvent.time + 150) {
                        animateSlider(newEvent);
                    }
                }
                else {
                    animateSlider(newEvent);
                }
                // If it's time to release the scroll:
                //   Return now so you don't hit the preventDefault.
                if (releaseScroll(newEvent)) {
                    return true;
                }
            }
            else {
                // Freemode or scrollContainer:
                const newEvent = {
                    time: now(),
                    delta: Math.abs(delta),
                    direction: Math.sign(delta),
                };
                const ignoreWheelEvents = lastEventBeforeSnap &&
                    newEvent.time < lastEventBeforeSnap.time + 500 &&
                    newEvent.delta <= lastEventBeforeSnap.delta &&
                    newEvent.direction === lastEventBeforeSnap.direction;
                if (!ignoreWheelEvents) {
                    lastEventBeforeSnap = undefined;
                    let position = swiper.getTranslate() + delta * (params.sensitivity ?? 1);
                    const wasBeginning = swiper.isBeginning;
                    const wasEnd = swiper.isEnd;
                    if (position >= swiper.minTranslate())
                        position = swiper.minTranslate();
                    if (position <= swiper.maxTranslate())
                        position = swiper.maxTranslate();
                    swiper.setTransition(0);
                    swiper.setTranslate(position);
                    swiper.updateProgress();
                    swiper.updateActiveIndex();
                    swiper.updateSlidesClasses();
                    if ((!wasBeginning && swiper.isBeginning) || (!wasEnd && swiper.isEnd)) {
                        swiper.updateSlidesClasses();
                    }
                    if (swiper.params.loop) {
                        swiper.loopFix({
                            direction: newEvent.direction < 0 ? 'next' : 'prev',
                            byMousewheel: true,
                        });
                    }
                    if (freeModeParams?.sticky) {
                        clearTimeout(timeout);
                        timeout = undefined;
                        if (recentWheelEvents.length >= 15) {
                            recentWheelEvents.shift(); // only store the last N events
                        }
                        const prevEvent = recentWheelEvents.length
                            ? recentWheelEvents[recentWheelEvents.length - 1]
                            : undefined;
                        const firstEvent = recentWheelEvents[0];
                        recentWheelEvents.push(newEvent);
                        if (prevEvent &&
                            (newEvent.delta > prevEvent.delta || newEvent.direction !== prevEvent.direction)) {
                            // Increasing or reverse-sign delta means the user started scrolling again. Clear the wheel event log.
                            recentWheelEvents.splice(0);
                        }
                        else if (recentWheelEvents.length >= 15 &&
                            firstEvent &&
                            newEvent.time - firstEvent.time < 500 &&
                            firstEvent.delta - newEvent.delta >= 1 &&
                            newEvent.delta <= 6) {
                            const snapToThreshold = delta > 0 ? 0.8 : 0.2;
                            lastEventBeforeSnap = newEvent;
                            recentWheelEvents.splice(0);
                            timeout = nextTick(() => {
                                if (swiper.destroyed || !swiper.params)
                                    return;
                                swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                            }, 0); // no delay; move on next tick
                        }
                        if (!timeout) {
                            timeout = nextTick(() => {
                                if (swiper.destroyed || !swiper.params)
                                    return;
                                const snapToThreshold = 0.5;
                                lastEventBeforeSnap = newEvent;
                                recentWheelEvents.splice(0);
                                swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                            }, 500);
                        }
                    }
                    // Emit event
                    if (!ignoreWheelEvents)
                        emit('scroll', e);
                    // Stop autoplay
                    const autoplayParams = swiper.params.autoplay;
                    if (swiper.params.autoplay && autoplayParams?.disableOnInteraction) {
                        swiper.autoplay.stop();
                    }
                    // Return page scroll on edge positions
                    if (params.releaseOnEdges &&
                        (position === swiper.minTranslate() || position === swiper.maxTranslate())) {
                        return true;
                    }
                }
            }
            if (e.cancelable)
                e.preventDefault();
            return false;
        }
        function events(method) {
            const params = getParams();
            let targetEl = swiper.el;
            if (params.eventsTarget !== 'container') {
                targetEl = document.querySelector(params.eventsTarget);
            }
            targetEl[method]('mouseenter', handleMouseEnter);
            targetEl[method]('mouseleave', handleMouseLeave);
            targetEl[method]('wheel', handle);
        }
        function enable() {
            if (swiper.params.cssMode) {
                swiper.wrapperEl.removeEventListener('wheel', handle);
                return true;
            }
            if (swiper.mousewheel.enabled)
                return false;
            events('addEventListener');
            swiper.mousewheel.enabled = true;
            return true;
        }
        function disable() {
            if (swiper.params.cssMode) {
                swiper.wrapperEl.addEventListener('wheel', handle);
                return true;
            }
            if (!swiper.mousewheel.enabled)
                return false;
            events('removeEventListener');
            swiper.mousewheel.enabled = false;
            return true;
        }
        on('init', () => {
            const params = getParams();
            if (!params.enabled && swiper.params.cssMode) {
                disable();
            }
            if (params.enabled)
                enable();
        });
        swiper.mousewheel = {
            enabled: false,
            enable,
            disable,
        };
        on('destroy', () => {
            if (swiper.params.cssMode) {
                enable();
            }
            if (swiper.mousewheel.enabled)
                disable();
        });
    };

    function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
        const target = (params ?? {});
        const original = (originalParams ?? {});
        if (swiper.params.createElements) {
            Object.keys(checkProps).forEach((key) => {
                if (!target[key] && target.auto === true) {
                    let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
                    if (!element) {
                        element = createElement('div', checkProps[key]);
                        element.className = checkProps[key];
                        swiper.el.append(element);
                    }
                    target[key] = element;
                    original[key] = element;
                }
            });
        }
        return target;
    }

    const arrowSvg = `<svg class="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"/></svg>`;
    const Navigation = ({ swiper, extendParams, on, emit }) => {
        extendParams({
            navigation: {
                nextEl: null,
                prevEl: null,
                addIcons: true,
                hideOnClick: false,
                disabledClass: 'swiper-button-disabled',
                hiddenClass: 'swiper-button-hidden',
                lockClass: 'swiper-button-lock',
                navigationDisabledClass: 'swiper-navigation-disabled',
            },
        });
        // Initialized as a partial; remaining methods (update, init, destroy,
        // enable, disable) attach after their definitions below.
        swiper.navigation = {
            nextEl: null,
            prevEl: null,
            arrowSvg,
        };
        function getParams() {
            return swiper.params.navigation;
        }
        function getEl(el) {
            let res;
            if (el && typeof el === 'string' && swiper.isElement) {
                res = (swiper.el.querySelector(el) || swiper.hostEl.querySelector(el));
                if (res)
                    return res;
            }
            if (el) {
                if (typeof el === 'string')
                    res = [...document.querySelectorAll(el)];
                if (swiper.params.uniqueNavElements &&
                    typeof el === 'string' &&
                    res &&
                    res.length > 1 &&
                    swiper.el.querySelectorAll(el).length === 1) {
                    res = swiper.el.querySelector(el);
                }
                else if (res && res.length === 1) {
                    res = res[0];
                }
            }
            if (el && !res)
                return el;
            return res;
        }
        function toggleEl(el, disabled) {
            const params = getParams();
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                if (subEl) {
                    subEl.classList[disabled ? 'add' : 'remove'](...params.disabledClass.split(' '));
                    if (subEl.tagName === 'BUTTON')
                        subEl.disabled = disabled;
                    if (swiper.params.watchOverflow && swiper.enabled) {
                        subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
                    }
                }
            });
        }
        function update() {
            // Update Navigation Buttons
            const { nextEl, prevEl } = swiper.navigation;
            if (swiper.params.loop) {
                toggleEl(prevEl, false);
                toggleEl(nextEl, false);
                return;
            }
            toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
            toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
        }
        function onPrevClick(e) {
            e.preventDefault();
            if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind)
                return;
            swiper.slidePrev();
            emit('navigationPrev');
        }
        function onNextClick(e) {
            e.preventDefault();
            if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind)
                return;
            swiper.slideNext();
            emit('navigationNext');
        }
        function init() {
            swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
                nextEl: 'swiper-button-next',
                prevEl: 'swiper-button-prev',
            });
            const params = getParams();
            if (!(params.nextEl || params.prevEl))
                return;
            const nextEl = getEl(params.nextEl);
            const prevEl = getEl(params.prevEl);
            Object.assign(swiper.navigation, {
                nextEl,
                prevEl,
            });
            const nextEls = makeElementsArray(nextEl);
            const prevEls = makeElementsArray(prevEl);
            const initButton = (el, dir) => {
                if (el) {
                    if (params.addIcons &&
                        el.matches('.swiper-button-next,.swiper-button-prev') &&
                        !el.querySelector('svg')) {
                        const tempEl = document.createElement('div');
                        setInnerHTML(tempEl, arrowSvg);
                        const svgEl = tempEl.querySelector('svg');
                        if (svgEl)
                            el.appendChild(svgEl);
                        tempEl.remove();
                    }
                    el.addEventListener('click', dir === 'next' ? onNextClick : onPrevClick);
                }
                if (!swiper.enabled && el) {
                    el.classList.add(...params.lockClass.split(' '));
                }
            };
            nextEls.forEach((el) => initButton(el, 'next'));
            prevEls.forEach((el) => initButton(el, 'prev'));
        }
        function destroy() {
            const params = getParams();
            const { nextEl, prevEl } = swiper.navigation;
            const nextEls = makeElementsArray(nextEl);
            const prevEls = makeElementsArray(prevEl);
            const destroyButton = (el, dir) => {
                el.removeEventListener('click', dir === 'next' ? onNextClick : onPrevClick);
                el.classList.remove(...params.disabledClass.split(' '));
            };
            nextEls.forEach((el) => destroyButton(el, 'next'));
            prevEls.forEach((el) => destroyButton(el, 'prev'));
        }
        on('init', () => {
            if (getParams().enabled === false) {
                disable();
            }
            else {
                init();
                update();
            }
        });
        on('toEdge fromEdge lock unlock', () => {
            update();
        });
        on('destroy', () => {
            destroy();
        });
        on('enable disable', () => {
            const params = getParams();
            const { nextEl, prevEl } = swiper.navigation;
            const nextEls = makeElementsArray(nextEl);
            const prevEls = makeElementsArray(prevEl);
            if (swiper.enabled) {
                update();
                return;
            }
            [...nextEls, ...prevEls]
                .filter((el) => !!el)
                .forEach((el) => el.classList.add(params.lockClass));
        });
        on('click', (_s, e) => {
            const params = getParams();
            const { nextEl, prevEl } = swiper.navigation;
            const nextEls = makeElementsArray(nextEl);
            const prevEls = makeElementsArray(prevEl);
            const targetEl = e.target;
            let targetIsButton = prevEls.includes(targetEl) || nextEls.includes(targetEl);
            if (swiper.isElement && !targetIsButton) {
                const path = e.composedPath ? e.composedPath() : [];
                if (path.length) {
                    targetIsButton = path.find((pathEl) => nextEls.includes(pathEl) || prevEls.includes(pathEl));
                }
            }
            if (params.hideOnClick && !targetIsButton) {
                if (swiper.pagination &&
                    swiper.params.pagination &&
                    swiper.params.pagination.clickable &&
                    (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl)))
                    return;
                let isHidden;
                if (nextEls.length) {
                    isHidden = nextEls[0].classList.contains(params.hiddenClass);
                }
                else if (prevEls.length) {
                    isHidden = prevEls[0].classList.contains(params.hiddenClass);
                }
                if (isHidden === true) {
                    emit('navigationShow');
                }
                else {
                    emit('navigationHide');
                }
                [...nextEls, ...prevEls]
                    .filter((el) => !!el)
                    .forEach((el) => el.classList.toggle(params.hiddenClass));
            }
        });
        const enable = () => {
            const params = getParams();
            swiper.el.classList.remove(...params.navigationDisabledClass.split(' '));
            init();
            update();
        };
        const disable = () => {
            const params = getParams();
            swiper.el.classList.add(...params.navigationDisabledClass.split(' '));
            destroy();
        };
        Object.assign(swiper.navigation, {
            enable,
            disable,
            update,
            init,
            destroy,
        });
    };

    function classesToSelector(classes = '') {
        return `.${classes
        .trim()
        .replace(/([.:!+/()[\]#>~*^$|=,'"@{}\\])/g, '\\$1')
        .replace(/ /g, '.')}`;
    }

    const isVirtualEnabled$2 = (swiper) => !!swiper.virtual && !!swiper.params.virtual?.enabled;
    const isFreeModeEnabled = (swiper) => !!swiper.params.freeMode?.enabled;
    const Pagination = ({ swiper, extendParams, on, emit }) => {
        const pfx = 'swiper-pagination';
        extendParams({
            pagination: {
                el: null,
                bulletElement: 'span',
                clickable: false,
                hideOnClick: false,
                renderBullet: null,
                renderProgressbar: null,
                renderFraction: null,
                renderCustom: null,
                progressbarOpposite: false,
                type: 'bullets', // 'bullets' or 'progressbar' or 'fraction' or 'custom'
                dynamicBullets: false,
                dynamicMainBullets: 1,
                formatFractionCurrent: (number) => number,
                formatFractionTotal: (number) => number,
                bulletClass: `${pfx}-bullet`,
                bulletActiveClass: `${pfx}-bullet-active`,
                modifierClass: `${pfx}-`,
                currentClass: `${pfx}-current`,
                totalClass: `${pfx}-total`,
                hiddenClass: `${pfx}-hidden`,
                progressbarFillClass: `${pfx}-progressbar-fill`,
                progressbarOppositeClass: `${pfx}-progressbar-opposite`,
                clickableClass: `${pfx}-clickable`,
                lockClass: `${pfx}-lock`,
                horizontalClass: `${pfx}-horizontal`,
                verticalClass: `${pfx}-vertical`,
                paginationDisabledClass: `${pfx}-disabled`,
            },
        });
        // Initialized as a partial; remaining methods (render, update, init,
        // destroy, enable, disable) attach after their definitions below.
        swiper.pagination = {
            el: null,
            bullets: [],
        };
        let bulletSize;
        let dynamicBulletIndex = 0;
        function getParams() {
            return swiper.params.pagination;
        }
        function isPaginationDisabled() {
            const elParam = getParams().el;
            return (!elParam ||
                !swiper.pagination.el ||
                (Array.isArray(swiper.pagination.el) &&
                    swiper.pagination.el.length === 0));
        }
        function setSideBullets(bulletEl, position) {
            const { bulletActiveClass } = getParams();
            if (!bulletEl)
                return;
            let current = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
            if (current) {
                current.classList.add(`${bulletActiveClass}-${position}`);
                current = current[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
                if (current) {
                    current.classList.add(`${bulletActiveClass}-${position}-${position}`);
                }
            }
        }
        function getMoveDirection(prevIndex, nextIndex, length) {
            prevIndex = prevIndex % length;
            nextIndex = nextIndex % length;
            if (nextIndex === prevIndex + 1) {
                return 'next';
            }
            else if (nextIndex === prevIndex - 1) {
                return 'previous';
            }
            return undefined;
        }
        function onBulletClick(e) {
            const targetEl = e.target;
            const bulletEl = targetEl.closest(classesToSelector(getParams().bulletClass));
            if (!bulletEl) {
                return;
            }
            e.preventDefault();
            const index = (elementIndex(bulletEl) ?? 0) * (swiper.params.slidesPerGroup ?? 1);
            if (swiper.params.loop) {
                if (swiper.realIndex === index)
                    return;
                const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
                if (moveDirection === 'next') {
                    swiper.slideNext();
                }
                else if (moveDirection === 'previous') {
                    swiper.slidePrev();
                }
                else {
                    swiper.slideToLoop(index);
                }
            }
            else {
                swiper.slideTo(index);
            }
        }
        function update() {
            // Render || Update Pagination bullets/items
            const rtl = swiper.rtl;
            const params = getParams();
            if (isPaginationDisabled())
                return;
            const els = makeElementsArray(swiper.pagination.el);
            // Current/Total
            let current;
            let previousIndex;
            const slidesLength = isVirtualEnabled$2(swiper)
                ? swiper.virtual.slides.length
                : swiper.slides.length;
            const total = swiper.params.loop
                ? Math.ceil(slidesLength / (swiper.params.slidesPerGroup ?? 1))
                : swiper.snapGrid.length;
            if (swiper.params.loop) {
                previousIndex = swiper.previousRealIndex || 0;
                current =
                    (swiper.params.slidesPerGroup ?? 1) > 1
                        ? Math.floor(swiper.realIndex / (swiper.params.slidesPerGroup ?? 1))
                        : swiper.realIndex;
            }
            else if (typeof swiper.snapIndex !== 'undefined') {
                current = swiper.snapIndex;
                previousIndex = swiper.previousSnapIndex;
            }
            else {
                previousIndex = swiper.previousIndex || 0;
                current = swiper.activeIndex || 0;
            }
            // Types
            if (params.type === 'bullets' &&
                swiper.pagination.bullets &&
                swiper.pagination.bullets.length > 0) {
                const bullets = swiper.pagination.bullets;
                let firstIndex = 0;
                let lastIndex = 0;
                let midIndex = 0;
                if (params.dynamicBullets) {
                    bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? 'width' : 'height');
                    const dim = swiper.isHorizontal() ? 'width' : 'height';
                    els.forEach((subEl) => {
                        subEl.style[dim] = `${(bulletSize ?? 0) * (params.dynamicMainBullets + 4)}px`;
                    });
                    if (params.dynamicMainBullets > 1 && previousIndex !== undefined) {
                        dynamicBulletIndex += current - (previousIndex || 0);
                        if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
                            dynamicBulletIndex = params.dynamicMainBullets - 1;
                        }
                        else if (dynamicBulletIndex < 0) {
                            dynamicBulletIndex = 0;
                        }
                    }
                    firstIndex = Math.max(current - dynamicBulletIndex, 0);
                    lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
                    midIndex = (lastIndex + firstIndex) / 2;
                }
                bullets.forEach((bulletEl) => {
                    const classesToRemove = [
                        '',
                        '-next',
                        '-next-next',
                        '-prev',
                        '-prev-prev',
                        '-main',
                    ]
                        .map((suffix) => `${params.bulletActiveClass}${suffix}`)
                        .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]));
                    bulletEl.classList.remove(...classesToRemove);
                });
                if (els.length > 1) {
                    bullets.forEach((bullet) => {
                        const bulletIndex = elementIndex(bullet);
                        if (bulletIndex === current) {
                            bullet.classList.add(...params.bulletActiveClass.split(' '));
                        }
                        else if (swiper.isElement) {
                            bullet.setAttribute('part', 'bullet');
                        }
                        if (params.dynamicBullets && bulletIndex !== undefined) {
                            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                                bullet.classList.add(...`${params.bulletActiveClass}-main`.split(' '));
                            }
                            if (bulletIndex === firstIndex) {
                                setSideBullets(bullet, 'prev');
                            }
                            if (bulletIndex === lastIndex) {
                                setSideBullets(bullet, 'next');
                            }
                        }
                    });
                }
                else {
                    const bullet = bullets[current];
                    if (bullet) {
                        bullet.classList.add(...params.bulletActiveClass.split(' '));
                    }
                    if (swiper.isElement) {
                        bullets.forEach((bulletEl, bulletIndex) => {
                            bulletEl.setAttribute('part', bulletIndex === current ? 'bullet-active' : 'bullet');
                        });
                    }
                    if (params.dynamicBullets) {
                        const firstDisplayedBullet = bullets[firstIndex];
                        const lastDisplayedBullet = bullets[lastIndex];
                        for (let i = firstIndex; i <= lastIndex; i += 1) {
                            if (bullets[i]) {
                                bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(' '));
                            }
                        }
                        setSideBullets(firstDisplayedBullet, 'prev');
                        setSideBullets(lastDisplayedBullet, 'next');
                    }
                }
                if (params.dynamicBullets) {
                    const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
                    const bulletsOffset = ((bulletSize ?? 0) * dynamicBulletsLength - (bulletSize ?? 0)) / 2 -
                        midIndex * (bulletSize ?? 0);
                    const offsetProp = rtl ? 'right' : 'left';
                    const positionDim = swiper.isHorizontal() ? offsetProp : 'top';
                    bullets.forEach((bullet) => {
                        bullet.style[positionDim] = `${bulletsOffset}px`;
                    });
                }
            }
            els.forEach((subEl, subElIndex) => {
                if (params.type === 'fraction') {
                    subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach((fractionEl) => {
                        fractionEl.textContent = String(params.formatFractionCurrent(current + 1));
                    });
                    subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach((totalEl) => {
                        totalEl.textContent = String(params.formatFractionTotal(total));
                    });
                }
                if (params.type === 'progressbar') {
                    let progressbarDirection;
                    if (params.progressbarOpposite) {
                        progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
                    }
                    else {
                        progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
                    }
                    const scale = (current + 1) / total;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (progressbarDirection === 'horizontal') {
                        scaleX = scale;
                    }
                    else {
                        scaleY = scale;
                    }
                    subEl
                        .querySelectorAll(classesToSelector(params.progressbarFillClass))
                        .forEach((progressEl) => {
                        progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
                        progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
                    });
                }
                if (params.type === 'custom' && params.renderCustom) {
                    setInnerHTML(subEl, params.renderCustom(swiper, current + 1, total));
                    if (subElIndex === 0)
                        emit('paginationRender', subEl);
                }
                else {
                    if (subElIndex === 0)
                        emit('paginationRender', subEl);
                    emit('paginationUpdate', subEl);
                }
                if (swiper.params.watchOverflow && swiper.enabled) {
                    subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
                }
            });
        }
        function render() {
            // Render Container
            const params = getParams();
            if (isPaginationDisabled())
                return;
            const gridParams = swiper.params.grid;
            const slidesLength = isVirtualEnabled$2(swiper)
                ? swiper.virtual.slides.length
                : swiper.grid && gridParams?.rows && gridParams.rows > 1
                    ? swiper.slides.length / Math.ceil(gridParams.rows)
                    : swiper.slides.length;
            const els = makeElementsArray(swiper.pagination.el);
            let paginationHTML = '';
            if (params.type === 'bullets') {
                let numberOfBullets = swiper.params.loop
                    ? Math.ceil(slidesLength / (swiper.params.slidesPerGroup ?? 1))
                    : swiper.snapGrid.length;
                if (swiper.params.freeMode && isFreeModeEnabled(swiper) && numberOfBullets > slidesLength) {
                    numberOfBullets = slidesLength;
                }
                for (let i = 0; i < numberOfBullets; i += 1) {
                    if (params.renderBullet) {
                        paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
                    }
                    else {
                        // oxfmt-ignore
                        paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ''} class="${params.bulletClass}"></${params.bulletElement}>`;
                    }
                }
            }
            if (params.type === 'fraction') {
                if (params.renderFraction) {
                    paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
                }
                else {
                    paginationHTML =
                        `<span class="${params.currentClass}"></span>` +
                            ' / ' +
                            `<span class="${params.totalClass}"></span>`;
                }
            }
            if (params.type === 'progressbar') {
                if (params.renderProgressbar) {
                    paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
                }
                else {
                    paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
                }
            }
            swiper.pagination.bullets = [];
            els.forEach((subEl) => {
                if (params.type !== 'custom') {
                    setInnerHTML(subEl, paginationHTML || '');
                }
                if (params.type === 'bullets') {
                    swiper.pagination.bullets.push(...Array.from(subEl.querySelectorAll(classesToSelector(params.bulletClass))));
                }
            });
            if (params.type !== 'custom') {
                emit('paginationRender', els[0]);
            }
        }
        function init() {
            swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, { el: 'swiper-pagination' });
            const params = getParams();
            if (!params.el)
                return;
            let el;
            if (typeof params.el === 'string' && swiper.isElement) {
                el = swiper.el.querySelector(params.el);
            }
            if (!el && typeof params.el === 'string') {
                el = [...document.querySelectorAll(params.el)];
            }
            if (!el) {
                el = params.el;
            }
            if (!el || (Array.isArray(el) && el.length === 0))
                return;
            if (swiper.params.uniqueNavElements &&
                typeof params.el === 'string' &&
                Array.isArray(el) &&
                el.length > 1) {
                el = [...swiper.el.querySelectorAll(params.el)];
                // check if it belongs to another nested Swiper
                if (el.length > 1) {
                    const found = el.find((subEl) => {
                        if (elementParents(subEl, '.swiper')[0] !== swiper.el)
                            return false;
                        return true;
                    });
                    if (found)
                        el = found;
                }
            }
            if (Array.isArray(el) && el.length === 1)
                el = el[0];
            Object.assign(swiper.pagination, {
                el,
            });
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                if (params.type === 'bullets' && params.clickable) {
                    subEl.classList.add(...(params.clickableClass || '').split(' '));
                }
                subEl.classList.add(params.modifierClass + params.type);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                if (params.type === 'bullets' && params.dynamicBullets) {
                    subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
                    dynamicBulletIndex = 0;
                    if (params.dynamicMainBullets < 1) {
                        params.dynamicMainBullets = 1;
                    }
                }
                if (params.type === 'progressbar' && params.progressbarOpposite) {
                    subEl.classList.add(params.progressbarOppositeClass);
                }
                if (params.clickable) {
                    subEl.addEventListener('click', onBulletClick);
                }
                if (!swiper.enabled) {
                    subEl.classList.add(params.lockClass);
                }
            });
        }
        function destroy() {
            const params = getParams();
            if (isPaginationDisabled())
                return;
            const el = swiper.pagination.el;
            if (el) {
                const els = makeElementsArray(el);
                els.forEach((subEl) => {
                    subEl.classList.remove(params.hiddenClass);
                    subEl.classList.remove(params.modifierClass + params.type);
                    subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                    if (params.clickable) {
                        subEl.classList.remove(...(params.clickableClass || '').split(' '));
                        subEl.removeEventListener('click', onBulletClick);
                    }
                });
            }
            if (swiper.pagination.bullets)
                swiper.pagination.bullets.forEach((subEl) => subEl.classList.remove(...params.bulletActiveClass.split(' ')));
        }
        on('changeDirection', () => {
            if (!swiper.pagination || !swiper.pagination.el)
                return;
            const params = getParams();
            const els = makeElementsArray(swiper.pagination.el);
            els.forEach((subEl) => {
                subEl.classList.remove(params.horizontalClass, params.verticalClass);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            });
        });
        on('init', () => {
            if (getParams().enabled === false) {
                disable();
            }
            else {
                init();
                render();
                update();
            }
        });
        on('activeIndexChange', () => {
            if (typeof swiper.snapIndex === 'undefined') {
                update();
            }
        });
        on('snapIndexChange', () => {
            update();
        });
        on('snapGridLengthChange', () => {
            render();
            update();
        });
        on('destroy', () => {
            destroy();
        });
        on('enable disable', () => {
            const { el } = swiper.pagination;
            if (el) {
                const params = getParams();
                const els = makeElementsArray(el);
                els.forEach((subEl) => subEl.classList[swiper.enabled ? 'remove' : 'add'](params.lockClass));
            }
        });
        on('lock unlock', () => {
            update();
        });
        on('click', (_s, e) => {
            const targetEl = e.target;
            const els = makeElementsArray(swiper.pagination.el);
            const params = getParams();
            if (params.el &&
                params.hideOnClick &&
                els &&
                els.length > 0 &&
                !targetEl.classList.contains(params.bulletClass)) {
                if (swiper.navigation &&
                    ((swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl) ||
                        (swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)))
                    return;
                const isHidden = els[0].classList.contains(params.hiddenClass);
                if (isHidden === true) {
                    emit('paginationShow');
                }
                else {
                    emit('paginationHide');
                }
                els.forEach((subEl) => subEl.classList.toggle(params.hiddenClass));
            }
        });
        const enable = () => {
            const params = getParams();
            swiper.el.classList.remove(params.paginationDisabledClass);
            const { el } = swiper.pagination;
            if (el) {
                const els = makeElementsArray(el);
                els.forEach((subEl) => subEl.classList.remove(params.paginationDisabledClass));
            }
            init();
            render();
            update();
        };
        const disable = () => {
            const params = getParams();
            swiper.el.classList.add(params.paginationDisabledClass);
            const { el } = swiper.pagination;
            if (el) {
                const els = makeElementsArray(el);
                els.forEach((subEl) => subEl.classList.add(params.paginationDisabledClass));
            }
            destroy();
        };
        Object.assign(swiper.pagination, {
            enable,
            disable,
            render,
            update,
            init,
            destroy,
        });
    };

    const Scrollbar = ({ swiper, extendParams, on, emit }) => {
        let isTouched = false;
        let timeout = null;
        let dragTimeout = null;
        let dragStartPos = 0;
        let dragSize = 0;
        let trackSize = 0;
        let divider = 0;
        extendParams({
            scrollbar: {
                el: null,
                dragSize: 'auto',
                hide: false,
                draggable: false,
                snapOnRelease: true,
                lockClass: 'swiper-scrollbar-lock',
                dragClass: 'swiper-scrollbar-drag',
                scrollbarDisabledClass: 'swiper-scrollbar-disabled',
                horizontalClass: `swiper-scrollbar-horizontal`,
                verticalClass: `swiper-scrollbar-vertical`,
            },
        });
        // Initialized as a partial; remaining methods (updateSize, setTranslate,
        // init, destroy, enable, disable) attach after their definitions below.
        swiper.scrollbar = {
            el: null,
            dragEl: null,
        };
        function getParams() {
            return swiper.params.scrollbar;
        }
        function setTranslate() {
            const params = getParams();
            if (!params.el || !swiper.scrollbar.el)
                return;
            const { scrollbar, rtlTranslate: rtl } = swiper;
            const { dragEl, el } = scrollbar;
            const progress = swiper.params.loop ? (swiper.progressLoop ?? 0) : swiper.progress;
            let newSize = dragSize;
            let newPos = (trackSize - dragSize) * progress;
            if (rtl) {
                newPos = -newPos;
                if (newPos > 0) {
                    newSize = dragSize - newPos;
                    newPos = 0;
                }
                else if (-newPos + dragSize > trackSize) {
                    newSize = trackSize + newPos;
                }
            }
            else if (newPos < 0) {
                newSize = dragSize + newPos;
                newPos = 0;
            }
            else if (newPos + dragSize > trackSize) {
                newSize = trackSize - newPos;
            }
            if (swiper.isHorizontal()) {
                dragEl.style.transform = `translate3d(${newPos}px, 0, 0)`;
                dragEl.style.width = `${newSize}px`;
            }
            else {
                dragEl.style.transform = `translate3d(0px, ${newPos}px, 0)`;
                dragEl.style.height = `${newSize}px`;
            }
            if (params.hide) {
                if (timeout)
                    clearTimeout(timeout);
                el.style.opacity = '1';
                timeout = setTimeout(() => {
                    el.style.opacity = '0';
                    el.style.transitionDuration = '400ms';
                }, 1000);
            }
        }
        function setTransition(duration) {
            if (!getParams().el || !swiper.scrollbar.el)
                return;
            swiper.scrollbar.dragEl.style.transitionDuration = `${duration}ms`;
        }
        function updateSize() {
            const params = getParams();
            if (!params.el || !swiper.scrollbar.el)
                return;
            const { scrollbar } = swiper;
            const { dragEl, el } = scrollbar;
            dragEl.style.width = '';
            dragEl.style.height = '';
            trackSize = swiper.isHorizontal() ? el.offsetWidth : el.offsetHeight;
            divider =
                swiper.size /
                    (swiper.virtualSize +
                        (swiper.params.slidesOffsetBefore ?? 0) -
                        (swiper.params.centeredSlides ? swiper.snapGrid[0] : 0));
            if (params.dragSize === 'auto') {
                dragSize = trackSize * divider;
            }
            else {
                dragSize = parseInt(String(params.dragSize), 10);
            }
            if (swiper.isHorizontal()) {
                dragEl.style.width = `${dragSize}px`;
            }
            else {
                dragEl.style.height = `${dragSize}px`;
            }
            if (divider >= 1) {
                el.style.display = 'none';
            }
            else {
                el.style.display = '';
            }
            if (params.hide) {
                el.style.opacity = '0';
            }
            if (swiper.params.watchOverflow && swiper.enabled) {
                scrollbar.el.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
            }
        }
        function getPointerPosition(e) {
            if (swiper.isHorizontal()) {
                return e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            }
            return e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        }
        function setDragPosition(e) {
            const { scrollbar, rtlTranslate: rtl } = swiper;
            const { el } = scrollbar;
            let positionRatio;
            positionRatio =
                (getPointerPosition(e) -
                    elementOffset(el)[swiper.isHorizontal() ? 'left' : 'top'] -
                    (dragStartPos !== null ? dragStartPos : dragSize / 2)) /
                    (trackSize - dragSize);
            positionRatio = Math.max(Math.min(positionRatio, 1), 0);
            if (rtl) {
                positionRatio = 1 - positionRatio;
            }
            const position = swiper.minTranslate() + (swiper.maxTranslate() - swiper.minTranslate()) * positionRatio;
            swiper.updateProgress(position);
            swiper.setTranslate(position);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        function onDragStart(e) {
            const params = getParams();
            const { scrollbar, wrapperEl } = swiper;
            const { el, dragEl } = scrollbar;
            isTouched = true;
            dragStartPos =
                e.target === dragEl
                    ? getPointerPosition(e) -
                        e.target.getBoundingClientRect()[swiper.isHorizontal() ? 'left' : 'top']
                    : null;
            e.preventDefault();
            e.stopPropagation();
            wrapperEl.style.transitionDuration = '100ms';
            dragEl.style.transitionDuration = '100ms';
            setDragPosition(e);
            if (dragTimeout)
                clearTimeout(dragTimeout);
            el.style.transitionDuration = '0ms';
            if (params.hide) {
                el.style.opacity = '1';
            }
            if (swiper.params.cssMode) {
                swiper.wrapperEl.style.scrollSnapType = 'none';
            }
            emit('scrollbarDragStart', e);
        }
        function onDragMove(e) {
            const { scrollbar, wrapperEl } = swiper;
            const { el, dragEl } = scrollbar;
            if (!isTouched)
                return;
            if (e.cancelable)
                e.preventDefault();
            setDragPosition(e);
            wrapperEl.style.transitionDuration = '0ms';
            el.style.transitionDuration = '0ms';
            dragEl.style.transitionDuration = '0ms';
            emit('scrollbarDragMove', e);
        }
        function onDragEnd(e) {
            const params = getParams();
            const { scrollbar, wrapperEl } = swiper;
            const { el } = scrollbar;
            if (!isTouched)
                return;
            isTouched = false;
            if (swiper.params.cssMode) {
                swiper.wrapperEl.style.scrollSnapType = '';
                wrapperEl.style.transitionDuration = '';
            }
            if (params.hide) {
                if (dragTimeout)
                    clearTimeout(dragTimeout);
                dragTimeout = nextTick(() => {
                    el.style.opacity = '0';
                    el.style.transitionDuration = '400ms';
                }, 1000);
            }
            emit('scrollbarDragEnd', e);
            if (params.snapOnRelease) {
                swiper.slideToClosest();
            }
        }
        function events(method) {
            const { scrollbar, params } = swiper;
            const el = scrollbar.el;
            if (!el)
                return;
            const activeListener = params.passiveListeners ? { passive: false, capture: false } : false;
            const passiveListener = params.passiveListeners ? { passive: true, capture: false } : false;
            const eventMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
            el[eventMethod]('pointerdown', onDragStart, activeListener);
            document[eventMethod]('pointermove', onDragMove, activeListener);
            document[eventMethod]('pointerup', onDragEnd, passiveListener);
        }
        function enableDraggable() {
            if (!getParams().el || !swiper.scrollbar.el)
                return;
            events('on');
        }
        function disableDraggable() {
            if (!getParams().el || !swiper.scrollbar.el)
                return;
            events('off');
        }
        function init() {
            const { scrollbar, el: swiperEl } = swiper;
            swiper.params.scrollbar = createElementIfNotDefined(swiper, swiper.originalParams.scrollbar, swiper.params.scrollbar, { el: 'swiper-scrollbar' });
            const params = getParams();
            if (!params.el)
                return;
            let el;
            if (typeof params.el === 'string' && swiper.isElement) {
                el = swiper.el.querySelector(params.el);
            }
            else {
                el = params.el;
            }
            if (!el && typeof params.el === 'string') {
                el = document.querySelectorAll(params.el);
                if (!el.length)
                    return;
            }
            else if (!el) {
                el = params.el;
            }
            if (swiper.params.uniqueNavElements &&
                typeof params.el === 'string' &&
                el.length > 1 &&
                swiperEl.querySelectorAll(params.el).length === 1) {
                el = swiperEl.querySelector(params.el);
            }
            if (el.length > 0) {
                el = el[0];
            }
            const elTyped = el;
            elTyped.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            let dragEl = null;
            if (elTyped) {
                dragEl = elTyped.querySelector(classesToSelector(params.dragClass));
                if (!dragEl) {
                    dragEl = createElement('div', params.dragClass);
                    elTyped.append(dragEl);
                }
            }
            Object.assign(scrollbar, {
                el: elTyped,
                dragEl,
            });
            if (params.draggable) {
                enableDraggable();
            }
            if (elTyped) {
                elTyped.classList[swiper.enabled ? 'remove' : 'add'](...classesToTokens(params.lockClass));
            }
        }
        function destroy() {
            const params = getParams();
            const el = swiper.scrollbar.el;
            if (el) {
                el.classList.remove(...classesToTokens(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass));
            }
            disableDraggable();
        }
        on('changeDirection', () => {
            if (!swiper.scrollbar || !swiper.scrollbar.el)
                return;
            const params = getParams();
            const els = makeElementsArray(swiper.scrollbar.el);
            els.forEach((subEl) => {
                subEl.classList.remove(params.horizontalClass, params.verticalClass);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            });
        });
        on('init', () => {
            if (getParams().enabled === false) {
                disable();
            }
            else {
                init();
                updateSize();
                setTranslate();
            }
        });
        on('update resize observerUpdate lock unlock changeDirection', () => {
            updateSize();
        });
        on('setTranslate', () => {
            setTranslate();
        });
        on('setTransition', (_s, duration) => {
            setTransition(duration);
        });
        on('enable disable', () => {
            const { el } = swiper.scrollbar;
            if (el) {
                el.classList[swiper.enabled ? 'remove' : 'add'](...classesToTokens(getParams().lockClass));
            }
        });
        on('destroy', () => {
            destroy();
        });
        const enable = () => {
            const params = getParams();
            swiper.el.classList.remove(...classesToTokens(params.scrollbarDisabledClass));
            if (swiper.scrollbar.el) {
                swiper.scrollbar.el.classList.remove(...classesToTokens(params.scrollbarDisabledClass));
            }
            init();
            updateSize();
            setTranslate();
        };
        const disable = () => {
            const params = getParams();
            swiper.el.classList.add(...classesToTokens(params.scrollbarDisabledClass));
            if (swiper.scrollbar.el) {
                swiper.scrollbar.el.classList.add(...classesToTokens(params.scrollbarDisabledClass));
            }
            destroy();
        };
        Object.assign(swiper.scrollbar, {
            enable,
            disable,
            updateSize,
            setTranslate,
            init,
            destroy,
        });
    };

    const Parallax = ({ swiper, extendParams, on }) => {
        extendParams({
            parallax: {
                enabled: false,
            },
        });
        function getParams() {
            return swiper.params.parallax;
        }
        const elementsSelector = '[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]';
        const setTransform = (el, progress) => {
            const { rtl } = swiper;
            const rtlFactor = rtl ? -1 : 1;
            const p = el.getAttribute('data-swiper-parallax') || '0';
            let x = el.getAttribute('data-swiper-parallax-x');
            let y = el.getAttribute('data-swiper-parallax-y');
            const scale = el.getAttribute('data-swiper-parallax-scale');
            const opacity = el.getAttribute('data-swiper-parallax-opacity');
            const rotate = el.getAttribute('data-swiper-parallax-rotate');
            if (x || y) {
                x = x || '0';
                y = y || '0';
            }
            else if (swiper.isHorizontal()) {
                x = p;
                y = '0';
            }
            else {
                y = p;
                x = '0';
            }
            if (x.indexOf('%') >= 0) {
                x = `${parseInt(x, 10) * progress * rtlFactor}%`;
            }
            else {
                x = `${Number(x) * progress * rtlFactor}px`;
            }
            if (y.indexOf('%') >= 0) {
                y = `${parseInt(y, 10) * progress}%`;
            }
            else {
                y = `${Number(y) * progress}px`;
            }
            if (typeof opacity !== 'undefined' && opacity !== null) {
                const opacityNum = Number(opacity);
                const currentOpacity = opacityNum - (opacityNum - 1) * (1 - Math.abs(progress));
                el.style.opacity = String(currentOpacity);
            }
            let transform = `translate3d(${x}, ${y}, 0px)`;
            if (typeof scale !== 'undefined' && scale !== null) {
                const scaleNum = Number(scale);
                const currentScale = scaleNum - (scaleNum - 1) * (1 - Math.abs(progress));
                transform += ` scale(${currentScale})`;
            }
            if (rotate && typeof rotate !== 'undefined' && rotate !== null) {
                const currentRotate = Number(rotate) * progress * -1;
                transform += ` rotate(${currentRotate}deg)`;
            }
            el.style.transform = transform;
        };
        const setTranslate = () => {
            const { el, slides, progress, snapGrid } = swiper;
            const elements = elementChildren(el, elementsSelector);
            if (swiper.isElement) {
                elements.push(...elementChildren(swiper.hostEl, elementsSelector));
            }
            elements.forEach((subEl) => {
                setTransform(subEl, progress);
            });
            slides.forEach((slideEl, slideIndex) => {
                let slideProgress = slideEl.progress ?? 0;
                const slidesPerGroup = swiper.params.slidesPerGroup ?? 1;
                if (slidesPerGroup > 1 && swiper.params.slidesPerView !== 'auto') {
                    slideProgress += Math.ceil(slideIndex / 2) - progress * (snapGrid.length - 1);
                }
                slideProgress = Math.min(Math.max(slideProgress, -1), 1);
                slideEl
                    .querySelectorAll(`${elementsSelector}, [data-swiper-parallax-rotate]`)
                    .forEach((subEl) => {
                    setTransform(subEl, slideProgress);
                });
            });
        };
        const setTransition = (duration = swiper.params.speed ?? 300) => {
            const { el, hostEl } = swiper;
            const elements = [...el.querySelectorAll(elementsSelector)];
            if (swiper.isElement) {
                elements.push(...hostEl.querySelectorAll(elementsSelector));
            }
            elements.forEach((parallaxEl) => {
                const attr = parallaxEl.getAttribute('data-swiper-parallax-duration');
                let parallaxDuration = (attr ? parseInt(attr, 10) : 0) || duration;
                if (duration === 0)
                    parallaxDuration = 0;
                parallaxEl.style.transitionDuration = `${parallaxDuration}ms`;
            });
        };
        on('beforeInit', () => {
            if (!getParams().enabled)
                return;
            swiper.params.watchSlidesProgress = true;
            swiper.originalParams.watchSlidesProgress = true;
        });
        on('init', () => {
            if (!getParams().enabled)
                return;
            setTranslate();
        });
        on('setTranslate', () => {
            if (!getParams().enabled)
                return;
            setTranslate();
        });
        on('setTransition', (_swiper, duration) => {
            if (!getParams().enabled)
                return;
            setTransition(duration);
        });
    };

    const Zoom = ({ swiper, extendParams, on, emit }) => {
        extendParams({
            zoom: {
                enabled: false,
                limitToOriginalSize: false,
                maxRatio: 3,
                minRatio: 1,
                panOnMouseMove: false,
                toggle: true,
                containerClass: 'swiper-zoom-container',
                zoomedSlideClass: 'swiper-slide-zoomed',
            },
        });
        swiper.zoom = {
            enabled: false,
        };
        function getParams() {
            return swiper.params.zoom;
        }
        let currentScale = 1;
        let isScaling = false;
        let isPanningWithMouse = false;
        let mousePanStart = { x: 0, y: 0 };
        const mousePanSensitivity = -3; // Negative to invert pan direction
        let fakeGestureTouched = false;
        let fakeGestureMoved = false;
        const evCache = [];
        const gesture = {
            originX: 0,
            originY: 0,
            slideEl: undefined,
            slideWidth: undefined,
            slideHeight: undefined,
            imageEl: undefined,
            imageWrapEl: undefined,
            maxRatio: 3,
        };
        const image = {
            isTouched: undefined,
            isMoved: undefined,
            currentX: undefined,
            currentY: undefined,
            minX: undefined,
            minY: undefined,
            maxX: undefined,
            maxY: undefined,
            width: undefined,
            height: undefined,
            startX: undefined,
            startY: undefined,
            touchesStart: {},
            touchesCurrent: {},
        };
        const velocity = {
            x: undefined,
            y: undefined,
            prevPositionX: undefined,
            prevPositionY: undefined,
            prevTime: undefined,
        };
        let scale = 1;
        Object.defineProperty(swiper.zoom, 'scale', {
            get() {
                return scale;
            },
            set(value) {
                if (scale !== value) {
                    const imageEl = gesture.imageEl;
                    const slideEl = gesture.slideEl;
                    emit('zoomChange', value, imageEl, slideEl);
                }
                scale = value;
            },
        });
        function getDistanceBetweenTouches() {
            if (evCache.length < 2)
                return 1;
            const x1 = evCache[0].pageX;
            const y1 = evCache[0].pageY;
            const x2 = evCache[1].pageX;
            const y2 = evCache[1].pageY;
            const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            return distance;
        }
        function getMaxRatio() {
            const params = getParams();
            const attr = gesture.imageWrapEl?.getAttribute('data-swiper-zoom');
            const maxRatio = attr != null ? Number(attr) : params.maxRatio;
            const imageEl = gesture.imageEl;
            if (params.limitToOriginalSize && imageEl && imageEl.naturalWidth) {
                const imageMaxRatio = imageEl.naturalWidth / imageEl.offsetWidth;
                return Math.min(imageMaxRatio, maxRatio);
            }
            return maxRatio;
        }
        function getScaleOrigin() {
            if (evCache.length < 2 || !gesture.imageEl)
                return [null, null];
            const box = gesture.imageEl.getBoundingClientRect();
            return [
                (evCache[0].pageX + (evCache[1].pageX - evCache[0].pageX) / 2 - box.x - window.scrollX) /
                    currentScale,
                (evCache[0].pageY + (evCache[1].pageY - evCache[0].pageY) / 2 - box.y - window.scrollY) /
                    currentScale,
            ];
        }
        function getSlideSelector() {
            return swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
        }
        function eventWithinSlide(e) {
            const slideSelector = getSlideSelector();
            const target = e.target;
            if (!target)
                return false;
            if (target.matches(slideSelector))
                return true;
            if (swiper.slides.filter((slideEl) => slideEl.contains(target)).length > 0)
                return true;
            return false;
        }
        function eventWithinZoomContainer(e) {
            const selector = `.${getParams().containerClass}`;
            const target = e.target;
            if (!target)
                return false;
            if (target.matches(selector))
                return true;
            if ([...swiper.hostEl.querySelectorAll(selector)].filter((containerEl) => containerEl.contains(target)).length > 0)
                return true;
            return false;
        }
        // Events
        function onGestureStart(e) {
            if (e.pointerType === 'mouse') {
                evCache.splice(0, evCache.length);
            }
            if (!eventWithinSlide(e))
                return;
            const params = getParams();
            fakeGestureTouched = false;
            fakeGestureMoved = false;
            evCache.push(e);
            if (evCache.length < 2) {
                return;
            }
            fakeGestureTouched = true;
            gesture.scaleStart = getDistanceBetweenTouches();
            if (!gesture.slideEl) {
                const target = e.target;
                gesture.slideEl =
                    target?.closest(`.${swiper.params.slideClass}, swiper-slide`) ??
                        undefined;
                if (!gesture.slideEl)
                    gesture.slideEl = swiper.slides[swiper.activeIndex];
                let imageEl = gesture.slideEl?.querySelector(`.${params.containerClass}`) ?? null;
                if (imageEl) {
                    imageEl =
                        imageEl.querySelectorAll('picture, img, svg, canvas, .swiper-zoom-target')[0] ?? null;
                }
                gesture.imageEl = imageEl ?? undefined;
                if (imageEl) {
                    gesture.imageWrapEl =
                        elementParents(imageEl, `.${params.containerClass}`)[0] ??
                            undefined;
                }
                else {
                    gesture.imageWrapEl = undefined;
                }
                if (!gesture.imageWrapEl) {
                    gesture.imageEl = undefined;
                    return;
                }
                gesture.maxRatio = getMaxRatio();
            }
            if (gesture.imageEl) {
                const [originX, originY] = getScaleOrigin();
                gesture.originX = originX ?? 0;
                gesture.originY = originY ?? 0;
                gesture.imageEl.style.transitionDuration = '0ms';
            }
            isScaling = true;
        }
        function onGestureChange(e) {
            if (!eventWithinSlide(e))
                return;
            const params = getParams();
            const zoom = swiper.zoom;
            const pointerIndex = evCache.findIndex((cachedEv) => cachedEv.pointerId === e.pointerId);
            if (pointerIndex >= 0)
                evCache[pointerIndex] = e;
            if (evCache.length < 2) {
                return;
            }
            fakeGestureMoved = true;
            gesture.scaleMove = getDistanceBetweenTouches();
            if (!gesture.imageEl) {
                return;
            }
            zoom.scale = (gesture.scaleMove / (gesture.scaleStart ?? 1)) * currentScale;
            if (zoom.scale > gesture.maxRatio) {
                zoom.scale = gesture.maxRatio - 1 + (zoom.scale - gesture.maxRatio + 1) ** 0.5;
            }
            if (zoom.scale < params.minRatio) {
                zoom.scale = params.minRatio + 1 - (params.minRatio - zoom.scale + 1) ** 0.5;
            }
            gesture.imageEl.style.transform = `translate3d(0,0,0) scale(${zoom.scale})`;
        }
        function onGestureEnd(e) {
            if (!eventWithinSlide(e))
                return;
            if (e.pointerType === 'mouse' && e.type === 'pointerout')
                return;
            const params = getParams();
            const zoom = swiper.zoom;
            const pointerIndex = evCache.findIndex((cachedEv) => cachedEv.pointerId === e.pointerId);
            if (pointerIndex >= 0)
                evCache.splice(pointerIndex, 1);
            if (!fakeGestureTouched || !fakeGestureMoved) {
                return;
            }
            fakeGestureTouched = false;
            fakeGestureMoved = false;
            if (!gesture.imageEl)
                return;
            zoom.scale = Math.max(Math.min(zoom.scale, gesture.maxRatio), params.minRatio);
            gesture.imageEl.style.transitionDuration = `${swiper.params.speed}ms`;
            gesture.imageEl.style.transform = `translate3d(0,0,0) scale(${zoom.scale})`;
            currentScale = zoom.scale;
            isScaling = false;
            if (zoom.scale > 1 && gesture.slideEl) {
                gesture.slideEl.classList.add(`${params.zoomedSlideClass}`);
            }
            else if (zoom.scale <= 1 && gesture.slideEl) {
                gesture.slideEl.classList.remove(`${params.zoomedSlideClass}`);
            }
            if (zoom.scale === 1) {
                gesture.originX = 0;
                gesture.originY = 0;
                gesture.slideEl = undefined;
            }
        }
        let allowTouchMoveTimeout;
        function allowTouchMove() {
            swiper.touchEventsData.preventTouchMoveFromPointerMove = false;
        }
        function preventTouchMove() {
            if (allowTouchMoveTimeout !== undefined)
                clearTimeout(allowTouchMoveTimeout);
            swiper.touchEventsData.preventTouchMoveFromPointerMove = true;
            allowTouchMoveTimeout = setTimeout(() => {
                if (swiper.destroyed)
                    return;
                allowTouchMove();
            });
        }
        function onTouchStart(e) {
            const device = swiper.device;
            if (!gesture.imageEl)
                return;
            if (image.isTouched)
                return;
            if (device.android && e.cancelable)
                e.preventDefault();
            image.isTouched = true;
            const event = evCache.length > 0 ? evCache[0] : e;
            image.touchesStart.x = event.pageX;
            image.touchesStart.y = event.pageY;
        }
        function onTouchMove(e) {
            const isMouseEvent = e.pointerType === 'mouse';
            const isMousePan = isMouseEvent && getParams().panOnMouseMove;
            if (!eventWithinSlide(e) || !eventWithinZoomContainer(e)) {
                return;
            }
            const zoom = swiper.zoom;
            if (!gesture.imageEl) {
                return;
            }
            if (!image.isTouched || !gesture.slideEl) {
                if (isMousePan)
                    onMouseMove(e);
                return;
            }
            if (isMousePan) {
                onMouseMove(e);
                return;
            }
            if (!image.isMoved) {
                image.width = gesture.imageEl.offsetWidth || gesture.imageEl.clientWidth;
                image.height = gesture.imageEl.offsetHeight || gesture.imageEl.clientHeight;
                image.startX = getTranslate(gesture.imageWrapEl, 'x') || 0;
                image.startY = getTranslate(gesture.imageWrapEl, 'y') || 0;
                gesture.slideWidth = gesture.slideEl.offsetWidth;
                gesture.slideHeight = gesture.slideEl.offsetHeight;
                gesture.imageWrapEl.style.transitionDuration = '0ms';
            }
            // Define if we need image drag
            const scaledWidth = image.width * zoom.scale;
            const scaledHeight = image.height * zoom.scale;
            image.minX = Math.min(gesture.slideWidth / 2 - scaledWidth / 2, 0);
            image.maxX = -image.minX;
            image.minY = Math.min(gesture.slideHeight / 2 - scaledHeight / 2, 0);
            image.maxY = -image.minY;
            image.touchesCurrent.x = evCache.length > 0 ? evCache[0].pageX : e.pageX;
            image.touchesCurrent.y = evCache.length > 0 ? evCache[0].pageY : e.pageY;
            const touchesDiff = Math.max(Math.abs(image.touchesCurrent.x - (image.touchesStart.x ?? 0)), Math.abs(image.touchesCurrent.y - (image.touchesStart.y ?? 0)));
            if (touchesDiff > 5) {
                swiper.allowClick = false;
            }
            const startX = image.startX ?? 0;
            const startY = image.startY ?? 0;
            if (!image.isMoved && !isScaling) {
                if (swiper.isHorizontal() &&
                    ((Math.floor(image.minX) === Math.floor(startX) &&
                        image.touchesCurrent.x < (image.touchesStart.x ?? 0)) ||
                        (Math.floor(image.maxX) === Math.floor(startX) &&
                            image.touchesCurrent.x > (image.touchesStart.x ?? 0)))) {
                    image.isTouched = false;
                    allowTouchMove();
                    return;
                }
                if (!swiper.isHorizontal() &&
                    ((Math.floor(image.minY) === Math.floor(startY) &&
                        image.touchesCurrent.y < (image.touchesStart.y ?? 0)) ||
                        (Math.floor(image.maxY) === Math.floor(startY) &&
                            image.touchesCurrent.y > (image.touchesStart.y ?? 0)))) {
                    image.isTouched = false;
                    allowTouchMove();
                    return;
                }
            }
            if (e.cancelable) {
                e.preventDefault();
            }
            e.stopPropagation();
            preventTouchMove();
            image.isMoved = true;
            const scaleRatio = (zoom.scale - currentScale) / (gesture.maxRatio - getParams().minRatio);
            const { originX, originY } = gesture;
            image.currentX =
                image.touchesCurrent.x -
                    (image.touchesStart.x ?? 0) +
                    startX +
                    scaleRatio * (image.width - originX * 2);
            image.currentY =
                image.touchesCurrent.y -
                    (image.touchesStart.y ?? 0) +
                    startY +
                    scaleRatio * (image.height - originY * 2);
            if (image.currentX < image.minX) {
                image.currentX = image.minX + 1 - (image.minX - image.currentX + 1) ** 0.8;
            }
            if (image.currentX > image.maxX) {
                image.currentX = image.maxX - 1 + (image.currentX - image.maxX + 1) ** 0.8;
            }
            if (image.currentY < image.minY) {
                image.currentY = image.minY + 1 - (image.minY - image.currentY + 1) ** 0.8;
            }
            if (image.currentY > image.maxY) {
                image.currentY = image.maxY - 1 + (image.currentY - image.maxY + 1) ** 0.8;
            }
            // Velocity
            if (!velocity.prevPositionX)
                velocity.prevPositionX = image.touchesCurrent.x;
            if (!velocity.prevPositionY)
                velocity.prevPositionY = image.touchesCurrent.y;
            if (!velocity.prevTime)
                velocity.prevTime = Date.now();
            velocity.x =
                (image.touchesCurrent.x - velocity.prevPositionX) / (Date.now() - velocity.prevTime) / 2;
            velocity.y =
                (image.touchesCurrent.y - velocity.prevPositionY) / (Date.now() - velocity.prevTime) / 2;
            if (Math.abs(image.touchesCurrent.x - velocity.prevPositionX) < 2)
                velocity.x = 0;
            if (Math.abs(image.touchesCurrent.y - velocity.prevPositionY) < 2)
                velocity.y = 0;
            velocity.prevPositionX = image.touchesCurrent.x;
            velocity.prevPositionY = image.touchesCurrent.y;
            velocity.prevTime = Date.now();
            gesture.imageWrapEl.style.transform = `translate3d(${image.currentX}px, ${image.currentY}px,0)`;
        }
        function onTouchEnd() {
            const zoom = swiper.zoom;
            evCache.length = 0;
            if (!gesture.imageEl)
                return;
            if (!image.isTouched || !image.isMoved) {
                image.isTouched = false;
                image.isMoved = false;
                return;
            }
            image.isTouched = false;
            image.isMoved = false;
            let momentumDurationX = 300;
            let momentumDurationY = 300;
            const velocityX = velocity.x ?? 0;
            const velocityY = velocity.y ?? 0;
            const momentumDistanceX = velocityX * momentumDurationX;
            const newPositionX = image.currentX + momentumDistanceX;
            const momentumDistanceY = velocityY * momentumDurationY;
            const newPositionY = image.currentY + momentumDistanceY;
            // Fix duration
            if (velocityX !== 0)
                momentumDurationX = Math.abs((newPositionX - image.currentX) / velocityX);
            if (velocityY !== 0)
                momentumDurationY = Math.abs((newPositionY - image.currentY) / velocityY);
            const momentumDuration = Math.max(momentumDurationX, momentumDurationY);
            image.currentX = newPositionX;
            image.currentY = newPositionY;
            // Define if we need image drag
            const scaledWidth = image.width * zoom.scale;
            const scaledHeight = image.height * zoom.scale;
            image.minX = Math.min(gesture.slideWidth / 2 - scaledWidth / 2, 0);
            image.maxX = -image.minX;
            image.minY = Math.min(gesture.slideHeight / 2 - scaledHeight / 2, 0);
            image.maxY = -image.minY;
            image.currentX = Math.max(Math.min(image.currentX, image.maxX), image.minX);
            image.currentY = Math.max(Math.min(image.currentY, image.maxY), image.minY);
            gesture.imageWrapEl.style.transitionDuration = `${momentumDuration}ms`;
            gesture.imageWrapEl.style.transform = `translate3d(${image.currentX}px, ${image.currentY}px,0)`;
        }
        function onTransitionEnd() {
            const zoom = swiper.zoom;
            if (gesture.slideEl && swiper.activeIndex !== swiper.slides.indexOf(gesture.slideEl)) {
                if (gesture.imageEl) {
                    gesture.imageEl.style.transform = 'translate3d(0,0,0) scale(1)';
                }
                if (gesture.imageWrapEl) {
                    gesture.imageWrapEl.style.transform = 'translate3d(0,0,0)';
                }
                gesture.slideEl.classList.remove(`${getParams().zoomedSlideClass}`);
                zoom.scale = 1;
                currentScale = 1;
                gesture.slideEl = undefined;
                gesture.imageEl = undefined;
                gesture.imageWrapEl = undefined;
                gesture.originX = 0;
                gesture.originY = 0;
            }
        }
        function onMouseMove(e) {
            // Only pan if zoomed in and mouse panning is enabled
            if (currentScale <= 1 || !gesture.imageWrapEl)
                return;
            if (!eventWithinSlide(e) || !eventWithinZoomContainer(e))
                return;
            const currentTransform = window.getComputedStyle(gesture.imageWrapEl).transform;
            const matrix = new window.DOMMatrix(currentTransform);
            if (!isPanningWithMouse) {
                isPanningWithMouse = true;
                mousePanStart.x = e.clientX;
                mousePanStart.y = e.clientY;
                image.startX = matrix.e;
                image.startY = matrix.f;
                image.width = gesture.imageEl.offsetWidth || gesture.imageEl.clientWidth;
                image.height = gesture.imageEl.offsetHeight || gesture.imageEl.clientHeight;
                gesture.slideWidth = gesture.slideEl.offsetWidth;
                gesture.slideHeight = gesture.slideEl.offsetHeight;
                return;
            }
            const deltaX = (e.clientX - mousePanStart.x) * mousePanSensitivity;
            const deltaY = (e.clientY - mousePanStart.y) * mousePanSensitivity;
            const scaledWidth = image.width * currentScale;
            const scaledHeight = image.height * currentScale;
            const slideWidth = gesture.slideWidth;
            const slideHeight = gesture.slideHeight;
            const minX = Math.min(slideWidth / 2 - scaledWidth / 2, 0);
            const maxX = -minX;
            const minY = Math.min(slideHeight / 2 - scaledHeight / 2, 0);
            const maxY = -minY;
            const newX = Math.max(Math.min(image.startX + deltaX, maxX), minX);
            const newY = Math.max(Math.min(image.startY + deltaY, maxY), minY);
            gesture.imageWrapEl.style.transitionDuration = '0ms';
            gesture.imageWrapEl.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
            mousePanStart.x = e.clientX;
            mousePanStart.y = e.clientY;
            image.startX = newX;
            image.startY = newY;
            image.currentX = newX;
            image.currentY = newY;
        }
        function zoomIn(e) {
            const zoom = swiper.zoom;
            const params = getParams();
            if (!gesture.slideEl) {
                if (e && typeof e !== 'number' && 'target' in e && e.target) {
                    gesture.slideEl =
                        e.target.closest(`.${swiper.params.slideClass}, swiper-slide`) ?? undefined;
                }
                if (!gesture.slideEl) {
                    const virtual = swiper.params.virtual;
                    if (virtual && virtual.enabled && swiper.virtual) {
                        gesture.slideEl =
                            elementChildren(swiper.slidesEl, `.${swiper.params.slideActiveClass}`)[0] ?? undefined;
                    }
                    else {
                        gesture.slideEl = swiper.slides[swiper.activeIndex];
                    }
                }
                let imageEl = gesture.slideEl?.querySelector(`.${params.containerClass}`) ?? null;
                if (imageEl) {
                    imageEl =
                        imageEl.querySelectorAll('picture, img, svg, canvas, .swiper-zoom-target')[0] ?? null;
                }
                gesture.imageEl = imageEl ?? undefined;
                if (imageEl) {
                    gesture.imageWrapEl =
                        elementParents(imageEl, `.${params.containerClass}`)[0] ??
                            undefined;
                }
                else {
                    gesture.imageWrapEl = undefined;
                }
            }
            if (!gesture.imageEl || !gesture.imageWrapEl || !gesture.slideEl)
                return;
            gesture.maxRatio = getMaxRatio();
            if (swiper.params.cssMode) {
                swiper.wrapperEl.style.overflow = 'hidden';
                swiper.wrapperEl.style.touchAction = 'none';
            }
            gesture.slideEl.classList.add(`${params.zoomedSlideClass}`);
            let touchX;
            let touchY;
            let offsetX;
            let offsetY;
            let diffX;
            let diffY;
            let translateX;
            let translateY;
            let imageWidth;
            let imageHeight;
            let scaledWidth;
            let scaledHeight;
            let translateMinX;
            let translateMinY;
            let translateMaxX;
            let translateMaxY;
            let slideWidth;
            let slideHeight;
            const eventIsPointer = e && typeof e !== 'number';
            if (typeof image.touchesStart.x === 'undefined' && eventIsPointer) {
                touchX = e.pageX;
                touchY = e.pageY;
            }
            else {
                touchX = image.touchesStart.x;
                touchY = image.touchesStart.y;
            }
            const prevScale = currentScale;
            const forceZoomRatio = typeof e === 'number' ? e : null;
            if (currentScale === 1 && forceZoomRatio) {
                touchX = undefined;
                touchY = undefined;
                image.touchesStart.x = undefined;
                image.touchesStart.y = undefined;
            }
            const maxRatio = getMaxRatio();
            zoom.scale = forceZoomRatio || maxRatio;
            currentScale = forceZoomRatio || maxRatio;
            if (e && !(currentScale === 1 && forceZoomRatio)) {
                slideWidth = gesture.slideEl.offsetWidth;
                slideHeight = gesture.slideEl.offsetHeight;
                offsetX = elementOffset(gesture.slideEl).left + window.scrollX;
                offsetY = elementOffset(gesture.slideEl).top + window.scrollY;
                diffX = offsetX + slideWidth / 2 - (touchX ?? 0);
                diffY = offsetY + slideHeight / 2 - (touchY ?? 0);
                imageWidth = gesture.imageEl.offsetWidth || gesture.imageEl.clientWidth;
                imageHeight = gesture.imageEl.offsetHeight || gesture.imageEl.clientHeight;
                scaledWidth = imageWidth * zoom.scale;
                scaledHeight = imageHeight * zoom.scale;
                translateMinX = Math.min(slideWidth / 2 - scaledWidth / 2, 0);
                translateMinY = Math.min(slideHeight / 2 - scaledHeight / 2, 0);
                translateMaxX = -translateMinX;
                translateMaxY = -translateMinY;
                if (prevScale > 0 &&
                    forceZoomRatio &&
                    typeof image.currentX === 'number' &&
                    typeof image.currentY === 'number') {
                    translateX = (image.currentX * zoom.scale) / prevScale;
                    translateY = (image.currentY * zoom.scale) / prevScale;
                }
                else {
                    translateX = diffX * zoom.scale;
                    translateY = diffY * zoom.scale;
                }
                if (translateX < translateMinX) {
                    translateX = translateMinX;
                }
                if (translateX > translateMaxX) {
                    translateX = translateMaxX;
                }
                if (translateY < translateMinY) {
                    translateY = translateMinY;
                }
                if (translateY > translateMaxY) {
                    translateY = translateMaxY;
                }
            }
            else {
                translateX = 0;
                translateY = 0;
            }
            if (forceZoomRatio && zoom.scale === 1) {
                gesture.originX = 0;
                gesture.originY = 0;
            }
            image.currentX = translateX;
            image.currentY = translateY;
            gesture.imageWrapEl.style.transitionDuration = '300ms';
            gesture.imageWrapEl.style.transform = `translate3d(${translateX}px, ${translateY}px,0)`;
            gesture.imageEl.style.transitionDuration = '300ms';
            gesture.imageEl.style.transform = `translate3d(0,0,0) scale(${zoom.scale})`;
        }
        function zoomOut() {
            const zoom = swiper.zoom;
            const params = getParams();
            if (!gesture.slideEl) {
                const virtual = swiper.params.virtual;
                if (virtual && virtual.enabled && swiper.virtual) {
                    gesture.slideEl =
                        elementChildren(swiper.slidesEl, `.${swiper.params.slideActiveClass}`)[0] ?? undefined;
                }
                else {
                    gesture.slideEl = swiper.slides[swiper.activeIndex];
                }
                let imageEl = gesture.slideEl?.querySelector(`.${params.containerClass}`) ?? null;
                if (imageEl) {
                    imageEl =
                        imageEl.querySelectorAll('picture, img, svg, canvas, .swiper-zoom-target')[0] ?? null;
                }
                gesture.imageEl = imageEl ?? undefined;
                if (imageEl) {
                    gesture.imageWrapEl =
                        elementParents(imageEl, `.${params.containerClass}`)[0] ??
                            undefined;
                }
                else {
                    gesture.imageWrapEl = undefined;
                }
            }
            if (!gesture.imageEl || !gesture.imageWrapEl || !gesture.slideEl)
                return;
            gesture.maxRatio = getMaxRatio();
            if (swiper.params.cssMode) {
                swiper.wrapperEl.style.overflow = '';
                swiper.wrapperEl.style.touchAction = '';
            }
            zoom.scale = 1;
            currentScale = 1;
            image.currentX = undefined;
            image.currentY = undefined;
            image.touchesStart.x = undefined;
            image.touchesStart.y = undefined;
            gesture.imageWrapEl.style.transitionDuration = '300ms';
            gesture.imageWrapEl.style.transform = 'translate3d(0,0,0)';
            gesture.imageEl.style.transitionDuration = '300ms';
            gesture.imageEl.style.transform = 'translate3d(0,0,0) scale(1)';
            gesture.slideEl.classList.remove(`${params.zoomedSlideClass}`);
            gesture.slideEl = undefined;
            gesture.originX = 0;
            gesture.originY = 0;
            if (params.panOnMouseMove) {
                mousePanStart = { x: 0, y: 0 };
                if (isPanningWithMouse) {
                    isPanningWithMouse = false;
                    image.startX = 0;
                    image.startY = 0;
                }
            }
        }
        // Toggle Zoom
        function zoomToggle(e) {
            const zoom = swiper.zoom;
            if (zoom.scale && zoom.scale !== 1) {
                // Zoom Out
                zoomOut();
            }
            else {
                // Zoom In
                zoomIn(e);
            }
        }
        function getListeners() {
            const passiveListener = swiper.params.passiveListeners
                ? { passive: true, capture: false }
                : false;
            const activeListenerWithCapture = swiper.params.passiveListeners
                ? { passive: false, capture: true }
                : true;
            return { passiveListener, activeListenerWithCapture };
        }
        // Attach/Detach Events
        function enable() {
            const zoom = swiper.zoom;
            if (zoom.enabled)
                return;
            zoom.enabled = true;
            const { passiveListener, activeListenerWithCapture } = getListeners();
            // Scale image
            swiper.wrapperEl.addEventListener('pointerdown', onGestureStart, passiveListener);
            swiper.wrapperEl.addEventListener('pointermove', onGestureChange, activeListenerWithCapture);
            ['pointerup', 'pointercancel', 'pointerout'].forEach((eventName) => {
                swiper.wrapperEl.addEventListener(eventName, onGestureEnd, passiveListener);
            });
            // Move image
            swiper.wrapperEl.addEventListener('pointermove', onTouchMove, activeListenerWithCapture);
        }
        function disable() {
            const zoom = swiper.zoom;
            if (!zoom.enabled)
                return;
            zoom.enabled = false;
            const { passiveListener, activeListenerWithCapture } = getListeners();
            // Scale image
            swiper.wrapperEl.removeEventListener('pointerdown', onGestureStart, passiveListener);
            swiper.wrapperEl.removeEventListener('pointermove', onGestureChange, activeListenerWithCapture);
            ['pointerup', 'pointercancel', 'pointerout'].forEach((eventName) => {
                swiper.wrapperEl.removeEventListener(eventName, onGestureEnd, passiveListener);
            });
            // Move image
            swiper.wrapperEl.removeEventListener('pointermove', onTouchMove, activeListenerWithCapture);
        }
        on('init', () => {
            if (getParams().enabled) {
                enable();
            }
        });
        on('destroy', () => {
            disable();
        });
        on('touchStart', (_s, e) => {
            if (!swiper.zoom.enabled)
                return;
            onTouchStart(e);
        });
        on('touchEnd', () => {
            if (!swiper.zoom.enabled)
                return;
            onTouchEnd();
        });
        on('doubleTap', (_s, e) => {
            if (!swiper.animating && getParams().enabled && swiper.zoom.enabled && getParams().toggle) {
                zoomToggle(e);
            }
        });
        on('transitionEnd', () => {
            if (swiper.zoom.enabled && getParams().enabled) {
                onTransitionEnd();
            }
        });
        on('slideChange', () => {
            if (swiper.zoom.enabled && getParams().enabled && swiper.params.cssMode) {
                onTransitionEnd();
            }
        });
        Object.assign(swiper.zoom, {
            enable,
            disable,
            in: zoomIn,
            out: zoomOut,
            toggle: zoomToggle,
        });
    };

    class LinearSpline {
        x;
        y;
        lastIndex;
        binarySearch;
        constructor(x, y) {
            let maxIndex;
            let minIndex;
            let guess;
            this.binarySearch = (array, val) => {
                minIndex = -1;
                maxIndex = array.length;
                while (maxIndex - minIndex > 1) {
                    guess = (maxIndex + minIndex) >> 1;
                    if (array[guess] <= val) {
                        minIndex = guess;
                    }
                    else {
                        maxIndex = guess;
                    }
                }
                return maxIndex;
            };
            this.x = x;
            this.y = y;
            this.lastIndex = x.length - 1;
        }
        interpolate(x2) {
            if (!x2)
                return 0;
            const i3 = this.binarySearch(this.x, x2);
            const i1 = i3 - 1;
            // Given an x value (x2), return the expected y2 value:
            // (x1,y1) is the known point before given value,
            // (x3,y3) is the known point after given value.
            // y2 := ((x2−x1) × (y3−y1)) ÷ (x3−x1) + y1
            return (((x2 - this.x[i1]) * (this.y[i3] - this.y[i1])) / (this.x[i3] - this.x[i1]) + this.y[i1]);
        }
    }
    const Controller = ({ swiper, extendParams, on }) => {
        extendParams({
            controller: {
                control: undefined,
                inverse: false,
                by: 'slide', // or 'container'
            },
        });
        swiper.controller = {
            control: undefined,
        };
        function getParams() {
            return swiper.params.controller;
        }
        function getInterpolateFunction(c) {
            swiper.controller.spline = swiper.params.loop
                ? new LinearSpline(swiper.slidesGrid, c.slidesGrid)
                : new LinearSpline(swiper.snapGrid, c.snapGrid);
        }
        function setTranslate(_t, byController) {
            const controlled = swiper.controller.control;
            let multiplier;
            let controlledTranslate;
            const SwiperCtor = swiper.constructor;
            function setControlledTranslate(c) {
                if (c.destroyed)
                    return;
                // this will create an Interpolate function based on the snapGrids
                // x is the Grid of the scrolled scroller and y will be the controlled scroller
                // it makes sense to create this only once and recall it for the interpolation
                // the function does a lot of value caching for performance
                const translate = swiper.rtlTranslate ? -swiper.translate : swiper.translate;
                const controllerParams = getParams();
                if (controllerParams.by === 'slide') {
                    getInterpolateFunction(c);
                    // i am not sure why the values have to be multiplicated this way, tried to invert the snapGrid
                    // but it did not work out
                    controlledTranslate = -swiper.controller.spline.interpolate(-translate);
                }
                else {
                    controlledTranslate = 0;
                }
                if (!controlledTranslate || controllerParams.by === 'container') {
                    multiplier =
                        (c.maxTranslate() - c.minTranslate()) / (swiper.maxTranslate() - swiper.minTranslate());
                    if (Number.isNaN(multiplier) || !Number.isFinite(multiplier)) {
                        multiplier = 1;
                    }
                    controlledTranslate = (translate - swiper.minTranslate()) * multiplier + c.minTranslate();
                }
                if (controllerParams.inverse) {
                    controlledTranslate = c.maxTranslate() - controlledTranslate;
                }
                c.updateProgress(controlledTranslate);
                c.setTranslate(controlledTranslate, swiper);
                c.updateActiveIndex();
                c.updateSlidesClasses();
            }
            if (Array.isArray(controlled)) {
                for (let i = 0; i < controlled.length; i += 1) {
                    const target = controlled[i];
                    if (target && target !== byController && target instanceof SwiperCtor) {
                        setControlledTranslate(target);
                    }
                }
            }
            else if (controlled instanceof SwiperCtor && byController !== controlled) {
                setControlledTranslate(controlled);
            }
        }
        function setTransition(duration, byController) {
            const SwiperCtor = swiper.constructor;
            const controlled = swiper.controller.control;
            function setControlledTransition(c) {
                if (c.destroyed)
                    return;
                c.setTransition(duration, swiper);
                if (duration !== 0) {
                    c.transitionStart();
                    if (c.params.autoHeight) {
                        nextTick(() => {
                            c.updateAutoHeight();
                        });
                    }
                    elementTransitionEnd(c.wrapperEl, () => {
                        if (!controlled)
                            return;
                        c.transitionEnd();
                    });
                }
            }
            if (Array.isArray(controlled)) {
                for (let i = 0; i < controlled.length; i += 1) {
                    const target = controlled[i];
                    if (target && target !== byController && target instanceof SwiperCtor) {
                        setControlledTransition(target);
                    }
                }
            }
            else if (controlled instanceof SwiperCtor && byController !== controlled) {
                setControlledTransition(controlled);
            }
        }
        function removeSpline() {
            if (!swiper.controller.control)
                return;
            if (swiper.controller.spline) {
                swiper.controller.spline = undefined;
                delete swiper.controller.spline;
            }
        }
        on('beforeInit', () => {
            const controllerParam = getParams().control;
            if (typeof window !== 'undefined' &&
                (typeof controllerParam === 'string' || controllerParam instanceof HTMLElement)) {
                const controlElements = typeof controllerParam === 'string'
                    ? [...document.querySelectorAll(controllerParam)]
                    : [controllerParam];
                controlElements.forEach((controlElement) => {
                    if (!swiper.controller.control)
                        swiper.controller.control = [];
                    const list = swiper.controller.control;
                    if (controlElement && controlElement.swiper) {
                        list.push(controlElement.swiper);
                    }
                    else if (controlElement) {
                        const eventName = `${swiper.params.eventsPrefix}init`;
                        const onControllerSwiper = (e) => {
                            const detail = e.detail;
                            if (detail && detail[0])
                                list.push(detail[0]);
                            swiper.update();
                            controlElement.removeEventListener(eventName, onControllerSwiper);
                        };
                        controlElement.addEventListener(eventName, onControllerSwiper);
                    }
                });
                return;
            }
            // After this point control is either Swiper or Swiper[] (or null/undefined),
            // never the string/HTMLElement forms that the public option accepts.
            swiper.controller.control = controllerParam;
        });
        on('update', () => {
            removeSpline();
        });
        on('resize', () => {
            removeSpline();
        });
        on('observerUpdate', () => {
            removeSpline();
        });
        // Event payloads come typed against the legacy public Swiper class
        // (src/types/swiper-class.d.ts) until Phase 5 deletes src/types/; cast the
        // forwarded byController back to the core Swiper so it lines up with the
        // controller-internal signatures.
        on('setTranslate', (_s, translate, byController) => {
            if (!swiper.controller.control)
                return;
            if (!Array.isArray(swiper.controller.control) && swiper.controller.control.destroyed)
                return;
            swiper.controller.setTranslate(translate, byController);
        });
        on('setTransition', (_s, duration, byController) => {
            if (!swiper.controller.control)
                return;
            if (!Array.isArray(swiper.controller.control) && swiper.controller.control.destroyed)
                return;
            swiper.controller.setTransition(duration, byController);
        });
        Object.assign(swiper.controller, {
            setTranslate,
            setTransition,
        });
    };

    const isVirtualEnabled$1 = (swiper) => !!swiper.virtual && !!swiper.params.virtual?.enabled;
    const A11y = ({ swiper, extendParams, on }) => {
        extendParams({
            a11y: {
                enabled: true,
                notificationClass: 'swiper-notification',
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
                firstSlideMessage: 'This is the first slide',
                lastSlideMessage: 'This is the last slide',
                paginationBulletMessage: 'Go to slide {{index}}',
                slideLabelMessage: '{{index}} / {{slidesLength}}',
                containerMessage: null,
                containerRoleDescriptionMessage: null,
                containerRole: null,
                itemRoleDescriptionMessage: null,
                slideRole: 'group',
                id: null,
                scrollOnFocus: true,
                wrapperLiveRegion: true,
            },
        });
        swiper.a11y = {
            clicked: false,
        };
        let liveRegion = null;
        let preventFocusHandler = false;
        let focusTargetSlideEl;
        let visibilityChangedTimestamp = new Date().getTime();
        function getParams() {
            return swiper.params.a11y;
        }
        function notify(message) {
            const notification = liveRegion;
            if (!notification || !message)
                return;
            setInnerHTML(notification, message);
        }
        function getRandomNumber(size = 16) {
            const randomChar = () => Math.round(16 * Math.random()).toString(16);
            return 'x'.repeat(size).replace(/x/g, randomChar);
        }
        function makeElFocusable(el) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('tabIndex', '0');
            });
        }
        function makeElNotFocusable(el) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('tabIndex', '-1');
            });
        }
        function addElRole(el, role) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('role', role);
            });
        }
        function addElRoleDescription(el, description) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('aria-roledescription', description);
            });
        }
        function addElLabel(el, label) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('aria-label', label);
            });
        }
        function addElId(el, id) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('id', id);
            });
        }
        function addElLive(el, live) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('aria-live', live);
            });
        }
        function disableEl(el) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.setAttribute('aria-disabled', 'true');
            });
        }
        function enableEl(el) {
            const els = makeElementsArray(el);
            els.forEach((subEl) => {
                subEl.removeAttribute('aria-disabled');
            });
        }
        function onEnterOrSpaceKey(e) {
            if (e.keyCode !== 13 && e.keyCode !== 32)
                return;
            const params = getParams();
            const paginationParams = swiper.params.pagination;
            const targetEl = e.target;
            if (swiper.pagination &&
                swiper.pagination.el &&
                (targetEl === swiper.pagination.el || swiper.pagination.el.contains(targetEl))) {
                if (!targetEl.matches(classesToSelector(paginationParams?.bulletClass)))
                    return;
            }
            if (swiper.navigation && swiper.navigation.prevEl && swiper.navigation.nextEl) {
                const prevEls = makeElementsArray(swiper.navigation.prevEl);
                const nextEls = makeElementsArray(swiper.navigation.nextEl);
                if (nextEls.includes(targetEl)) {
                    if (!(swiper.isEnd && !swiper.params.loop)) {
                        swiper.slideNext();
                    }
                    if (swiper.isEnd) {
                        notify(params.lastSlideMessage);
                    }
                    else {
                        notify(params.nextSlideMessage);
                    }
                }
                if (prevEls.includes(targetEl)) {
                    if (!(swiper.isBeginning && !swiper.params.loop)) {
                        swiper.slidePrev();
                    }
                    if (swiper.isBeginning) {
                        notify(params.firstSlideMessage);
                    }
                    else {
                        notify(params.prevSlideMessage);
                    }
                }
            }
            if (swiper.pagination && targetEl.matches(classesToSelector(paginationParams?.bulletClass))) {
                targetEl.click();
            }
        }
        function updateNavigation() {
            if (swiper.params.loop || swiper.params.rewind || !swiper.navigation)
                return;
            const { nextEl, prevEl } = swiper.navigation;
            if (prevEl) {
                if (swiper.isBeginning) {
                    disableEl(prevEl);
                    makeElNotFocusable(prevEl);
                }
                else {
                    enableEl(prevEl);
                    makeElFocusable(prevEl);
                }
            }
            if (nextEl) {
                if (swiper.isEnd) {
                    disableEl(nextEl);
                    makeElNotFocusable(nextEl);
                }
                else {
                    enableEl(nextEl);
                    makeElFocusable(nextEl);
                }
            }
        }
        function hasPagination() {
            return !!(swiper.pagination && swiper.pagination.bullets && swiper.pagination.bullets.length);
        }
        function hasClickablePagination() {
            const paginationParams = swiper.params.pagination;
            return hasPagination() && !!paginationParams?.clickable;
        }
        function updatePagination() {
            const params = getParams();
            if (!hasPagination())
                return;
            const paginationParams = swiper.params.pagination;
            swiper.pagination.bullets.forEach((bulletEl) => {
                if (paginationParams.clickable) {
                    makeElFocusable(bulletEl);
                    if (!paginationParams.renderBullet) {
                        addElRole(bulletEl, 'button');
                        addElLabel(bulletEl, params.paginationBulletMessage.replace(/\{\{index\}\}/, String((elementIndex(bulletEl) ?? 0) + 1)));
                    }
                }
                if (bulletEl.matches(classesToSelector(paginationParams.bulletActiveClass))) {
                    bulletEl.setAttribute('aria-current', 'true');
                }
                else {
                    bulletEl.removeAttribute('aria-current');
                }
            });
        }
        const initNavEl = (el, _wrapperId, message) => {
            makeElFocusable(el);
            if (el.tagName !== 'BUTTON') {
                addElRole(el, 'button');
                el.addEventListener('keydown', onEnterOrSpaceKey);
            }
            addElLabel(el, message);
        };
        const handlePointerDown = (e) => {
            if (focusTargetSlideEl &&
                focusTargetSlideEl !== e.target &&
                !focusTargetSlideEl.contains(e.target)) {
                preventFocusHandler = true;
            }
            swiper.a11y.clicked = true;
        };
        const handlePointerUp = () => {
            preventFocusHandler = false;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!swiper.destroyed) {
                        swiper.a11y.clicked = false;
                    }
                });
            });
        };
        const onVisibilityChange = (_e) => {
            visibilityChangedTimestamp = new Date().getTime();
        };
        const handleFocus = (e) => {
            const params = getParams();
            if (swiper.a11y.clicked || !params.scrollOnFocus)
                return;
            if (new Date().getTime() - visibilityChangedTimestamp < 100)
                return;
            const target = e.target;
            const slideEl = target.closest(`.${swiper.params.slideClass}, swiper-slide`);
            if (!slideEl || !swiper.slides.includes(slideEl))
                return;
            focusTargetSlideEl = slideEl;
            const isVirtual = isVirtualEnabled$1(swiper);
            const isActive = (isVirtual
                ? parseInt(slideEl.getAttribute('data-swiper-slide-index') || '0', 10)
                : swiper.slides.indexOf(slideEl)) === swiper.activeIndex;
            const isVisible = swiper.params.watchSlidesProgress &&
                swiper.visibleSlides &&
                swiper.visibleSlides.includes(slideEl);
            if (isActive || isVisible)
                return;
            const sourceCapabilities = e.sourceCapabilities;
            if (sourceCapabilities && sourceCapabilities.firesTouchEvents)
                return;
            if (swiper.isHorizontal()) {
                swiper.el.scrollLeft = 0;
            }
            else {
                swiper.el.scrollTop = 0;
            }
            requestAnimationFrame(() => {
                if (preventFocusHandler)
                    return;
                if (swiper.params.loop) {
                    swiper.slideToLoop(swiper.getSlideIndexWhenGrid(parseInt(slideEl.getAttribute('data-swiper-slide-index') || '0', 10)), 0);
                }
                else if (isVirtual) {
                    swiper.slideTo(swiper.getSlideIndexWhenGrid(parseInt(slideEl.getAttribute('data-swiper-slide-index') || '0', 10)), 0);
                }
                else {
                    swiper.slideTo(swiper.getSlideIndexWhenGrid(swiper.slides.indexOf(slideEl)), 0);
                }
                preventFocusHandler = false;
            });
        };
        const initSlides = () => {
            const params = getParams();
            if (params.itemRoleDescriptionMessage) {
                addElRoleDescription(swiper.slides, params.itemRoleDescriptionMessage);
            }
            if (params.slideRole) {
                addElRole(swiper.slides, params.slideRole);
            }
            const slidesLength = swiper.slides.length;
            const slideLabelMessage = params.slideLabelMessage;
            if (slideLabelMessage) {
                swiper.slides.forEach((slideEl, index) => {
                    const slideIndex = swiper.params.loop
                        ? parseInt(slideEl.getAttribute('data-swiper-slide-index') || '0', 10)
                        : index;
                    const ariaLabelMessage = slideLabelMessage
                        .replace(/\{\{index\}\}/, String(slideIndex + 1))
                        .replace(/\{\{slidesLength\}\}/, String(slidesLength));
                    addElLabel(slideEl, ariaLabelMessage);
                });
            }
        };
        const init = () => {
            const params = getParams();
            if (liveRegion)
                swiper.el.append(liveRegion);
            // Container
            const containerEl = swiper.el;
            if (params.containerRoleDescriptionMessage) {
                addElRoleDescription(containerEl, params.containerRoleDescriptionMessage);
            }
            if (params.containerMessage) {
                addElLabel(containerEl, params.containerMessage);
            }
            if (params.containerRole) {
                addElRole(containerEl, params.containerRole);
            }
            // Wrapper
            const wrapperEl = swiper.wrapperEl;
            const wrapperId = String(params.id || wrapperEl.getAttribute('id') || `swiper-wrapper-${getRandomNumber(16)}`);
            addElId(wrapperEl, wrapperId);
            if (params.wrapperLiveRegion) {
                const autoplayParams = swiper.params.autoplay;
                const live = swiper.params.autoplay && autoplayParams?.enabled ? 'off' : 'polite';
                addElLive(wrapperEl, live);
            }
            // Slide
            initSlides();
            // Navigation
            const nav = swiper.navigation
                ? swiper.navigation
                : { nextEl: undefined, prevEl: undefined };
            const nextEls = makeElementsArray(nav.nextEl);
            const prevEls = makeElementsArray(nav.prevEl);
            if (nextEls) {
                nextEls.forEach((el) => initNavEl(el, wrapperId, params.nextSlideMessage));
            }
            if (prevEls) {
                prevEls.forEach((el) => initNavEl(el, wrapperId, params.prevSlideMessage));
            }
            // Pagination
            if (hasClickablePagination()) {
                const paginationEl = makeElementsArray(swiper.pagination.el);
                paginationEl.forEach((el) => {
                    el.addEventListener('keydown', onEnterOrSpaceKey);
                });
            }
            // Tab focus
            document.addEventListener('visibilitychange', onVisibilityChange);
            swiper.el.addEventListener('focus', handleFocus, true);
            swiper.el.addEventListener('pointerdown', handlePointerDown, true);
            swiper.el.addEventListener('pointerup', handlePointerUp, true);
        };
        function destroy() {
            if (liveRegion)
                liveRegion.remove();
            const nav = swiper.navigation
                ? swiper.navigation
                : { nextEl: undefined, prevEl: undefined };
            const nextEls = makeElementsArray(nav.nextEl);
            const prevEls = makeElementsArray(nav.prevEl);
            if (nextEls) {
                nextEls.forEach((el) => el.removeEventListener('keydown', onEnterOrSpaceKey));
            }
            if (prevEls) {
                prevEls.forEach((el) => el.removeEventListener('keydown', onEnterOrSpaceKey));
            }
            // Pagination
            if (hasClickablePagination()) {
                const paginationEl = makeElementsArray(swiper.pagination.el);
                paginationEl.forEach((el) => {
                    el.removeEventListener('keydown', onEnterOrSpaceKey);
                });
            }
            document.removeEventListener('visibilitychange', onVisibilityChange);
            // Tab focus
            if (swiper.el && typeof swiper.el !== 'string') {
                swiper.el.removeEventListener('focus', handleFocus, true);
                swiper.el.removeEventListener('pointerdown', handlePointerDown, true);
                swiper.el.removeEventListener('pointerup', handlePointerUp, true);
            }
        }
        on('beforeInit', () => {
            liveRegion = createElement('span', getParams().notificationClass);
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.setAttribute('aria-atomic', 'true');
        });
        on('afterInit', () => {
            if (!getParams().enabled)
                return;
            init();
        });
        on('slidesLengthChange snapGridLengthChange slidesGridLengthChange', () => {
            if (!getParams().enabled)
                return;
            initSlides();
        });
        on('fromEdge toEdge afterInit lock unlock', () => {
            if (!getParams().enabled)
                return;
            updateNavigation();
        });
        on('paginationUpdate', () => {
            if (!getParams().enabled)
                return;
            updatePagination();
        });
        on('destroy', () => {
            if (!getParams().enabled)
                return;
            destroy();
        });
    };

    const History = ({ swiper, extendParams, on }) => {
        extendParams({
            history: {
                enabled: false,
                root: '',
                replaceState: false,
                key: 'slides',
                keepQuery: false,
            },
        });
        let initialized = false;
        let paths = { key: undefined, value: undefined };
        function getParams() {
            return swiper.params.history;
        }
        const slugify = (text) => {
            return text
                .toString()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
                .replace(/--+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        };
        const getPathValues = (urlOverride) => {
            let location;
            if (urlOverride) {
                location = new URL(urlOverride);
            }
            else {
                location = window.location;
            }
            const pathArray = location.pathname
                .slice(1)
                .split('/')
                .filter((part) => part !== '');
            const total = pathArray.length;
            const key = pathArray[total - 2];
            const value = pathArray[total - 1];
            return { key, value };
        };
        const setHistory = (key, index) => {
            const params = getParams();
            if (!initialized || !params.enabled)
                return;
            let location;
            if (swiper.params.url) {
                location = new URL(swiper.params.url);
            }
            else {
                location = window.location;
            }
            const isVirtualEnabled = !!swiper.params.virtual
                ?.enabled;
            const slide = swiper.virtual && isVirtualEnabled
                ? swiper.slidesEl.querySelector(`[data-swiper-slide-index="${index}"]`)
                : swiper.slides[index];
            if (!slide)
                return;
            let value = slugify(slide.getAttribute('data-history') || '');
            const root = params.root;
            if (root.length > 0) {
                const trimmedRoot = root[root.length - 1] === '/' ? root.slice(0, root.length - 1) : root;
                value = `${trimmedRoot}/${key ? `${key}/` : ''}${value}`;
            }
            else if (!location.pathname.includes(key || '')) {
                value = `${key ? `${key}/` : ''}${value}`;
            }
            if (params.keepQuery) {
                value += location.search;
            }
            const currentState = window.history.state;
            if (currentState && currentState.value === value) {
                return;
            }
            if (params.replaceState) {
                window.history.replaceState({ value }, '', value);
            }
            else {
                window.history.pushState({ value }, '', value);
            }
        };
        const scrollToSlide = (speed, value, runCallbacks) => {
            if (value) {
                for (let i = 0, length = swiper.slides.length; i < length; i += 1) {
                    const slide = swiper.slides[i];
                    const slideHistory = slugify(slide.getAttribute('data-history') || '');
                    if (slideHistory === value) {
                        const index = swiper.getSlideIndex(slide);
                        swiper.slideTo(index, speed, runCallbacks);
                    }
                }
            }
            else {
                swiper.slideTo(0, speed, runCallbacks);
            }
        };
        const setHistoryPopState = () => {
            paths = getPathValues(swiper.params.url);
            scrollToSlide(swiper.params.speed, paths.value, false);
        };
        const init = () => {
            const params = swiper.params.history;
            if (!params)
                return;
            if (!window.history || !window.history.pushState) {
                params.enabled = false;
                const hashParams = swiper.params.hashNavigation;
                if (hashParams)
                    hashParams.enabled = true;
                return;
            }
            initialized = true;
            paths = getPathValues(swiper.params.url);
            if (!paths.key && !paths.value) {
                if (!params.replaceState) {
                    window.addEventListener('popstate', setHistoryPopState);
                }
                return;
            }
            scrollToSlide(0, paths.value, swiper.params.runCallbacksOnInit);
            if (!params.replaceState) {
                window.addEventListener('popstate', setHistoryPopState);
            }
        };
        const destroy = () => {
            if (!getParams().replaceState) {
                window.removeEventListener('popstate', setHistoryPopState);
            }
        };
        on('init', () => {
            if (getParams().enabled) {
                init();
            }
        });
        on('destroy', () => {
            if (getParams().enabled) {
                destroy();
            }
        });
        on('transitionEnd _freeModeNoMomentumRelease', () => {
            if (initialized) {
                setHistory(getParams().key, swiper.activeIndex);
            }
        });
        on('slideChange', () => {
            if (initialized && swiper.params.cssMode) {
                setHistory(getParams().key, swiper.activeIndex);
            }
        });
    };

    const isVirtualEnabled = (swiper) => !!swiper.virtual && !!swiper.params.virtual?.enabled;
    const HashNavigation = ({ swiper, extendParams, emit, on }) => {
        let initialized = false;
        extendParams({
            hashNavigation: {
                enabled: false,
                replaceState: false,
                watchState: false,
                getSlideIndex(_s, hash) {
                    if (isVirtualEnabled(swiper)) {
                        const slideWithHash = swiper.slides.find((slideEl) => slideEl.getAttribute('data-hash') === hash);
                        if (!slideWithHash)
                            return 0;
                        const index = parseInt(slideWithHash.getAttribute('data-swiper-slide-index') || '0', 10);
                        return index;
                    }
                    const matched = elementChildren(swiper.slidesEl, `.${swiper.params.slideClass}[data-hash="${hash}"], swiper-slide[data-hash="${hash}"]`)[0];
                    return matched ? swiper.getSlideIndex(matched) : 0;
                },
            },
        });
        function getParams() {
            return swiper.params.hashNavigation;
        }
        const onHashChange = () => {
            emit('hashChange');
            const newHash = document.location.hash.replace('#', '');
            const activeSlideEl = isVirtualEnabled(swiper)
                ? swiper.slidesEl.querySelector(`[data-swiper-slide-index="${swiper.activeIndex}"]`)
                : swiper.slides[swiper.activeIndex];
            const activeSlideHash = activeSlideEl ? activeSlideEl.getAttribute('data-hash') : '';
            if (newHash !== activeSlideHash) {
                const newIndex = getParams().getSlideIndex(swiper, newHash);
                if (typeof newIndex === 'undefined' || Number.isNaN(newIndex))
                    return;
                swiper.slideTo(newIndex);
            }
        };
        const setHash = () => {
            const params = getParams();
            if (!initialized || !params.enabled)
                return;
            const activeSlideEl = isVirtualEnabled(swiper)
                ? swiper.slidesEl.querySelector(`[data-swiper-slide-index="${swiper.activeIndex}"]`)
                : swiper.slides[swiper.activeIndex];
            const activeSlideHash = activeSlideEl
                ? activeSlideEl.getAttribute('data-hash') || activeSlideEl.getAttribute('data-history')
                : '';
            if (params.replaceState && window.history && window.history.replaceState) {
                window.history.replaceState(null, '', `#${activeSlideHash}` || '');
                emit('hashSet');
            }
            else {
                document.location.hash = activeSlideHash || '';
                emit('hashSet');
            }
        };
        const init = () => {
            const params = getParams();
            const historyParams = swiper.params.history;
            if (!params.enabled || (historyParams && historyParams.enabled))
                return;
            initialized = true;
            const hash = document.location.hash.replace('#', '');
            if (hash) {
                const speed = 0;
                const index = params.getSlideIndex(swiper, hash);
                swiper.slideTo(index || 0, speed, swiper.params.runCallbacksOnInit, true);
            }
            if (params.watchState) {
                window.addEventListener('hashchange', onHashChange);
            }
        };
        const destroy = () => {
            if (getParams().watchState) {
                window.removeEventListener('hashchange', onHashChange);
            }
        };
        on('init', () => {
            if (getParams().enabled) {
                init();
            }
        });
        on('destroy', () => {
            if (getParams().enabled) {
                destroy();
            }
        });
        on('transitionEnd _freeModeNoMomentumRelease', () => {
            if (initialized) {
                setHash();
            }
        });
        on('slideChange', () => {
            if (initialized && swiper.params.cssMode) {
                setHash();
            }
        });
    };

    const Autoplay = ({ swiper, extendParams, on, emit, params }) => {
        swiper.autoplay = {
            running: false,
            paused: false,
            timeLeft: 0,
        };
        extendParams({
            autoplay: {
                enabled: false,
                delay: 3000,
                waitForTransition: true,
                disableOnInteraction: false,
                stopOnLastSlide: false,
                reverseDirection: false,
                pauseOnMouseEnter: false,
            },
        });
        function getParams() {
            return swiper.params.autoplay;
        }
        // params here is the user-supplied passedParams; extendParams hasn't yet
        // merged the defaults into swiper.params.autoplay at this point.
        const initialAutoplayDelay = typeof params.autoplay === 'object' &&
            params.autoplay &&
            typeof params.autoplay.delay === 'number'
            ? params.autoplay.delay
            : 3000;
        let timeout;
        let raf;
        let autoplayDelayTotal = initialAutoplayDelay;
        let autoplayDelayCurrent = initialAutoplayDelay;
        let autoplayTimeLeft = 0;
        let autoplayStartTime = new Date().getTime();
        let wasPaused = false;
        let isTouched = false;
        let pausedByTouch = false;
        let touchStartTimeout;
        let pausedByInteraction = false;
        let pausedByPointerEnter = false;
        function onTransitionEnd(e) {
            if (!swiper || swiper.destroyed || !swiper.wrapperEl)
                return;
            if (e.target !== swiper.wrapperEl)
                return;
            swiper.wrapperEl.removeEventListener('transitionend', onTransitionEnd);
            const detail = e.detail;
            if (pausedByPointerEnter || (detail && detail.bySwiperTouchMove)) {
                return;
            }
            resume();
        }
        const calcTimeLeft = () => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return;
            if (swiper.autoplay.paused) {
                wasPaused = true;
            }
            else if (wasPaused) {
                autoplayDelayCurrent = autoplayTimeLeft;
                wasPaused = false;
            }
            const timeLeft = swiper.autoplay.paused
                ? autoplayTimeLeft
                : autoplayStartTime + autoplayDelayCurrent - new Date().getTime();
            swiper.autoplay.timeLeft = timeLeft;
            emit('autoplayTimeLeft', timeLeft, timeLeft / autoplayDelayTotal);
            raf = requestAnimationFrame(() => {
                calcTimeLeft();
            });
        };
        const getSlideDelay = () => {
            let activeSlideEl;
            const virtualEnabled = !!swiper.params.virtual?.enabled;
            if (swiper.virtual && virtualEnabled) {
                activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains('swiper-slide-active'));
            }
            else {
                activeSlideEl = swiper.slides[swiper.activeIndex];
            }
            if (!activeSlideEl)
                return undefined;
            const attr = activeSlideEl.getAttribute('data-swiper-autoplay');
            if (attr == null)
                return undefined;
            return parseInt(attr, 10);
        };
        const getTotalDelay = () => {
            let totalDelay = getParams().delay;
            const currentSlideDelay = getSlideDelay();
            if (typeof currentSlideDelay === 'number' &&
                !Number.isNaN(currentSlideDelay) &&
                currentSlideDelay > 0) {
                totalDelay = currentSlideDelay;
            }
            return totalDelay;
        };
        const run = (delayForce) => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return 0;
            if (raf !== undefined)
                cancelAnimationFrame(raf);
            calcTimeLeft();
            let delay = delayForce;
            if (typeof delay === 'undefined') {
                delay = getTotalDelay();
                autoplayDelayTotal = delay;
                autoplayDelayCurrent = delay;
            }
            autoplayTimeLeft = delay;
            const speed = swiper.params.speed;
            const proceed = () => {
                if (!swiper || swiper.destroyed)
                    return;
                const autoplayParams = getParams();
                if (autoplayParams.reverseDirection) {
                    if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
                        swiper.slidePrev(speed, true, true);
                        emit('autoplay');
                    }
                    else if (!autoplayParams.stopOnLastSlide) {
                        swiper.slideTo(swiper.slides.length - 1, speed, true, true);
                        emit('autoplay');
                    }
                }
                else {
                    if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
                        swiper.slideNext(speed, true, true);
                        emit('autoplay');
                    }
                    else if (!autoplayParams.stopOnLastSlide) {
                        swiper.slideTo(0, speed, true, true);
                        emit('autoplay');
                    }
                }
                if (swiper.params.cssMode) {
                    autoplayStartTime = new Date().getTime();
                    requestAnimationFrame(() => {
                        run();
                    });
                }
            };
            if (delay > 0) {
                if (timeout !== undefined)
                    clearTimeout(timeout);
                timeout = setTimeout(() => {
                    proceed();
                }, delay);
            }
            else {
                requestAnimationFrame(() => {
                    proceed();
                });
            }
            return delay;
        };
        const start = () => {
            autoplayStartTime = new Date().getTime();
            swiper.autoplay.running = true;
            run();
            emit('autoplayStart');
            return true;
        };
        const stop = () => {
            swiper.autoplay.running = false;
            if (timeout !== undefined)
                clearTimeout(timeout);
            if (raf !== undefined)
                cancelAnimationFrame(raf);
            emit('autoplayStop');
            return true;
        };
        const pause = (internal, reset) => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return;
            if (timeout !== undefined)
                clearTimeout(timeout);
            if (!internal) {
                pausedByInteraction = true;
            }
            const proceed = () => {
                emit('autoplayPause');
                if (getParams().waitForTransition) {
                    swiper.wrapperEl.addEventListener('transitionend', onTransitionEnd);
                }
                else {
                    resume();
                }
            };
            swiper.autoplay.paused = true;
            if (reset) {
                proceed();
                return;
            }
            const delay = autoplayTimeLeft || getParams().delay;
            autoplayTimeLeft = delay - (new Date().getTime() - autoplayStartTime);
            if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop)
                return;
            if (autoplayTimeLeft < 0)
                autoplayTimeLeft = 0;
            proceed();
        };
        const resume = () => {
            if ((swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) ||
                swiper.destroyed ||
                !swiper.autoplay.running)
                return;
            autoplayStartTime = new Date().getTime();
            if (pausedByInteraction) {
                pausedByInteraction = false;
                run(autoplayTimeLeft);
            }
            else {
                run();
            }
            swiper.autoplay.paused = false;
            emit('autoplayResume');
        };
        const onVisibilityChange = () => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return;
            if (document.visibilityState === 'hidden') {
                pausedByInteraction = true;
                pause(true);
            }
            if (document.visibilityState === 'visible') {
                resume();
            }
        };
        const onPointerEnter = (e) => {
            if (e.pointerType !== 'mouse')
                return;
            pausedByInteraction = true;
            pausedByPointerEnter = true;
            if (swiper.animating || swiper.autoplay.paused)
                return;
            pause(true);
        };
        const onPointerLeave = (e) => {
            if (e.pointerType !== 'mouse')
                return;
            pausedByPointerEnter = false;
            if (swiper.autoplay.paused) {
                resume();
            }
        };
        const attachMouseEvents = () => {
            if (getParams().pauseOnMouseEnter) {
                swiper.el.addEventListener('pointerenter', onPointerEnter);
                swiper.el.addEventListener('pointerleave', onPointerLeave);
            }
        };
        const detachMouseEvents = () => {
            if (swiper.el && typeof swiper.el !== 'string') {
                swiper.el.removeEventListener('pointerenter', onPointerEnter);
                swiper.el.removeEventListener('pointerleave', onPointerLeave);
            }
        };
        const attachDocumentEvents = () => {
            document.addEventListener('visibilitychange', onVisibilityChange);
        };
        const detachDocumentEvents = () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
        on('init', () => {
            if (getParams().enabled) {
                attachMouseEvents();
                attachDocumentEvents();
                start();
            }
        });
        on('destroy', () => {
            detachMouseEvents();
            detachDocumentEvents();
            if (swiper.autoplay.running) {
                stop();
            }
        });
        on('_freeModeStaticRelease', () => {
            if (pausedByTouch || pausedByInteraction) {
                resume();
            }
        });
        on('_freeModeNoMomentumRelease', () => {
            if (!getParams().disableOnInteraction) {
                pause(true, true);
            }
            else {
                stop();
            }
        });
        on('beforeTransitionStart', (_s, _speed, internal) => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return;
            if (internal || !getParams().disableOnInteraction) {
                pause(true, true);
            }
            else {
                stop();
            }
        });
        on('sliderFirstMove', () => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return;
            if (getParams().disableOnInteraction) {
                stop();
                return;
            }
            isTouched = true;
            pausedByTouch = false;
            pausedByInteraction = false;
            touchStartTimeout = setTimeout(() => {
                pausedByInteraction = true;
                pausedByTouch = true;
                pause(true);
            }, 200);
        });
        on('touchEnd', () => {
            if (swiper.destroyed || !swiper.autoplay.running || !isTouched)
                return;
            if (touchStartTimeout !== undefined)
                clearTimeout(touchStartTimeout);
            if (timeout !== undefined)
                clearTimeout(timeout);
            if (getParams().disableOnInteraction) {
                pausedByTouch = false;
                isTouched = false;
                return;
            }
            if (pausedByTouch && swiper.params.cssMode)
                resume();
            pausedByTouch = false;
            isTouched = false;
        });
        on('slideChange', () => {
            if (swiper.destroyed || !swiper.autoplay.running)
                return;
            if (swiper.autoplay.paused) {
                autoplayTimeLeft = getTotalDelay();
                autoplayDelayTotal = getTotalDelay();
            }
        });
        Object.assign(swiper.autoplay, {
            start,
            stop,
            pause,
            resume,
        });
    };

    const Thumb = ({ swiper, extendParams, on }) => {
        extendParams({
            thumbs: {
                swiper: null,
                multipleActiveThumbs: true,
                autoScrollOffset: 0,
                slideThumbActiveClass: 'swiper-slide-thumb-active',
                thumbsContainerClass: 'swiper-thumbs',
            },
        });
        let initialized = false;
        let swiperCreated = false;
        swiper.thumbs = {
            swiper: null,
        };
        function getParams() {
            return swiper.params.thumbs;
        }
        function isVirtualEnabled() {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed)
                return false;
            const virtual = thumbsSwiper.params.virtual;
            return !!virtual && !!virtual.enabled;
        }
        function onThumbClick() {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed)
                return;
            const clickedIndex = thumbsSwiper.clickedIndex;
            const clickedSlide = thumbsSwiper.clickedSlide;
            const thumbsParams = getParams();
            if (clickedSlide && clickedSlide.classList.contains(thumbsParams.slideThumbActiveClass))
                return;
            if (typeof clickedIndex === 'undefined' || clickedIndex === null)
                return;
            let slideToIndex;
            if (thumbsSwiper.params.loop) {
                const attr = thumbsSwiper.clickedSlide?.getAttribute('data-swiper-slide-index');
                slideToIndex = attr == null ? clickedIndex : parseInt(attr, 10);
            }
            else {
                slideToIndex = clickedIndex;
            }
            if (swiper.params.loop) {
                swiper.slideToLoop(slideToIndex);
            }
            else {
                swiper.slideTo(slideToIndex);
            }
        }
        function init() {
            const thumbsParams = getParams();
            if (initialized)
                return false;
            initialized = true;
            const SwiperClass = swiper.constructor;
            if (thumbsParams.swiper instanceof SwiperClass) {
                if (thumbsParams.swiper.destroyed) {
                    initialized = false;
                    return false;
                }
                const thumbsSwiper = thumbsParams.swiper;
                swiper.thumbs.swiper = thumbsSwiper;
                Object.assign(thumbsSwiper.originalParams, {
                    watchSlidesProgress: true,
                    slideToClickedSlide: false,
                });
                Object.assign(thumbsSwiper.params, {
                    watchSlidesProgress: true,
                    slideToClickedSlide: false,
                });
                thumbsSwiper.update();
            }
            else if (isObject(thumbsParams.swiper)) {
                const thumbsSwiperParams = Object.assign({}, thumbsParams.swiper);
                Object.assign(thumbsSwiperParams, {
                    watchSlidesProgress: true,
                    slideToClickedSlide: false,
                });
                swiper.thumbs.swiper = new SwiperClass(thumbsSwiperParams);
                swiperCreated = true;
            }
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper)
                return false;
            thumbsSwiper.el.classList.add(thumbsParams.thumbsContainerClass);
            thumbsSwiper.on('tap', onThumbClick);
            if (isVirtualEnabled()) {
                thumbsSwiper.on('virtualUpdate', () => {
                    update(false, { autoScroll: false });
                });
            }
            return true;
        }
        function update(initial, p) {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed)
                return;
            // Activate thumbs
            let thumbsToActivate = 1;
            const thumbsParams = getParams();
            const thumbActiveClass = thumbsParams.slideThumbActiveClass;
            const slidesPerView = swiper.params.slidesPerView;
            if (typeof slidesPerView === 'number' && slidesPerView > 1 && !swiper.params.centeredSlides) {
                thumbsToActivate = slidesPerView;
            }
            if (!thumbsParams.multipleActiveThumbs) {
                thumbsToActivate = 1;
            }
            thumbsToActivate = Math.floor(thumbsToActivate);
            thumbsSwiper.slides.forEach((slideEl) => slideEl.classList.remove(thumbActiveClass));
            if (thumbsSwiper.params.loop || isVirtualEnabled()) {
                for (let i = 0; i < thumbsToActivate; i += 1) {
                    elementChildren(thumbsSwiper.slidesEl, `[data-swiper-slide-index="${swiper.realIndex + i}"]`).forEach((slideEl) => {
                        slideEl.classList.add(thumbActiveClass);
                    });
                }
            }
            else {
                for (let i = 0; i < thumbsToActivate; i += 1) {
                    const slide = thumbsSwiper.slides[swiper.realIndex + i];
                    if (slide) {
                        slide.classList.add(thumbActiveClass);
                    }
                }
            }
            if (p?.autoScroll ?? true) {
                autoScroll(initial ? 0 : undefined);
            }
        }
        function autoScroll(slideSpeed) {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed)
                return;
            const thumbsSlidesPerView = thumbsSwiper.params.slidesPerView;
            const slidesPerView = thumbsSlidesPerView === 'auto'
                ? thumbsSwiper.slidesPerViewDynamic()
                : (thumbsSlidesPerView ?? 1);
            const autoScrollOffset = getParams().autoScrollOffset;
            const useOffset = autoScrollOffset && !thumbsSwiper.params.loop;
            if (swiper.realIndex !== thumbsSwiper.realIndex || useOffset) {
                const currentThumbsIndex = thumbsSwiper.activeIndex;
                let newThumbsIndex;
                let direction;
                if (thumbsSwiper.params.loop) {
                    const newThumbsSlide = thumbsSwiper.slides.find((slideEl) => slideEl.getAttribute('data-swiper-slide-index') === `${swiper.realIndex}`);
                    newThumbsIndex = newThumbsSlide ? thumbsSwiper.slides.indexOf(newThumbsSlide) : -1;
                    direction = swiper.activeIndex > swiper.previousIndex ? 'next' : 'prev';
                }
                else {
                    newThumbsIndex = swiper.realIndex;
                    direction = newThumbsIndex > swiper.previousIndex ? 'next' : 'prev';
                }
                if (useOffset) {
                    newThumbsIndex += direction === 'next' ? autoScrollOffset : -1 * autoScrollOffset;
                }
                if (thumbsSwiper.visibleSlidesIndexes &&
                    thumbsSwiper.visibleSlidesIndexes.indexOf(newThumbsIndex) < 0) {
                    if (thumbsSwiper.params.centeredSlides) {
                        if (newThumbsIndex > currentThumbsIndex) {
                            newThumbsIndex = newThumbsIndex - Math.floor(slidesPerView / 2) + 1;
                        }
                        else {
                            newThumbsIndex = newThumbsIndex + Math.floor(slidesPerView / 2) - 1;
                        }
                    }
                    else if (newThumbsIndex > currentThumbsIndex &&
                        thumbsSwiper.params.slidesPerGroup === 1) ;
                    thumbsSwiper.slideTo(newThumbsIndex, slideSpeed);
                }
            }
        }
        on('beforeInit', () => {
            const thumbs = swiper.params.thumbs;
            if (!thumbs || !thumbs.swiper)
                return;
            if (typeof thumbs.swiper === 'string' || thumbs.swiper instanceof HTMLElement) {
                const getThumbsElementAndInit = () => {
                    const thumbsElement = typeof thumbs.swiper === 'string'
                        ? document.querySelector(thumbs.swiper)
                        : thumbs.swiper;
                    if (thumbsElement && thumbsElement.swiper) {
                        thumbs.swiper = thumbsElement.swiper;
                        init();
                        update(true);
                    }
                    else if (thumbsElement) {
                        const eventName = `${swiper.params.eventsPrefix}init`;
                        const onThumbsSwiper = (e) => {
                            const detail = e.detail;
                            thumbs.swiper = detail[0];
                            thumbsElement.removeEventListener(eventName, onThumbsSwiper);
                            init();
                            update(true);
                            thumbs.swiper.update();
                            swiper.update();
                        };
                        thumbsElement.addEventListener(eventName, onThumbsSwiper);
                    }
                    return thumbsElement;
                };
                const watchForThumbsToAppear = () => {
                    if (swiper.destroyed)
                        return;
                    const thumbsElement = getThumbsElementAndInit();
                    if (!thumbsElement) {
                        requestAnimationFrame(watchForThumbsToAppear);
                    }
                };
                requestAnimationFrame(watchForThumbsToAppear);
            }
            else {
                init();
                update(true);
            }
        });
        on('slideChange update resize observerUpdate', () => {
            update();
        });
        on('setTransition', (_s, duration) => {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed)
                return;
            thumbsSwiper.setTransition(duration);
        });
        on('beforeDestroy', () => {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed)
                return;
            if (swiperCreated) {
                thumbsSwiper.destroy();
            }
        });
        Object.assign(swiper.thumbs, {
            init,
            update,
        });
    };

    const FreeMode = ({ swiper, extendParams, emit, once }) => {
        extendParams({
            freeMode: {
                enabled: false,
                momentum: true,
                momentumRatio: 1,
                momentumBounce: true,
                momentumBounceRatio: 1,
                momentumVelocityRatio: 1,
                sticky: false,
                minimumVelocity: 0.02,
            },
        });
        function getParams() {
            return swiper.params.freeMode;
        }
        function onTouchStart() {
            if (swiper.params.cssMode)
                return;
            const translate = swiper.getTranslate();
            swiper.setTranslate(translate);
            swiper.setTransition(0);
            swiper.touchEventsData.velocities.length = 0;
            swiper.freeMode.onTouchEnd({ currentPos: swiper.rtl ? swiper.translate : -swiper.translate });
        }
        function onTouchMove() {
            if (swiper.params.cssMode)
                return;
            const { touchEventsData: data, touches } = swiper;
            // Velocity
            if (data.velocities.length === 0) {
                data.velocities.push({
                    position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
                    time: data.touchStartTime ?? now(),
                });
            }
            data.velocities.push({
                position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
                time: now(),
            });
        }
        function onTouchEnd({ currentPos }) {
            if (swiper.params.cssMode)
                return;
            const { wrapperEl, rtlTranslate: rtl, snapGrid, touchEventsData: data } = swiper;
            const params = swiper.params;
            const freeModeParams = getParams();
            // Time diff
            const touchEndTime = now();
            const timeDiff = touchEndTime - (data.touchStartTime ?? touchEndTime);
            if (currentPos < -swiper.minTranslate()) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (currentPos > -swiper.maxTranslate()) {
                if (swiper.slides.length < snapGrid.length) {
                    swiper.slideTo(snapGrid.length - 1);
                }
                else {
                    swiper.slideTo(swiper.slides.length - 1);
                }
                return;
            }
            if (freeModeParams.momentum) {
                if (data.velocities.length > 1) {
                    const lastMoveEvent = data.velocities.pop();
                    const velocityEvent = data.velocities.pop();
                    const distance = lastMoveEvent.position - velocityEvent.position;
                    const time = lastMoveEvent.time - velocityEvent.time;
                    swiper.velocity = distance / time;
                    swiper.velocity /= 2;
                    if (Math.abs(swiper.velocity) < freeModeParams.minimumVelocity) {
                        swiper.velocity = 0;
                    }
                    // this implies that the user stopped moving a finger then released.
                    // There would be no events with distance zero, so the last event is stale.
                    if (time > 150 || now() - lastMoveEvent.time > 300) {
                        swiper.velocity = 0;
                    }
                }
                else {
                    swiper.velocity = 0;
                }
                swiper.velocity *= freeModeParams.momentumVelocityRatio;
                data.velocities.length = 0;
                let momentumDuration = 1000 * freeModeParams.momentumRatio;
                const momentumDistance = swiper.velocity * momentumDuration;
                let newPosition = swiper.translate + momentumDistance;
                if (rtl)
                    newPosition = -newPosition;
                let doBounce = false;
                let afterBouncePosition;
                const bounceAmount = Math.abs(swiper.velocity) * 20 * freeModeParams.momentumBounceRatio;
                let needsLoopFix = false;
                if (newPosition < swiper.maxTranslate()) {
                    if (freeModeParams.momentumBounce) {
                        if (newPosition + swiper.maxTranslate() < -bounceAmount) {
                            newPosition = swiper.maxTranslate() - bounceAmount;
                        }
                        afterBouncePosition = swiper.maxTranslate();
                        doBounce = true;
                        data.allowMomentumBounce = true;
                    }
                    else {
                        newPosition = swiper.maxTranslate();
                    }
                    if (params.loop && params.centeredSlides)
                        needsLoopFix = true;
                }
                else if (newPosition > swiper.minTranslate()) {
                    if (freeModeParams.momentumBounce) {
                        if (newPosition - swiper.minTranslate() > bounceAmount) {
                            newPosition = swiper.minTranslate() + bounceAmount;
                        }
                        afterBouncePosition = swiper.minTranslate();
                        doBounce = true;
                        data.allowMomentumBounce = true;
                    }
                    else {
                        newPosition = swiper.minTranslate();
                    }
                    if (params.loop && params.centeredSlides)
                        needsLoopFix = true;
                }
                else if (freeModeParams.sticky) {
                    let nextSlide = 0;
                    for (let j = 0; j < snapGrid.length; j += 1) {
                        if (snapGrid[j] > -newPosition) {
                            nextSlide = j;
                            break;
                        }
                    }
                    if (Math.abs(snapGrid[nextSlide] - newPosition) <
                        Math.abs((snapGrid[nextSlide - 1] ?? snapGrid[nextSlide]) - newPosition) ||
                        swiper.swipeDirection === 'next') {
                        newPosition = snapGrid[nextSlide];
                    }
                    else {
                        newPosition = snapGrid[nextSlide - 1];
                    }
                    newPosition = -newPosition;
                }
                if (needsLoopFix) {
                    once('transitionEnd', () => {
                        swiper.loopFix();
                    });
                }
                // Fix duration
                if (swiper.velocity !== 0) {
                    if (rtl) {
                        momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
                    }
                    else {
                        momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
                    }
                    if (freeModeParams.sticky) {
                        // If freeMode.sticky is active and the user ends a swipe with a slow-velocity
                        // event, then durations can be 20+ seconds to slide one (or zero!) slides.
                        // It's easy to see this when simulating touch with mouse events. To fix this,
                        // limit single-slide swipes to the default slide duration. This also has the
                        // nice side effect of matching slide speed if the user stopped moving before
                        // lifting finger or mouse vs. moving slowly before lifting the finger/mouse.
                        // For faster swipes, also apply limits (albeit higher ones).
                        const moveDistance = Math.abs((rtl ? -newPosition : newPosition) - swiper.translate);
                        const currentSlideSize = swiper.slidesSizesGrid[swiper.activeIndex];
                        const speed = params.speed;
                        if (moveDistance < currentSlideSize) {
                            momentumDuration = speed;
                        }
                        else if (moveDistance < 2 * currentSlideSize) {
                            momentumDuration = speed * 1.5;
                        }
                        else {
                            momentumDuration = speed * 2.5;
                        }
                    }
                }
                else if (freeModeParams.sticky) {
                    swiper.slideToClosest();
                    return;
                }
                if (freeModeParams.momentumBounce && doBounce && afterBouncePosition !== undefined) {
                    swiper.updateProgress(afterBouncePosition);
                    swiper.setTransition(momentumDuration);
                    swiper.setTranslate(newPosition);
                    swiper.transitionStart(true, swiper.swipeDirection);
                    swiper.animating = true;
                    elementTransitionEnd(wrapperEl, () => {
                        if (!swiper || swiper.destroyed || !data.allowMomentumBounce)
                            return;
                        emit('momentumBounce');
                        swiper.setTransition(params.speed);
                        setTimeout(() => {
                            swiper.setTranslate(afterBouncePosition);
                            elementTransitionEnd(wrapperEl, () => {
                                if (!swiper || swiper.destroyed)
                                    return;
                                swiper.transitionEnd();
                            });
                        }, 0);
                    });
                }
                else if (swiper.velocity) {
                    emit('_freeModeNoMomentumRelease');
                    swiper.updateProgress(newPosition);
                    swiper.setTransition(momentumDuration);
                    swiper.setTranslate(newPosition);
                    swiper.transitionStart(true, swiper.swipeDirection);
                    if (!swiper.animating) {
                        swiper.animating = true;
                        elementTransitionEnd(wrapperEl, () => {
                            if (!swiper || swiper.destroyed)
                                return;
                            swiper.transitionEnd();
                        });
                    }
                }
                else {
                    swiper.updateProgress(newPosition);
                }
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            else if (freeModeParams.sticky) {
                swiper.slideToClosest();
                return;
            }
            else {
                emit('_freeModeNoMomentumRelease');
            }
            if (!freeModeParams.momentum || timeDiff >= params.longSwipesMs) {
                emit('_freeModeStaticRelease');
                swiper.updateProgress();
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
        }
        swiper.freeMode = {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
        };
    };

    const Grid = ({ swiper, extendParams, on }) => {
        extendParams({
            grid: {
                rows: 1,
                fill: 'column',
            },
        });
        function getParams() {
            return swiper.params.grid;
        }
        let slidesNumberEvenToRows;
        let slidesPerRow;
        let numFullColumns;
        let wasMultiRow;
        const getSpaceBetween = () => {
            let spaceBetween = swiper.params.spaceBetween ?? 0;
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiper.size;
            }
            else if (typeof spaceBetween === 'string') {
                spaceBetween = parseFloat(spaceBetween);
            }
            return spaceBetween;
        };
        const isVirtualEnabled = () => {
            const virtualParams = swiper.params.virtual;
            return (!!swiper.virtual &&
                typeof virtualParams === 'object' &&
                virtualParams !== null &&
                !!virtualParams.enabled);
        };
        const initSlides = (slides) => {
            const { slidesPerView } = swiper.params;
            const { rows, fill } = getParams();
            const slidesLength = isVirtualEnabled() ? swiper.virtual.slides.length : slides.length;
            numFullColumns = Math.floor(slidesLength / rows);
            if (Math.floor(slidesLength / rows) === slidesLength / rows) {
                slidesNumberEvenToRows = slidesLength;
            }
            else {
                slidesNumberEvenToRows = Math.ceil(slidesLength / rows) * rows;
            }
            if (slidesPerView !== 'auto' && fill === 'row') {
                slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, Math.floor(slidesPerView ?? 1) * rows);
            }
            slidesPerRow = slidesNumberEvenToRows / rows;
        };
        const unsetSlides = () => {
            if (swiper.slides) {
                swiper.slides.forEach((slide) => {
                    const gridSlide = slide;
                    if (gridSlide.swiperSlideGridSet) {
                        slide.style.height = '';
                        slide.style.setProperty(swiper.getDirectionLabel('margin-top'), '');
                    }
                });
            }
        };
        const updateSlide = (i, slide, slides) => {
            const { slidesPerGroup } = swiper.params;
            const spaceBetween = getSpaceBetween();
            const { rows, fill } = getParams();
            const slidesLength = isVirtualEnabled() ? swiper.virtual.slides.length : slides.length;
            // Set slides order
            let newSlideOrderIndex;
            let column;
            let row;
            if (fill === 'row' && (slidesPerGroup ?? 1) > 1) {
                const groupsPer = slidesPerGroup ?? 1;
                const groupIndex = Math.floor(i / (groupsPer * rows));
                const slideIndexInGroup = i - rows * groupsPer * groupIndex;
                const columnsInGroup = groupIndex === 0
                    ? groupsPer
                    : Math.min(Math.ceil((slidesLength - groupIndex * rows * groupsPer) / rows), groupsPer);
                row = Math.floor(slideIndexInGroup / columnsInGroup);
                column = slideIndexInGroup - row * columnsInGroup + groupIndex * groupsPer;
                newSlideOrderIndex = column + (row * slidesNumberEvenToRows) / rows;
                slide.style.order = String(newSlideOrderIndex);
            }
            else if (fill === 'column') {
                column = Math.floor(i / rows);
                row = i - column * rows;
                if (column > numFullColumns || (column === numFullColumns && row === rows - 1)) {
                    row += 1;
                    if (row >= rows) {
                        row = 0;
                        column += 1;
                    }
                }
            }
            else {
                row = Math.floor(i / slidesPerRow);
                column = i - row * slidesPerRow;
            }
            const gridSlide = slide;
            gridSlide.row = row;
            gridSlide.column = column;
            slide.style.height = `calc((100% - ${(rows - 1) * spaceBetween}px) / ${rows})`;
            slide.style.setProperty(swiper.getDirectionLabel('margin-top'), row !== 0 && spaceBetween ? `${spaceBetween}px` : '');
            gridSlide.swiperSlideGridSet = true;
        };
        const updateWrapperSize = (slideSize, snapGrid) => {
            const { centeredSlides, roundLengths } = swiper.params;
            const spaceBetween = getSpaceBetween();
            const { rows } = getParams();
            swiper.virtualSize = (slideSize + spaceBetween) * slidesNumberEvenToRows;
            swiper.virtualSize = Math.ceil(swiper.virtualSize / rows) - spaceBetween;
            if (!swiper.params.cssMode) {
                swiper.wrapperEl.style.setProperty(swiper.getDirectionLabel('width'), `${swiper.virtualSize + spaceBetween}px`);
            }
            if (centeredSlides) {
                const newSlidesGrid = [];
                for (let i = 0; i < snapGrid.length; i += 1) {
                    let slidesGridItem = snapGrid[i];
                    if (roundLengths)
                        slidesGridItem = Math.floor(slidesGridItem);
                    if (snapGrid[i] < swiper.virtualSize + snapGrid[0])
                        newSlidesGrid.push(slidesGridItem);
                }
                snapGrid.splice(0, snapGrid.length);
                snapGrid.push(...newSlidesGrid);
            }
        };
        const onInit = () => {
            const gridParams = swiper.params.grid;
            wasMultiRow = !!(gridParams && (gridParams.rows ?? 1) > 1);
        };
        const onUpdate = () => {
            const { params, el } = swiper;
            const gridParams = params.grid;
            const isMultiRow = !!(gridParams && (gridParams.rows ?? 1) > 1);
            if (wasMultiRow && !isMultiRow) {
                el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
                numFullColumns = 1;
                swiper.emitContainerClasses();
            }
            else if (!wasMultiRow && isMultiRow) {
                el.classList.add(`${params.containerModifierClass}grid`);
                if (gridParams.fill === 'column') {
                    el.classList.add(`${params.containerModifierClass}grid-column`);
                }
                swiper.emitContainerClasses();
            }
            wasMultiRow = isMultiRow;
        };
        on('init', onInit);
        on('update', onUpdate);
        swiper.grid = {
            initSlides,
            unsetSlides,
            updateSlide,
            updateWrapperSize,
        };
    };

    function addSlide(index, slides) {
        const swiper = this;
        const { params, activeIndex, slidesEl } = swiper;
        let activeIndexBuffer = activeIndex;
        if (params.loop) {
            activeIndexBuffer -= swiper.loopedSlides ?? 0;
            swiper.loopDestroy();
            swiper.recalcSlides();
        }
        const baseLength = swiper.slides.length;
        if (index <= 0) {
            swiper.prependSlide(slides);
            return;
        }
        if (index >= baseLength) {
            swiper.appendSlide(slides);
            return;
        }
        let newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + 1 : activeIndexBuffer;
        const slidesBuffer = [];
        for (let i = baseLength - 1; i >= index; i -= 1) {
            const currentSlide = swiper.slides[i];
            if (!currentSlide)
                continue;
            currentSlide.remove();
            slidesBuffer.unshift(currentSlide);
        }
        if (Array.isArray(slides)) {
            for (let i = 0; i < slides.length; i += 1) {
                const slide = slides[i];
                if (slide)
                    slidesEl.append(slide);
            }
            newActiveIndex =
                activeIndexBuffer > index ? activeIndexBuffer + slides.length : activeIndexBuffer;
        }
        else {
            slidesEl.append(slides);
        }
        for (let i = 0; i < slidesBuffer.length; i += 1) {
            slidesEl.append(slidesBuffer[i]);
        }
        swiper.recalcSlides();
        if (params.loop) {
            swiper.loopCreate();
        }
        if (!params.observer || swiper.isElement) {
            swiper.update();
        }
        if (params.loop) {
            swiper.slideTo(newActiveIndex + (swiper.loopedSlides ?? 0), 0, false);
        }
        else {
            swiper.slideTo(newActiveIndex, 0, false);
        }
    }

    function appendSlide(slides) {
        const swiper = this;
        const { params, slidesEl } = swiper;
        if (params.loop) {
            swiper.loopDestroy();
        }
        const appendElement = (slideEl) => {
            if (typeof slideEl === 'string') {
                const tempDOM = document.createElement('div');
                setInnerHTML(tempDOM, slideEl);
                const child = tempDOM.children[0];
                if (child)
                    slidesEl.append(child);
                setInnerHTML(tempDOM, '');
            }
            else {
                slidesEl.append(slideEl);
            }
        };
        if (Array.isArray(slides)) {
            for (let i = 0; i < slides.length; i += 1) {
                const slide = slides[i];
                if (slide)
                    appendElement(slide);
            }
        }
        else {
            appendElement(slides);
        }
        swiper.recalcSlides();
        if (params.loop) {
            swiper.loopCreate();
        }
        if (!params.observer || swiper.isElement) {
            swiper.update();
        }
    }

    function prependSlide(slides) {
        const swiper = this;
        const { params, activeIndex, slidesEl } = swiper;
        if (params.loop) {
            swiper.loopDestroy();
        }
        let newActiveIndex = activeIndex + 1;
        const prependElement = (slideEl) => {
            if (typeof slideEl === 'string') {
                const tempDOM = document.createElement('div');
                setInnerHTML(tempDOM, slideEl);
                const child = tempDOM.children[0];
                if (child)
                    slidesEl.prepend(child);
                setInnerHTML(tempDOM, '');
            }
            else {
                slidesEl.prepend(slideEl);
            }
        };
        if (Array.isArray(slides)) {
            for (let i = 0; i < slides.length; i += 1) {
                const slide = slides[i];
                if (slide)
                    prependElement(slide);
            }
            newActiveIndex = activeIndex + slides.length;
        }
        else {
            prependElement(slides);
        }
        swiper.recalcSlides();
        if (params.loop) {
            swiper.loopCreate();
        }
        if (!params.observer || swiper.isElement) {
            swiper.update();
        }
        swiper.slideTo(newActiveIndex, 0, false);
    }

    function removeAllSlides() {
        const swiper = this;
        const slidesIndexes = [];
        for (let i = 0; i < swiper.slides.length; i += 1) {
            slidesIndexes.push(i);
        }
        swiper.removeSlide(slidesIndexes);
    }

    function removeSlide(slidesIndexes) {
        const swiper = this;
        const { params, activeIndex } = swiper;
        let activeIndexBuffer = activeIndex;
        if (params.loop) {
            activeIndexBuffer -= swiper.loopedSlides ?? 0;
            swiper.loopDestroy();
        }
        let newActiveIndex = activeIndexBuffer;
        if (Array.isArray(slidesIndexes)) {
            for (let i = 0; i < slidesIndexes.length; i += 1) {
                const indexToRemove = slidesIndexes[i];
                if (swiper.slides[indexToRemove])
                    swiper.slides[indexToRemove].remove();
                if (indexToRemove < newActiveIndex)
                    newActiveIndex -= 1;
            }
            newActiveIndex = Math.max(newActiveIndex, 0);
        }
        else {
            const indexToRemove = slidesIndexes;
            if (swiper.slides[indexToRemove])
                swiper.slides[indexToRemove].remove();
            if (indexToRemove < newActiveIndex)
                newActiveIndex -= 1;
            newActiveIndex = Math.max(newActiveIndex, 0);
        }
        swiper.recalcSlides();
        if (params.loop) {
            swiper.loopCreate();
        }
        if (!params.observer || swiper.isElement) {
            swiper.update();
        }
        if (params.loop) {
            swiper.slideTo(newActiveIndex + (swiper.loopedSlides ?? 0), 0, false);
        }
        else {
            swiper.slideTo(newActiveIndex, 0, false);
        }
    }

    const Manipulation = ({ swiper }) => {
        Object.assign(swiper, {
            appendSlide: appendSlide.bind(swiper),
            prependSlide: prependSlide.bind(swiper),
            addSlide: addSlide.bind(swiper),
            removeSlide: removeSlide.bind(swiper),
            removeAllSlides: removeAllSlides.bind(swiper),
        });
    };

    function effectInit(params) {
        const { effect, swiper, on, setTranslate, setTransition, overwriteParams, perspective, recreateShadows, getEffectParams, } = params;
        on('beforeInit', () => {
            if (swiper.params.effect !== effect)
                return;
            swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
            if (perspective && perspective()) {
                swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
            }
            const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
            Object.assign(swiper.params, overwriteParamsResult);
            Object.assign(swiper.originalParams, overwriteParamsResult);
        });
        on('setTranslate _virtualUpdated', () => {
            if (swiper.params.effect !== effect)
                return;
            setTranslate();
        });
        on('setTransition', (_s, duration) => {
            if (swiper.params.effect !== effect)
                return;
            setTransition(duration);
        });
        on('transitionEnd', () => {
            if (swiper.params.effect !== effect)
                return;
            if (recreateShadows) {
                const effectParams = getEffectParams ? getEffectParams() : undefined;
                if (!effectParams || !effectParams.slideShadows)
                    return;
                swiper.slides.forEach((slideEl) => {
                    slideEl
                        .querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
                        .forEach((shadowEl) => shadowEl.remove());
                });
                recreateShadows();
            }
        });
        let requireUpdateOnVirtual = false;
        on('virtualUpdate', () => {
            if (swiper.params.effect !== effect)
                return;
            if (!swiper.slides.length) {
                requireUpdateOnVirtual = true;
            }
            requestAnimationFrame(() => {
                if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
                    setTranslate();
                    requireUpdateOnVirtual = false;
                }
            });
        });
    }

    function effectTarget(_effectParams, slideEl) {
        const transformEl = getSlideTransformEl(slideEl);
        if (transformEl !== slideEl) {
            transformEl.style.backfaceVisibility = 'hidden';
            transformEl.style.setProperty('-webkit-backface-visibility', 'hidden');
        }
        return transformEl;
    }

    function effectVirtualTransitionEnd({ swiper, duration, transformElements, allSlides, }) {
        const { activeIndex } = swiper;
        const getSlide = (el) => {
            if (!el.parentElement) {
                // assume shadow root
                return swiper.slides.find((slideEl) => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode);
            }
            if (el.parentElement instanceof HTMLElement)
                return el.parentElement;
            return undefined;
        };
        if (swiper.params.virtualTranslate && duration !== 0) {
            let eventTriggered = false;
            let transitionEndTarget;
            if (allSlides) {
                transitionEndTarget = transformElements;
            }
            else {
                transitionEndTarget = transformElements.filter((transformEl) => {
                    const el = transformEl.classList.contains('swiper-slide-transform')
                        ? getSlide(transformEl)
                        : transformEl;
                    return !!el && swiper.getSlideIndex(el) === activeIndex;
                });
            }
            transitionEndTarget.forEach((el) => {
                elementTransitionEnd(el, () => {
                    if (eventTriggered)
                        return;
                    if (!swiper || swiper.destroyed)
                        return;
                    eventTriggered = true;
                    swiper.animating = false;
                    const evt = new CustomEvent('transitionend', { bubbles: true, cancelable: true });
                    swiper.wrapperEl.dispatchEvent(evt);
                });
            });
        }
    }

    const EffectFade = ({ swiper, extendParams, on }) => {
        extendParams({
            fadeEffect: {
                crossFade: false,
            },
        });
        function getParams() {
            return swiper.params.fadeEffect;
        }
        const setTranslate = () => {
            const { slides } = swiper;
            const params = getParams();
            for (let i = 0; i < slides.length; i += 1) {
                const slideEl = slides[i];
                const offset = slideEl.swiperSlideOffset ?? 0;
                let tx = -offset;
                if (!swiper.params.virtualTranslate)
                    tx -= swiper.translate;
                let ty = 0;
                if (!swiper.isHorizontal()) {
                    ty = tx;
                    tx = 0;
                }
                const slideProgress = slideEl.progress ?? 0;
                const slideOpacity = params.crossFade
                    ? Math.max(1 - Math.abs(slideProgress), 0)
                    : 1 + Math.min(Math.max(slideProgress, -1), 0);
                const targetEl = effectTarget(params, slideEl);
                targetEl.style.opacity = String(slideOpacity);
                targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
            }
        };
        const setTransition = (duration) => {
            const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
            transformElements.forEach((el) => {
                el.style.transitionDuration = `${duration}ms`;
            });
            effectVirtualTransitionEnd({ swiper, duration, transformElements, allSlides: true });
        };
        effectInit({
            effect: 'fade',
            swiper,
            on,
            setTranslate,
            setTransition,
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: true,
                spaceBetween: 0,
                virtualTranslate: !swiper.params.cssMode,
            }),
        });
    };

    const EffectCube = ({ swiper, extendParams, on }) => {
        extendParams({
            cubeEffect: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94,
            },
        });
        function getParams() {
            return swiper.params.cubeEffect;
        }
        const createSlideShadows = (slideEl, progress, isHorizontal) => {
            let shadowBefore = isHorizontal
                ? slideEl.querySelector('.swiper-slide-shadow-left')
                : slideEl.querySelector('.swiper-slide-shadow-top');
            let shadowAfter = isHorizontal
                ? slideEl.querySelector('.swiper-slide-shadow-right')
                : slideEl.querySelector('.swiper-slide-shadow-bottom');
            if (!shadowBefore) {
                shadowBefore = createElement('div', `swiper-slide-shadow-cube swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}`.split(' '));
                slideEl.append(shadowBefore);
            }
            if (!shadowAfter) {
                shadowAfter = createElement('div', `swiper-slide-shadow-cube swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}`.split(' '));
                slideEl.append(shadowAfter);
            }
            if (shadowBefore)
                shadowBefore.style.opacity = String(Math.max(-progress, 0));
            if (shadowAfter)
                shadowAfter.style.opacity = String(Math.max(progress, 0));
        };
        const recreateShadows = () => {
            // create new ones
            const isHorizontal = swiper.isHorizontal();
            swiper.slides.forEach((slideEl) => {
                const progress = Math.max(Math.min(slideEl.progress ?? 0, 1), -1);
                createSlideShadows(slideEl, progress, isHorizontal);
            });
        };
        const setTranslate = () => {
            const { el, wrapperEl, slides, width: swiperWidth, height: swiperHeight, rtlTranslate: rtl, size: swiperSize, } = swiper;
            const r = getRotateFix(swiper);
            const params = getParams();
            const isHorizontal = swiper.isHorizontal();
            const isVirtual = !!(swiper.virtual && swiper.params.virtual?.enabled);
            let wrapperRotate = 0;
            let cubeShadowEl = null;
            if (params.shadow) {
                if (isHorizontal) {
                    cubeShadowEl = swiper.wrapperEl.querySelector('.swiper-cube-shadow');
                    if (!cubeShadowEl) {
                        cubeShadowEl = createElement('div', 'swiper-cube-shadow');
                        swiper.wrapperEl.append(cubeShadowEl);
                    }
                    cubeShadowEl.style.height = `${swiperWidth}px`;
                }
                else {
                    cubeShadowEl = el.querySelector('.swiper-cube-shadow');
                    if (!cubeShadowEl) {
                        cubeShadowEl = createElement('div', 'swiper-cube-shadow');
                        el.append(cubeShadowEl);
                    }
                }
            }
            for (let i = 0; i < slides.length; i += 1) {
                const slideEl = slides[i];
                let slideIndex = i;
                if (isVirtual) {
                    slideIndex = parseInt(slideEl.getAttribute('data-swiper-slide-index') ?? '0', 10);
                }
                let slideAngle = slideIndex * 90;
                let round = Math.floor(slideAngle / 360);
                if (rtl) {
                    slideAngle = -slideAngle;
                    round = Math.floor(-slideAngle / 360);
                }
                const progress = Math.max(Math.min(slideEl.progress ?? 0, 1), -1);
                let tx = 0;
                let ty = 0;
                let tz = 0;
                if (slideIndex % 4 === 0) {
                    tx = -round * 4 * swiperSize;
                    tz = 0;
                }
                else if ((slideIndex - 1) % 4 === 0) {
                    tx = 0;
                    tz = -round * 4 * swiperSize;
                }
                else if ((slideIndex - 2) % 4 === 0) {
                    tx = swiperSize + round * 4 * swiperSize;
                    tz = swiperSize;
                }
                else if ((slideIndex - 3) % 4 === 0) {
                    tx = -swiperSize;
                    tz = 3 * swiperSize + swiperSize * 4 * round;
                }
                if (rtl) {
                    tx = -tx;
                }
                if (!isHorizontal) {
                    ty = tx;
                    tx = 0;
                }
                const transform = `rotateX(${r(isHorizontal ? 0 : -slideAngle)}deg) rotateY(${r(isHorizontal ? slideAngle : 0)}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
                if (progress <= 1 && progress > -1) {
                    wrapperRotate = slideIndex * 90 + progress * 90;
                    if (rtl)
                        wrapperRotate = -slideIndex * 90 - progress * 90;
                }
                slideEl.style.transform = transform;
                if (params.slideShadows) {
                    createSlideShadows(slideEl, progress, isHorizontal);
                }
            }
            wrapperEl.style.transformOrigin = `50% 50% -${swiperSize / 2}px`;
            wrapperEl.style.setProperty('-webkit-transform-origin', `50% 50% -${swiperSize / 2}px`);
            if (params.shadow && cubeShadowEl) {
                if (isHorizontal) {
                    cubeShadowEl.style.transform = `translate3d(0px, ${swiperWidth / 2 + params.shadowOffset}px, ${-swiperWidth / 2}px) rotateX(89.99deg) rotateZ(0deg) scale(${params.shadowScale})`;
                }
                else {
                    const shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                    const multiplier = 1.5 -
                        (Math.sin((shadowAngle * 2 * Math.PI) / 360) / 2 +
                            Math.cos((shadowAngle * 2 * Math.PI) / 360) / 2);
                    const scale1 = params.shadowScale;
                    const scale2 = params.shadowScale / multiplier;
                    const offset = params.shadowOffset;
                    cubeShadowEl.style.transform = `scale3d(${scale1}, 1, ${scale2}) translate3d(0px, ${swiperHeight / 2 + offset}px, ${-swiperHeight / 2 / scale2}px) rotateX(-89.99deg)`;
                }
            }
            wrapperEl.style.transform = `translate3d(0px,0,0px) rotateX(${r(swiper.isHorizontal() ? 0 : wrapperRotate)}deg) rotateY(${r(swiper.isHorizontal() ? -wrapperRotate : 0)}deg)`;
            wrapperEl.style.setProperty('--swiper-cube-translate-z', '0px');
        };
        const setTransition = (duration) => {
            const { el, slides } = swiper;
            slides.forEach((slideEl) => {
                slideEl.style.transitionDuration = `${duration}ms`;
                slideEl
                    .querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
                    .forEach((subEl) => {
                    subEl.style.transitionDuration = `${duration}ms`;
                });
            });
            if (swiper.params.cubeEffect?.shadow && !swiper.isHorizontal()) {
                const shadowEl = el.querySelector('.swiper-cube-shadow');
                if (shadowEl)
                    shadowEl.style.transitionDuration = `${duration}ms`;
            }
        };
        effectInit({
            effect: 'cube',
            swiper,
            on,
            setTranslate,
            setTransition,
            recreateShadows,
            getEffectParams: () => swiper.params.cubeEffect,
            perspective: () => true,
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: true,
                resistanceRatio: 0,
                spaceBetween: 0,
                centeredSlides: false,
                virtualTranslate: true,
            }),
        });
    };

    function createShadow(suffix, slideEl, side) {
        const shadowClass = `swiper-slide-shadow${side ? `-${side}` : ''}${suffix ? ` swiper-slide-shadow-${suffix}` : ''}`;
        const shadowContainer = getSlideTransformEl(slideEl);
        const selector = `.${shadowClass.split(' ').join('.')}`;
        const existing = shadowContainer.querySelector(selector);
        if (existing)
            return existing;
        const created = createElement('div', shadowClass.split(' '));
        shadowContainer.append(created);
        return created;
    }

    const EffectFlip = ({ swiper, extendParams, on }) => {
        extendParams({
            flipEffect: {
                slideShadows: true,
                limitRotation: true,
            },
        });
        function getParams() {
            return swiper.params.flipEffect;
        }
        const createSlideShadows = (slideEl, progress) => {
            let shadowBefore = swiper.isHorizontal()
                ? slideEl.querySelector('.swiper-slide-shadow-left')
                : slideEl.querySelector('.swiper-slide-shadow-top');
            let shadowAfter = swiper.isHorizontal()
                ? slideEl.querySelector('.swiper-slide-shadow-right')
                : slideEl.querySelector('.swiper-slide-shadow-bottom');
            if (!shadowBefore) {
                shadowBefore = createShadow('flip', slideEl, swiper.isHorizontal() ? 'left' : 'top');
            }
            if (!shadowAfter) {
                shadowAfter = createShadow('flip', slideEl, swiper.isHorizontal() ? 'right' : 'bottom');
            }
            if (shadowBefore)
                shadowBefore.style.opacity = String(Math.max(-progress, 0));
            if (shadowAfter)
                shadowAfter.style.opacity = String(Math.max(progress, 0));
        };
        const recreateShadows = () => {
            // Set shadows
            const params = getParams();
            swiper.slides.forEach((slideEl) => {
                let progress = slideEl.progress ?? 0;
                if (params.limitRotation) {
                    progress = Math.max(Math.min(progress, 1), -1);
                }
                createSlideShadows(slideEl, progress);
            });
        };
        const setTranslate = () => {
            const { slides, rtlTranslate: rtl } = swiper;
            const params = getParams();
            const rotateFix = getRotateFix(swiper);
            for (let i = 0; i < slides.length; i += 1) {
                const slideEl = slides[i];
                let progress = slideEl.progress ?? 0;
                if (params.limitRotation) {
                    progress = Math.max(Math.min(progress, 1), -1);
                }
                const offset = slideEl.swiperSlideOffset ?? 0;
                const rotate = -180 * progress;
                let rotateY = rotate;
                let rotateX = 0;
                let tx = swiper.params.cssMode ? -offset - swiper.translate : -offset;
                let ty = 0;
                if (!swiper.isHorizontal()) {
                    ty = tx;
                    tx = 0;
                    rotateX = -rotateY;
                    rotateY = 0;
                }
                else if (rtl) {
                    rotateY = -rotateY;
                }
                slideEl.style.zIndex = String(-Math.abs(Math.round(progress)) + slides.length);
                if (params.slideShadows) {
                    createSlideShadows(slideEl, progress);
                }
                const transform = `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateFix(rotateX)}deg) rotateY(${rotateFix(rotateY)}deg)`;
                const targetEl = effectTarget(params, slideEl);
                targetEl.style.transform = transform;
            }
        };
        const setTransition = (duration) => {
            const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
            transformElements.forEach((el) => {
                el.style.transitionDuration = `${duration}ms`;
                el.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach((shadowEl) => {
                    shadowEl.style.transitionDuration = `${duration}ms`;
                });
            });
            effectVirtualTransitionEnd({ swiper, duration, transformElements });
        };
        effectInit({
            effect: 'flip',
            swiper,
            on,
            setTranslate,
            setTransition,
            recreateShadows,
            getEffectParams: () => swiper.params.flipEffect,
            perspective: () => true,
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: true,
                spaceBetween: 0,
                virtualTranslate: !swiper.params.cssMode,
            }),
        });
    };

    const EffectCoverflow = ({ swiper, extendParams, on }) => {
        extendParams({
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                scale: 1,
                modifier: 1,
                slideShadows: true,
            },
        });
        function getParams() {
            return swiper.params.coverflowEffect;
        }
        const setTranslate = () => {
            const { width: swiperWidth, height: swiperHeight, slides, slidesSizesGrid } = swiper;
            const params = getParams();
            const isHorizontal = swiper.isHorizontal();
            const transform = swiper.translate;
            const center = isHorizontal ? -transform + swiperWidth / 2 : -transform + swiperHeight / 2;
            const rotate = isHorizontal ? params.rotate : -params.rotate;
            const translate = params.depth;
            const r = getRotateFix(swiper);
            // Each slide offset from center
            for (let i = 0, length = slides.length; i < length; i += 1) {
                const slideEl = slides[i];
                const slideSize = slidesSizesGrid[i];
                const slideOffset = slideEl.swiperSlideOffset ?? 0;
                const centerOffset = (center - slideOffset - slideSize / 2) / slideSize;
                const offsetMultiplier = typeof params.modifier === 'function'
                    ? params.modifier(centerOffset)
                    : centerOffset * params.modifier;
                let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
                let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
                // var rotateZ = 0
                let translateZ = -translate * Math.abs(offsetMultiplier);
                let stretch = typeof params.stretch === 'string' && params.stretch.indexOf('%') !== -1
                    ? (parseFloat(params.stretch) / 100) * slideSize
                    : params.stretch;
                let translateY = isHorizontal ? 0 : stretch * offsetMultiplier;
                let translateX = isHorizontal ? stretch * offsetMultiplier : 0;
                let scale = 1 - (1 - params.scale) * Math.abs(offsetMultiplier);
                // Fix for ultra small values
                if (Math.abs(translateX) < 0.001)
                    translateX = 0;
                if (Math.abs(translateY) < 0.001)
                    translateY = 0;
                if (Math.abs(translateZ) < 0.001)
                    translateZ = 0;
                if (Math.abs(rotateY) < 0.001)
                    rotateY = 0;
                if (Math.abs(rotateX) < 0.001)
                    rotateX = 0;
                if (Math.abs(scale) < 0.001)
                    scale = 0;
                const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${r(rotateX)}deg) rotateY(${r(rotateY)}deg) scale(${scale})`;
                const targetEl = effectTarget(params, slideEl);
                targetEl.style.transform = slideTransform;
                slideEl.style.zIndex = String(-Math.abs(Math.round(offsetMultiplier)) + 1);
                if (params.slideShadows) {
                    // Set shadows
                    let shadowBeforeEl = isHorizontal
                        ? slideEl.querySelector('.swiper-slide-shadow-left')
                        : slideEl.querySelector('.swiper-slide-shadow-top');
                    let shadowAfterEl = isHorizontal
                        ? slideEl.querySelector('.swiper-slide-shadow-right')
                        : slideEl.querySelector('.swiper-slide-shadow-bottom');
                    if (!shadowBeforeEl) {
                        shadowBeforeEl = createShadow('coverflow', slideEl, isHorizontal ? 'left' : 'top');
                    }
                    if (!shadowAfterEl) {
                        shadowAfterEl = createShadow('coverflow', slideEl, isHorizontal ? 'right' : 'bottom');
                    }
                    if (shadowBeforeEl)
                        shadowBeforeEl.style.opacity = String(offsetMultiplier > 0 ? offsetMultiplier : 0);
                    if (shadowAfterEl)
                        shadowAfterEl.style.opacity = String(-offsetMultiplier > 0 ? -offsetMultiplier : 0);
                }
            }
        };
        const setTransition = (duration) => {
            const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
            transformElements.forEach((el) => {
                el.style.transitionDuration = `${duration}ms`;
                el.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach((shadowEl) => {
                    shadowEl.style.transitionDuration = `${duration}ms`;
                });
            });
        };
        effectInit({
            effect: 'coverflow',
            swiper,
            on,
            setTranslate,
            setTransition,
            perspective: () => true,
            overwriteParams: () => ({
                watchSlidesProgress: true,
            }),
        });
    };

    const EffectCreative = ({ swiper, extendParams, on }) => {
        extendParams({
            creativeEffect: {
                limitProgress: 1,
                shadowPerProgress: false,
                progressMultiplier: 1,
                perspective: true,
                prev: {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                    opacity: 1,
                    scale: 1,
                },
                next: {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                    opacity: 1,
                    scale: 1,
                },
            },
        });
        function getParams() {
            return swiper.params.creativeEffect;
        }
        const getTranslateValue = (value) => {
            if (typeof value === 'string')
                return value;
            return `${value}px`;
        };
        const setTranslate = () => {
            const { slides, wrapperEl, slidesSizesGrid } = swiper;
            const params = getParams();
            const { progressMultiplier: multiplier } = params;
            const isCenteredSlides = swiper.params.centeredSlides;
            const rotateFix = getRotateFix(swiper);
            if (isCenteredSlides) {
                const margin = slidesSizesGrid[0] / 2 - (swiper.params.slidesOffsetBefore ?? 0);
                wrapperEl.style.transform = `translateX(calc(50% - ${margin}px))`;
            }
            for (let i = 0; i < slides.length; i += 1) {
                const slideEl = slides[i];
                const slideProgress = slideEl.progress ?? 0;
                const progress = Math.min(Math.max(slideProgress, -params.limitProgress), params.limitProgress);
                let originalProgress = progress;
                if (!isCenteredSlides) {
                    originalProgress = Math.min(Math.max(slideEl.originalProgress ?? 0, -params.limitProgress), params.limitProgress);
                }
                const offset = slideEl.swiperSlideOffset ?? 0;
                const t = [
                    swiper.params.cssMode ? -offset - swiper.translate : -offset,
                    0,
                    0,
                ];
                const r = [0, 0, 0];
                let custom = false;
                if (!swiper.isHorizontal()) {
                    t[1] = t[0];
                    t[0] = 0;
                }
                let data = {
                    translate: [0, 0, 0],
                    rotate: [0, 0, 0],
                    scale: 1,
                    opacity: 1,
                };
                if (progress < 0) {
                    data = params.next;
                    custom = true;
                }
                else if (progress > 0) {
                    data = params.prev;
                    custom = true;
                }
                // set translate
                t.forEach((value, index) => {
                    t[index] = `calc(${value}px + (${getTranslateValue(data.translate[index])} * ${Math.abs(progress * multiplier)}))`;
                });
                // set rotates
                r.forEach((_value, index) => {
                    r[index] = data.rotate[index] * Math.abs(progress * multiplier);
                });
                slideEl.style.zIndex = String(-Math.abs(Math.round(slideProgress)) + slides.length);
                const translateString = t.join(', ');
                const rotateString = `rotateX(${rotateFix(r[0])}deg) rotateY(${rotateFix(r[1])}deg) rotateZ(${rotateFix(r[2])}deg)`;
                const scaleString = originalProgress < 0
                    ? `scale(${1 + (1 - data.scale) * originalProgress * multiplier})`
                    : `scale(${1 - (1 - data.scale) * originalProgress * multiplier})`;
                const opacityString = originalProgress < 0
                    ? 1 + (1 - data.opacity) * originalProgress * multiplier
                    : 1 - (1 - data.opacity) * originalProgress * multiplier;
                const transform = `translate3d(${translateString}) ${rotateString} ${scaleString}`;
                // Set shadows
                if ((custom && data.shadow) || !custom) {
                    let shadowEl = slideEl.querySelector('.swiper-slide-shadow');
                    if (!shadowEl && data.shadow) {
                        shadowEl = createShadow('creative', slideEl);
                    }
                    if (shadowEl) {
                        const shadowOpacity = params.shadowPerProgress
                            ? progress * (1 / params.limitProgress)
                            : progress;
                        shadowEl.style.opacity = String(Math.min(Math.max(Math.abs(shadowOpacity), 0), 1));
                    }
                }
                const targetEl = effectTarget(params, slideEl);
                targetEl.style.transform = transform;
                targetEl.style.opacity = String(opacityString);
                if (data.origin) {
                    targetEl.style.transformOrigin = data.origin;
                }
            }
        };
        const setTransition = (duration) => {
            const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
            transformElements.forEach((el) => {
                el.style.transitionDuration = `${duration}ms`;
                el.querySelectorAll('.swiper-slide-shadow').forEach((shadowEl) => {
                    shadowEl.style.transitionDuration = `${duration}ms`;
                });
            });
            effectVirtualTransitionEnd({ swiper, duration, transformElements, allSlides: true });
        };
        effectInit({
            effect: 'creative',
            swiper,
            on,
            setTranslate,
            setTransition,
            perspective: () => getParams().perspective,
            overwriteParams: () => ({
                watchSlidesProgress: true,
                virtualTranslate: !swiper.params.cssMode,
            }),
        });
    };

    const EffectCards = ({ swiper, extendParams, on }) => {
        extendParams({
            cardsEffect: {
                slideShadows: true,
                rotate: true,
                perSlideRotate: 2,
                perSlideOffset: 8,
            },
        });
        function getParams() {
            return swiper.params.cardsEffect;
        }
        const setTranslate = () => {
            const { slides, activeIndex, rtlTranslate: rtl } = swiper;
            const params = getParams();
            const { startTranslate, isTouched } = swiper.touchEventsData;
            const currentTranslate = rtl ? -swiper.translate : swiper.translate;
            for (let i = 0; i < slides.length; i += 1) {
                const slideEl = slides[i];
                const slideProgress = slideEl.progress ?? 0;
                const progress = Math.min(Math.max(slideProgress, -4), 4);
                let offset = slideEl.swiperSlideOffset ?? 0;
                if (swiper.params.centeredSlides && !swiper.params.cssMode) {
                    swiper.wrapperEl.style.transform = `translateX(${swiper.minTranslate()}px)`;
                }
                if (swiper.params.centeredSlides && swiper.params.cssMode) {
                    offset -= slides[0].swiperSlideOffset ?? 0;
                }
                let tX = swiper.params.cssMode ? -offset - swiper.translate : -offset;
                let tY = 0;
                const tZ = -100 * Math.abs(progress);
                let scale = 1;
                let rotate = -params.perSlideRotate * progress;
                let tXAdd = params.perSlideOffset - Math.abs(progress) * 0.75;
                const slideIndex = swiper.virtual && swiper.params.virtual?.enabled ? swiper.virtual.from + i : i;
                const isSwipeToNext = (slideIndex === activeIndex || slideIndex === activeIndex - 1) &&
                    progress > 0 &&
                    progress < 1 &&
                    (isTouched || swiper.params.cssMode) &&
                    (currentTranslate ?? 0) < (startTranslate ?? 0);
                const isSwipeToPrev = (slideIndex === activeIndex || slideIndex === activeIndex + 1) &&
                    progress < 0 &&
                    progress > -1 &&
                    (isTouched || swiper.params.cssMode) &&
                    (currentTranslate ?? 0) > (startTranslate ?? 0);
                if (isSwipeToNext || isSwipeToPrev) {
                    const subProgress = (1 - Math.abs((Math.abs(progress) - 0.5) / 0.5)) ** 0.5;
                    rotate += -28 * progress * subProgress;
                    scale += -0.5 * subProgress;
                    tXAdd += 96 * subProgress;
                    tY = `${(params.rotate || swiper.isHorizontal() ? -25 : 0) * subProgress * Math.abs(progress)}%`;
                }
                if (progress < 0) {
                    // next
                    tX = `calc(${tX}px ${rtl ? '-' : '+'} (${tXAdd * Math.abs(progress)}%))`;
                }
                else if (progress > 0) {
                    // prev
                    tX = `calc(${tX}px ${rtl ? '-' : '+'} (-${tXAdd * Math.abs(progress)}%))`;
                }
                else {
                    tX = `${tX}px`;
                }
                if (!swiper.isHorizontal()) {
                    const prevY = tY;
                    tY = tX;
                    tX = prevY;
                }
                const scaleString = progress < 0 ? `${1 + (1 - scale) * progress}` : `${1 - (1 - scale) * progress}`;
                const transform = `
        translate3d(${tX}, ${tY}, ${tZ}px)
        rotateZ(${params.rotate ? (rtl ? -rotate : rotate) : 0}deg)
        scale(${scaleString})
      `;
                if (params.slideShadows) {
                    // Set shadows
                    let shadowEl = slideEl.querySelector('.swiper-slide-shadow');
                    if (!shadowEl) {
                        shadowEl = createShadow('cards', slideEl);
                    }
                    if (shadowEl)
                        shadowEl.style.opacity = String(Math.min(Math.max((Math.abs(progress) - 0.5) / 0.5, 0), 1));
                }
                slideEl.style.zIndex = String(-Math.abs(Math.round(slideProgress)) + slides.length);
                const targetEl = effectTarget(params, slideEl);
                targetEl.style.transform = transform;
            }
        };
        const setTransition = (duration) => {
            const transformElements = swiper.slides.map((slideEl) => getSlideTransformEl(slideEl));
            transformElements.forEach((el) => {
                el.style.transitionDuration = `${duration}ms`;
                el.querySelectorAll('.swiper-slide-shadow').forEach((shadowEl) => {
                    shadowEl.style.transitionDuration = `${duration}ms`;
                });
            });
            effectVirtualTransitionEnd({ swiper, duration, transformElements });
        };
        effectInit({
            effect: 'cards',
            swiper,
            on,
            setTranslate,
            setTransition,
            perspective: () => true,
            overwriteParams: () => ({
                _loopSwapReset: false,
                watchSlidesProgress: true,
                loopAdditionalSlides: getParams().rotate ? 3 : 2,
                centeredSlides: true,
                virtualTranslate: !swiper.params.cssMode,
            }),
        });
    };

    /**
     * Swiper 14.0.0
     * Most modern mobile touch slider and framework with hardware accelerated transitions
     * https://swiperjs.com
     *
     * Copyright 2014-2026 Vladimir Kharlampidi
     *
     * Released under the MIT License
     *
     * Released on: June 26, 2026
     */


    // Swiper Class
    const modules = [
    Virtual,
      Keyboard,
      Mousewheel,
      Navigation,
      Pagination,
      Scrollbar,
      Parallax,
      Zoom,
      Controller,
      A11y,
      History,
      HashNavigation,
      Autoplay,
      Thumb,
      FreeMode,
      Grid,
      Manipulation,
      EffectFade,
      EffectCube,
      EffectFlip,
      EffectCoverflow,
      EffectCreative,
      EffectCards
    ];
    Swiper.use(modules);

    return Swiper;

})();
