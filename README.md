# Gardener

Gardener je mobilni aplikace pro osobni evidenci a planovani pece o rostliny. Pomaha hlidat zalivku, hnojeni, stav rostlin a nadchazejici ukoly v prehlednem dashboardu, kalendari a rostlinnem deniku.

Aplikace je postavena jako Expo/React Native projekt s Firebase backendem. Data jsou oddelena podle prihlaseneho uzivatele a jazyk aplikace se automaticky prizpusobuje systemovemu nastaveni zarizeni.

## Hlavni funkce

- Prehled ukolu pro dnesek, zpozdenych ukolu a pece planovane na nejblizsi dny.
- Rostlinny denik s pridavanim, editaci, mazanim a filtrovani rostlin podle kategorie.
- Evidence detailu rostliny: pocet rostlin, vek, prostredi, svetelne podminky, zdravotni stav, typ vody, hnojivo a poznamky.
- Nastavitelne intervaly zalivky a hnojeni podle posledni a dalsi planovane pece.
- Kalendar pece se souhrnem zalivky a hnojeni pro jednotlive dny.
- Historie provedene pece a rychle oznaceni ukolu jako hotoveho.
- Lokalni notifikace pro ranni nebo vecerni pripomenuti pece.
- Prihlaseni pres Firebase Auth a ukladani dat do Cloud Firestore.
- Ceska a anglicka lokalizace s automatickym vyberem podle jazyka systemu.

## Pouzite technologie

| Oblast | Technologie |
| --- | --- |
| Mobilni framework | Expo SDK 54, React Native 0.81, React 19 |
| Jazyk | TypeScript |
| Navigace | React Navigation, bottom tabs, native stack |
| Stylovani | NativeWind, Tailwind CSS, vlastni typografie |
| Backend | Firebase Auth, Cloud Firestore |
| Perzistence v aplikaci | AsyncStorage |
| Notifikace | expo-notifications |
| Lokalizace | expo-localization, vlastni i18n provider |
| Kalendari | react-native-calendars |
| Ikony a grafika | lucide-react-native, react-native-svg |
| Build a release | EAS Build, EAS Submit |

## Struktura projektu

```text
src/
  components/     Sdilene UI komponenty
  hooks/          React contexty a datove hooky
  i18n/           Preklady a lokalizace
  lib/            Firebase inicializace
  navigation/     Spodni taby a stack navigace
  pages/          Hlavni obrazovky aplikace
  services/       Firestore, auth a notifikacni sluzby
  types/          Sdilene TypeScript typy
  utils/          Datumy, planovani pece a formatovani
```

## Lokalni vyvoj

1. Nainstaluj zavislosti:

```bash
npm install
```

2. Vytvor `.env.local` s Firebase konfiguraci:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

3. Spust Expo:

```bash
npm run start
```

Pro konkretni platformy jsou pripraveny prikazy:

```bash
npm run android
npm run ios
npm run web
```

## Kontrola a build

TypeScript kontrola:

```bash
npm run typecheck
```

Android export kontrola:

```bash
npm run verify:android
```

Preview Android build pro instalaci do telefonu:

```bash
npm run build:android:preview
```

Produkcni Android build pro Google Play:

```bash
npm run build:android:production
```

Submit pres EAS:

```bash
npm run submit:android:production
```

## Release poznamky

- Android package name: `com.krejzy23.gardener`
- iOS bundle identifier: `com.krejzy23.gardener`
- Produkcni Android profil vytvari `.aab` soubor vhodny pro Google Play.
- EAS pouziva remote versioning a `production.autoIncrement`, takze Android `versionCode` ridi EAS.
- Pred prvnim automatickym submitem pres Google Play API je potreba aplikaci minimalne jednou nahrat rucne do Play Console.

## Dokumentace

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Firebase](https://firebase.google.com/docs)
