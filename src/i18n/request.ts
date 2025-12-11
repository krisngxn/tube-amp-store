import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { isValidLocale, type Locale } from '../config/locales';

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = (await requestLocale) as string;

    if (!isValidLocale(locale)) {
        notFound();
    }

    // Import all namespace files for the locale and compose into single messages object
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
    ] = await Promise.all([
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
    ]);

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
        },
    };
});
