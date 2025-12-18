import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { defaultLocale, isValidLocale } from '../config/locales';
import { cookies, headers } from 'next/headers';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export default getRequestConfig(async ({ requestLocale }) => {
    // Try to get locale from next-intl's requestLocale first
    let locale = await requestLocale;
    
    // If not available, get from cookie or header (set by our custom middleware)
    if (!locale || !isValidLocale(locale)) {
        const cookieStore = await cookies();
        const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
        const headerLocale = (await headers()).get('x-locale');
        
        locale = (cookieLocale && isValidLocale(cookieLocale))
            ? cookieLocale
            : (headerLocale && isValidLocale(headerLocale))
            ? headerLocale
            : defaultLocale;
    }

    // Import all namespace files for the locale and compose into single messages object
    // Use Promise.allSettled to handle missing files gracefully
    const translationImports = await Promise.allSettled([
        import(`../../messages/${locale}/common.json`),
        import(`../../messages/${locale}/nav.json`),
        import(`../../messages/${locale}/footer.json`),
        import(`../../messages/${locale}/home.json`),
        import(`../../messages/${locale}/collection.json`),
        import(`../../messages/${locale}/product.json`),
        import(`../../messages/${locale}/cart.json`),
        import(`../../messages/${locale}/checkout.json`),
        import(`../../messages/${locale}/order.json`),
        import(`../../messages/${locale}/guide.json`),
        import(`../../messages/${locale}/policies.json`),
        import(`../../messages/${locale}/admin.json`),
        import(`../../messages/${locale}/tracking.json`),
    ]);

    // Extract successful imports, use empty object for failed ones
    const [
        common,
        nav,
        footer,
        home,
        collection,
        product,
        cart,
        checkout,
        order,
        guide,
        policies,
        admin,
        tracking,
    ] = translationImports.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            console.warn(`Failed to load translation namespace at index ${index} for locale ${locale}:`, result.reason);
            return { default: {} };
        }
    });

    return {
        locale,
        messages: {
            common: common.default,
            nav: nav.default,
            footer: footer.default,
            home: home.default,
            collection: collection.default,
            product: product.default,
            cart: cart.default,
            checkout: checkout.default,
            order: order.default,
            guide: guide.default,
            policies: policies.default,
            admin: admin.default,
            tracking: tracking.default,
        },
    };
});
