# APK для скачивания

Положите сюда собранный файл **`orenplace.apk`**.

## Сборка APK (Expo EAS)

```bash
cd mobile
npm install -g eas-cli
eas login
eas build -p android --profile production
```

После сборки скачайте артефакт с [expo.dev](https://expo.dev), переименуйте в `orenplace.apk` и скопируйте в эту папку.

Лендинг отдаёт файл по адресу: `/downloads/orenplace.apk`
