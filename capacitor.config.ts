import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.concreteflow.app',   // identificador único do app
  appName: 'ConcreteFlow',         // nome que aparece no celular
  webDir: 'out',                   // 👈 aponta para a pasta criada com `next export`
  bundledWebRuntime: false,        // mantém runtime separado
};

export default config;
