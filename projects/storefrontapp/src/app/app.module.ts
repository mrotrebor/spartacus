import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';
import localeZh from '@angular/common/locales/zh';
import { NgModule } from '@angular/core';
import {
  BrowserModule,
  BrowserTransferStateModule,
} from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { translationChunksConfig, translations } from '@spartacus/assets';
import {
  BaseSiteService,
  BASE_SITE_CONTEXT_ID,
  ConfigModule,
  ContextServiceMap,
  CurrencyService,
  CURRENCY_CONTEXT_ID,
  FeaturesConfig,
  I18nConfig,
  LanguageService,
  LANGUAGE_CONTEXT_ID,
  OccConfig,
  provideConfig,
  RoutingConfig,
  SiteContextConfig,
  TestConfigModule,
} from '@spartacus/core';
import { configuratorTranslations } from '@spartacus/product-configurator/common/assets';
import { RulebasedConfiguratorRootModule } from '@spartacus/product-configurator/rulebased/root';
import { TextfieldConfiguratorRootModule } from '@spartacus/product-configurator/textfield/root';
import { StorefrontComponent } from '@spartacus/storefront';
import { environment } from '../environments/environment';
import { TestOutletModule } from '../test-outlets/test-outlet.module';
import { AppRoutingModule } from './app-routing.module';
import { AuxLangService } from './aux-lang.service';
import { CountryService } from './country.service';
import { CustomLanguageService } from './custom-language.service';
import { SpartacusModule } from './spartacus/spartacus.module';

registerLocaleData(localeDe);
registerLocaleData(localeJa);
registerLocaleData(localeZh);

const devImports = [];
if (!environment.production) {
  devImports.push(StoreDevtoolsModule.instrument());
}

// PRODUCT CONFIGURATOR
// TODO(#10883): Move product configurator to a separate feature module
const ruleBasedVcFeatureConfiguration = {
  productConfiguratorRulebased: {
    module: () =>
      import('@spartacus/product-configurator/rulebased').then(
        (m) => m.RulebasedConfiguratorModule
      ),
  },
};
const ruleBasedCpqFeatureConfiguration = {
  productConfiguratorRulebased: {
    module: () =>
      import('@spartacus/product-configurator/rulebased/cpq').then(
        (m) => m.RulebasedCpqConfiguratorModule
      ),
  },
};
const ruleBasedFeatureConfiguration = environment.cpq
  ? ruleBasedCpqFeatureConfiguration
  : ruleBasedVcFeatureConfiguration;
// PRODUCT CONFIGURATOR END

export function serviceMapFactory() {
  return {
    [LANGUAGE_CONTEXT_ID]: LanguageService,
    [CURRENCY_CONTEXT_ID]: CurrencyService,
    [BASE_SITE_CONTEXT_ID]: BaseSiteService,
    country: CountryService,
    auxLang: AuxLangService,
  };
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'spartacus-app' }),
    BrowserTransferStateModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    SpartacusModule,

    // PRODUCT CONFIGURATOR
    // TODO(#10883): Move product configurator to a separate feature module
    ConfigModule.withConfig({
      i18n: {
        resources: configuratorTranslations,
      },
      featureModules: {
        ...ruleBasedFeatureConfiguration,
        productConfiguratorTextfield: {
          module: () =>
            import('@spartacus/product-configurator/textfield').then(
              (m) => m.TextfieldConfiguratorModule
            ),
        },
      },
    }),
    RulebasedConfiguratorRootModule,
    TextfieldConfiguratorRootModule,
    // PRODUCT CONFIGURATOR END

    TestOutletModule, // custom usages of cxOutletRef only for e2e testing
    TestConfigModule.forRoot({ cookie: 'cxConfigE2E' }), // Injects config dynamically from e2e tests. Should be imported after other config modules.

    ...devImports,
  ],
  providers: [
    provideConfig(<SiteContextConfig>{
      context: {
        // SPIKE custom: we assume that language iso consists of 2 letters: country and auxLang
        urlParameters: ['baseSite', 'country', 'auxLang', 'currency'],
        country: ['e', 'z', 'd', 'j'],
        auxLang: ['n', 'h', 'e', 'a'],
      },
    }),
    { provide: LanguageService, useClass: CustomLanguageService },
    {
      provide: ContextServiceMap,
      useFactory: serviceMapFactory,
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    provideConfig(<OccConfig>{
      backend: {
        occ: {
          baseUrl: environment.occBaseUrl,
          prefix: environment.occApiPrefix,
        },
      },
    }),
    provideConfig(<RoutingConfig>{
      // custom routing configuration for e2e testing
      routing: {
        routes: {
          product: {
            paths: ['product/:productCode/:name', 'product/:productCode'],
            paramsMapping: { name: 'slug' },
          },
        },
      },
    }),
    provideConfig(<I18nConfig>{
      // we bring in static translations to be up and running soon right away
      i18n: {
        resources: translations,
        chunks: translationChunksConfig,
        fallbackLang: 'en',
      },
    }),
    provideConfig(<FeaturesConfig>{
      features: {
        level: '3.2',
      },
    }),
  ],
  bootstrap: [StorefrontComponent],
})
export class AppModule {}
