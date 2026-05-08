import { test, expect, Page } from '@playwright/test';

async function pinSlide(page: Page, index: number) {
    await page.evaluate(({ idx }) => {
        const swiper = (document.querySelector('#main') as any).swiper;
        if (swiper.autoplay) swiper.autoplay.stop();
        swiper.slideTo(idx, 0, false);
    }, { idx: index });
    await page.waitForFunction(() => {
        const s = (document.querySelector('#main') as any).swiper;
        return s && !s.animating;
    });
}

const variants: { name: string; path: string; lastIndex: number }[] = [
    { name: 'default', path: '/Tests/Visual/fixtures/slide-default.html', lastIndex: 4 },
    { name: 'fade', path: '/Tests/Visual/fixtures/fade.html', lastIndex: 4 },
    { name: 'coverflow', path: '/Tests/Visual/fixtures/coverflow.html', lastIndex: 4 },
    { name: 'responsive', path: '/Tests/Visual/fixtures/responsive.html', lastIndex: 5 },
];

for (const variant of variants) {
    test.describe(`visual — ${variant.name}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(variant.path);
            await page.waitForFunction(() => {
                const el = document.querySelector('#main') as any;
                return el && el.swiper && el.swiper.initialized;
            });
        });

        test('first slide', async ({ page }) => {
            await pinSlide(page, 0);
            await expect(page.locator('.stage')).toHaveScreenshot(
                `${variant.name}-first.png`,
            );
        });

        test('middle slide', async ({ page }) => {
            await pinSlide(page, Math.floor(variant.lastIndex / 2));
            await expect(page.locator('.stage')).toHaveScreenshot(
                `${variant.name}-middle.png`,
            );
        });

        test('last slide', async ({ page }) => {
            await pinSlide(page, variant.lastIndex);
            await expect(page.locator('.stage')).toHaveScreenshot(
                `${variant.name}-last.png`,
            );
        });
    });
}

test.describe('visual — autoplay (paused, slide 0)', () => {
    test('initial frame is stable when autoplay is stopped', async ({ page }) => {
        await page.goto('/Tests/Visual/fixtures/slide-autoplay.html');
        await page.waitForFunction(() => {
            const el = document.querySelector('#main') as any;
            return el && el.swiper && el.swiper.initialized;
        });
        await page.evaluate(() => {
            const s = (document.querySelector('#main') as any).swiper;
            s.autoplay.stop();
            s.slideToLoop(0, 0, false);
        });
        await page.waitForFunction(
            () => !(document.querySelector('#main') as any).swiper.animating,
        );
        await expect(page.locator('.stage')).toHaveScreenshot('autoplay-paused.png');
    });
});