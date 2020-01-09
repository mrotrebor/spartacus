import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';
import localeZh from '@angular/common/locales/zh';
import { NgModule } from '@angular/core';
import {
  BrowserModule,
  BrowserTransferStateModule,
} from '@angular/platform-browser';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { translationChunksConfig, translations } from '@spartacus/assets';
import { CdsModule } from '@spartacus/cds';
import { ConfigModule, TestConfigModule } from '@spartacus/core';
import {
  B2cStorefrontModule,
  JsonLdBuilderModule,
  StorefrontComponent,
} from '@spartacus/storefront';
import { environment } from '../environments/environment';
import { TestOutletModule } from '../test-outlets/test-outlet.module';
registerLocaleData(localeDe);
registerLocaleData(localeJa);
registerLocaleData(localeZh);

const devImports = [];

if (!environment.production) {
  devImports.push(StoreDevtoolsModule.instrument());
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'spartacus-app' }),
    BrowserTransferStateModule,

    B2cStorefrontModule.withConfig({
      backend: {
        occ: {
          baseUrl: environment.occBaseUrl,
          legacy: false,
        },
      },
      context: {
        urlParameters: ['baseSite', 'language', 'currency'],
        baseSite: [
          'apparel-uk-spa',
          'electronics-spa',
          'electronics',
          'apparel-de',
          'apparel-uk',
        ],
      },

      // custom routing configuration for e2e testing
      routing: {
        routes: {
          product: {
            paths: ['product/:productCode/:name', 'product/:productCode'],
          },
        },
      },
      // we bring in static translations to be up and running soon right away
      i18n: {
        resources: translations,
        chunks: translationChunksConfig,
        fallbackLang: 'en',
      },
      features: {
        level: '1.5',
        anonymousConsents: true,
      },
    }),
    JsonLdBuilderModule,
    CdsModule.forRoot({
      cds: {
        tenant: 'htp741065159',
        baseUrl: 'https://api.eu.context.cloud.sap',
        endpoints: {
          strategyProducts:
            '/strategy/${tenant}/strategies/${strategyId}/products',
        },
        profileTag: {
          allowInsecureCookies: true,
          javascriptUrl:
            'https://tag.static.eu.context.cloud.sap/js/profile-tag.js',
          configUrl:
            'https://tag.static.eu.context.cloud.sap/config/b2497b60-3264-11ea-a3e2-0ffe0a4b6e70',
        },
      },
    }),

    TestOutletModule, // custom usages of cxOutletRef only for e2e testing
    TestConfigModule.forRoot({ cookie: 'cxConfigE2E' }), // Injects config dynamically from e2e tests. Should be imported after other config modules.

    ...devImports,
    ConfigModule,
    //note: will remove (but we do not need to setup the cds for root because we will mock the request in the e2e
  ],

  bootstrap: [StorefrontComponent],
})
export class AppModule {}
