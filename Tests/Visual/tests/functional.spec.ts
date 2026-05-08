import { test, expect, Page } from '@playwright/test';

async function waitForSwiper(page: Page) {
    await page.waitForFunction(() => {
        const el = document.querySelector('#main') as any;
        return el && el.swiper && el.swiper.initialized && !el.swiper.animating;
    });
}

async function activeIndex(page: Page): Promise<number> {
    return page.evaluate(() => (document.querySelector('#main') as any).swiper.activeIndex);
}

async function realIndex(page: Page): Promise<number> {
    return page.evaluate(() => (document.querySelector('#main') as any).swiper.realIndex);
}

test.describe('default slider', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/Tests/Visual/fixtures/slide-default.html');
        await waitForSwiper(page);
    });

    test('starts at slide 1, activeIndex=0', async ({ page }) => {
        expect(await activeIndex(page)).toBe(0);
        await expect(page.locator('.swiper-slide-active')).toHaveText('1');
    });

    test('next button advances one slide', async ({ page }) => {
        await page.locator('#main__swiper-button-next').click();
        await waitForSwiper(page);
        expect(await activeIndex(page)).toBe(1);
        await expect(page.locator('.swiper-slide-active')).toHaveText('2');
    });

    test('prev button toggles disabled state at boundaries', async ({ page }) => {
        await expect(page.locator('#main__swiper-button-prev'))
            .toHaveClass(/swiper-button-disabled/);
        await page.locator('#main__swiper-button-next').click();
        await waitForSwiper(page);
        await expect(page.locator('#main__swiper-button-prev'))
            .not.toHaveClass(/swiper-button-disabled/);
    });

    test('pagination bullet click jumps to slide', async ({ page }) => {
        const bullets = page.locator('.swiper-pagination-bullet');
        await bullets.nth(2).click();
        await waitForSwiper(page);
        expect(await activeIndex(page)).toBe(2);
        await expect(bullets.nth(2))
            .toHaveClass(/swiper-pagination-bullet-active/);
    });

    test('pointer drag advances slide', async ({ page }) => {
        const box = (await page.locator('#main').boundingBox())!;
        const startX = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(startX, y);
        await page.mouse.down();
        await page.mouse.move(startX - 400, y, { steps: 12 });
        await page.mouse.up();
        await waitForSwiper(page);
        expect(await activeIndex(page)).toBe(1);
    });
});

test.describe('autoplay slider', () => {
    test('autoplay advances slide after delay (fake clock)', async ({ page }) => {
        await page.clock.install();
        await page.goto('/Tests/Visual/fixtures/slide-autoplay.html');
        await waitForSwiper(page);
        expect(await realIndex(page)).toBe(0);

        // Autoplay delay is 2000 ms; transition speed is 400 ms.
        await page.clock.runFor(2500);
        await waitForSwiper(page);
        expect(await realIndex(page)).toBe(1);

        await page.clock.runFor(2500);
        await waitForSwiper(page);
        expect(await realIndex(page)).toBe(2);
    });

    test('autoplay pauses on hover', async ({ page }) => {
        await page.goto('/Tests/Visual/fixtures/slide-autoplay.html');
        await waitForSwiper(page);
        await page.locator('#main').hover();
        // Give Swiper a tick to register the pointerenter handler.
        await page.waitForTimeout(50);
        const running = await page.evaluate(
            () => (document.querySelector('#main') as any).swiper.autoplay.running,
        );
        expect(running).toBe(false);
    });
});

test.describe('fade effect', () => {
    test('next button switches active slide', async ({ page }) => {
        await page.goto('/Tests/Visual/fixtures/fade.html');
        await waitForSwiper(page);
        await page.locator('#main__swiper-button-next').click();
        await waitForSwiper(page);
        expect(await activeIndex(page)).toBe(1);
        await expect(page.locator('.swiper-slide-active')).toHaveText('2');
    });
});

test.describe('coverflow effect', () => {
    test('applies 3D transforms', async ({ page }) => {
        await page.goto('/Tests/Visual/fixtures/coverflow.html');
        await waitForSwiper(page);
        const transform = await page
            .locator('.swiper-slide')
            .first()
            .evaluate(el => getComputedStyle(el).transform);
        expect(transform).toContain('matrix3d');
    });
});

test.describe('responsive breakpoints', () => {
    test('slidesPerView reacts to viewport width', async ({ page }) => {
        await page.goto('/Tests/Visual/fixtures/responsive.html');
        await waitForSwiper(page);

        // 1280x720 → 1280 breakpoint applies
        expect(
            await page.evaluate(
                () => (document.querySelector('#main') as any).swiper.params.slidesPerView,
            ),
        ).toBe(4);

        await page.setViewportSize({ width: 800, height: 720 });
        await page.evaluate(() => (document.querySelector('#main') as any).swiper.update());
        expect(
            await page.evaluate(
                () => (document.querySelector('#main') as any).swiper.params.slidesPerView,
            ),
        ).toBe(2);

        await page.setViewportSize({ width: 400, height: 720 });
        await page.evaluate(() => (document.querySelector('#main') as any).swiper.update());
        expect(
            await page.evaluate(
                () => (document.querySelector('#main') as any).swiper.params.slidesPerView,
            ),
        ).toBe(1);
    });
});