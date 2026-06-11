# Android production release

## Pred prvnim buildem

- Android package je `com.krejzy23.gardener`. Po prvnim uploadu na Google Play uz ho nejde menit.
- Produkcni profil v `eas.json` vytvari `.aab` soubor pro Google Play.
- Preview profil vytvari `.apk`, ktery jde nainstalovat primo do telefonu pro rychly test.
- EAS pouziva remote versioning a `production.autoIncrement`, takze `versionCode` bude ridit EAS.
- Firebase env promenne jsou nastavene v `eas.json`; pro produkcni build tedy nejsou zavisle na `.env.local`.

## Lokální kontrola

```bash
npm run verify:android
```

Kontrola spusti TypeScript a Android export. Pokud toto projde, JS bundle je pripraveny pro native build.

## Preview build pro test na telefonu

```bash
npm run build:android:preview
```

Vystupem je `.apk`. Ten se nehodi pro Google Play release, ale je idealni pro realny test notifikaci, prihlaseni a Firestore mimo Expo Go.

## Produkcni build pro Google Play

```bash
npm run build:android:production
```

Vystupem je `.aab`. Ten nahraj do Google Play Console do Internal testing.

## Submit pres EAS

Az bude v Google Play Console vytvorena aplikace a service account, muzes misto rucniho uploadu pouzit:

```bash
npm run submit:android:production
```

## Play Console checklist

- Vytvor aplikaci v Google Play Console se stejnym package name: `com.krejzy23.gardener`.
- Nahraj `.aab` nejdriv do Internal testing.
- Vypln store listing, contact email, privacy policy URL a data safety.
- Data safety zatim zahrnuje e-mail/uid pro prihlaseni a uzivatelsky zadana data o rostlinach ve Firestore.
- Appka zatim nepouziva reklamy ani analytiku.
- Pokud pozdeji pridas Google OAuth nativne, pridej do Firebase Android app package `com.krejzy23.gardener` a SHA-1/SHA-256 z EAS credentials.
