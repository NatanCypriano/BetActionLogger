# Build Android APK

Este projeto usa EAS Build para gerar APK Android de distribuicao interna.

## Pre-requisitos

1. Ter uma conta Expo.
2. Ter o projeto conectado ao EAS.
3. Ter as migrations aplicadas no Supabase hospedado.
4. Ter as variaveis publicas do Supabase configuradas no ambiente `preview` do EAS.

## Variaveis de ambiente no EAS

Crie as variaveis abaixo como `Plain text` ou `Sensitive`, nunca como `Secret`, porque valores
`EXPO_PUBLIC_*` sao embutidos no app cliente:

```bash
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://seu-projeto.supabase.co" --visibility plaintext
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sua-publishable-key" --visibility plaintext
```

Nao use `service_role` nem chaves privadas no app.

## Gerar APK

Rode:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build -p android --profile preview
```

O perfil `preview` gera um arquivo `.apk`, adequado para instalar diretamente em emulador ou
aparelho fisico.

## Instalar no emulador Android

Com o emulador aberto:

```bash
npx eas-cli@latest build:run -p android --latest
```

## Instalar em aparelho fisico

1. Baixe o APK pelo link exibido ao final do build.
2. Envie o arquivo para o aparelho.
3. Abra o APK no aparelho e autorize a instalacao quando o Android pedir.

## Observacoes

- O `package` Android esta configurado como `com.natancypriano.betactionlogger`.
- O app nao movimenta dinheiro e nao acessa bancos.
- O APK contem somente variaveis publicas do Supabase.
