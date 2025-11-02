# Deep Linking / Universal Links - Configuração

Este documento descreve como configurar e usar o sistema de deep linking implementado no aplicativo Taqcare.

## ✅ O que foi implementado

### 1. Configuração do Capacitor
- ✅ Adicionado plugin `@capacitor/app` 
- ✅ Configuração atualizada em `capacitor.config.ts`
- ✅ Suporte para Android e iOS

### 2. Serviço de Deep Linking
- ✅ Criado `src/services/deepLinking.ts`
- ✅ Listener para URLs abertas via deep link
- ✅ Roteamento automático baseado no path
- ✅ Handlers customizáveis para rotas específicas

### 3. Arquivos .well-known
- ✅ `public/.well-known/assetlinks.json` para Android
- ✅ `public/.well-known/apple-app-site-association` para iOS

## 🔧 Próximos passos para finalizar

### Android - Configuração Manual Necessária

1. **Atualizar assetlinks.json**
   ```bash
   # Gerar o fingerprint SHA256 do seu certificado de assinatura
   keytool -list -v -keystore your-release-key.keystore
   ```
   
   Substitua `SHA256_FINGERPRINT_PLACEHOLDER` no arquivo `public/.well-known/assetlinks.json` pelo fingerprint real.

2. **AndroidManifest.xml** (será feito automaticamente pelo Capacitor)
   O Capacitor irá adicionar automaticamente os intent-filters necessários quando você executar `npx cap sync`.

### iOS - Configuração Manual Necessária

1. **Atualizar apple-app-site-association**
   Substitua `TEAM_ID_PLACEHOLDER` no arquivo `public/.well-known/apple-app-site-association` pelo seu Team ID da Apple Developer.

2. **Xcode Configuration**
   - Abra o projeto iOS no Xcode
   - Vá em Signing & Capabilities
   - Adicione "Associated Domains"
   - Adicione: `applinks:app.taqcare.com`

### Deploy dos arquivos .well-known

Os arquivos `.well-known` precisam estar acessíveis em:
- `https://app.taqcare.com/.well-known/assetlinks.json`
- `https://app.taqcare.com/.well-known/apple-app-site-association`

## 🧪 Como testar

### No desenvolvimento (após configuração completa):

```typescript
// Teste manual no console do navegador/app
import { deepLinkingService } from './src/services/deepLinking';

// Simular abertura de deep link
deepLinkingService.testDeepLink('https://app.taqcare.com/perfil');
deepLinkingService.testDeepLink('https://app.taqcare.com/agendamento');
deepLinkingService.testDeepLink('https://app.taqcare.com/reset-password?token=123');
```

### URLs que funcionarão:

- `https://app.taqcare.com/perfil` → `/profile`
- `https://app.taqcare.com/agendamento` → `/schedule`
- `https://app.taqcare.com/educacao` → `/education`
- `https://app.taqcare.com/loja` → `/store`
- `https://app.taqcare.com/reset-password?token=xyz` → `/reset-password?token=xyz`
- `https://app.taqcare.com/` → `/dashboard`

## 📱 Comandos para sincronizar

Após qualquer mudança relacionada a plugins nativos:

```bash
# 1. Build do projeto
npm run build

# 2. Sincronizar com plataformas nativas
npx cap sync

# 3. Abrir no IDE nativo para configurações finais
npx cap open android  # ou
npx cap open ios
```

## ⚠️ Importante

1. **Certificados**: Os fingerprints SHA256 devem corresponder exatamente aos certificados usados para assinar o app
2. **Domínio**: Os arquivos .well-known devem estar no domínio exato (`app.taqcare.com`)
3. **HTTPS**: Deep links só funcionam com HTTPS em produção
4. **Team ID**: Para iOS, use o Team ID correto da sua conta Apple Developer

## 🐛 Troubleshooting

- **Android**: Verifique se o fingerprint SHA256 está correto
- **iOS**: Verifique se o Team ID e Bundle ID estão corretos
- **Ambos**: Confirme que os arquivos .well-known estão acessíveis publicamente
- **Logs**: Verifique o console para mensagens de deep linking

```bash
# Ver logs durante desenvolvimento
npx cap run android --livereload
npx cap run ios --livereload
```