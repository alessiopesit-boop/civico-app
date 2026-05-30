# CLAUDE.md

Istruzioni per Claude Code (e qualunque altro assistente AI compatibile) che lavora su questo repo. Questo file viene caricato automaticamente all'inizio di ogni sessione dalla root del progetto, quindi vale come "memoria di progetto" condivisa.

## Regola d'oro: tieni aggiornati CLAUDE.md e README.md

**Ogni volta che modifichi il codice in modo non banale, aggiorna anche questo file (CLAUDE.md)** se la modifica:

- introduce o rimuove una dipendenza, uno script npm, una route, una schermata, un servizio core o un componente shared;
- cambia una convenzione (naming, struttura cartelle, prefisso selettori, pattern signal/effect, persistenza in `localStorage`, ecc.);
- cambia il flusso utente principale (onboarding, login, home, dettaglio, nuova segnalazione);
- aggiunge una nuova categoria di segnalazione, palette o preferenza runtime;
- modifica il comportamento di build/dev/test o la pipeline CI/CD;
- introduce un vincolo non ovvio (workaround, bug noto, limite di un'API).

**Aggiorna anche `README.md`** quando una modifica e' significativa per chi legge il repo da fuori: nuova feature visibile, cambio di comandi (npm scripts), cambio di stack o di flusso di sviluppo, nuovo URL del sito, requisiti di setup. Il README e' la facciata pubblica del progetto, deve restare sintetico ma aggiornato.

Se la modifica e' una piccola correzione (typo, refactor locale, rinomina di una variabile privata, fix CSS puntuale), **non** serve aggiornare ne' CLAUDE.md ne' README. In dubbio: aggiorna CLAUDE.md (interno) e valuta se anche README (esterno).

Aggiornare significa: modificare la sezione gia' esistente che descrive l'area toccata. Non aggiungere log di modifiche o changelog qui, il `git log` (e `CHANGELOG.md` generato da release-please) sono l'unica fonte di verita' per la cronologia.

### Checkpoint obbligatorio prima di ogni PR (per l'assistente AI)

**Prima di aprire una PR (e a fine di ogni task), l'assistente DEVE eseguire questo controllo, non saltarlo:**

1. Rileggi il diff completo della PR (`git diff origin/main`).
2. Chiediti, voce per voce dei criteri qui sopra: questo diff tocca qualcosa che CLAUDE.md o README descrivono (stack, dipendenze, script npm, route, schermate, servizi core, convenzioni, flusso utente, build, feature visibili, vincoli)?
3. Se si': aggiorna i file di doc interessati **nella stessa PR** (stesso commit/branch), modificando la sezione esistente che descrive l'area. Non rimandare a una PR separata: la doc viaggia col codice che la rende vera.
4. Se no (fix banale: typo, refactor locale, CSS puntuale): nessun aggiornamento, e puoi procedere.

Errore tipico da evitare: aprire la PR di codice e "poi aggiorno la doc". La doc va nella PR che la causa. In caso di dubbio se una modifica al README sia dovuta, aggiornala: meglio una riga in piu' nella facciata pubblica che un README falso.

## Cos'e' il progetto

Civico e' una webapp civica mobile-first (dark theme) per segnalazioni urbane: i cittadini segnalano disservizi (buche, alberi pericolanti, lampioni rotti, rifiuti) e fatti di sicurezza (furti auto, furti in casa, vandalismi) della propria zona, e si confermano a vicenda le segnalazioni. Il modello mentale: Citizen.com per l'estetica della mappa, FixMyStreet per la logica civica, ma con tono costruttivo e collettivo ("dalla gente, per la gente"), non dipendente dal Comune.

Stato attuale: **prototipo navigabile 100% locale**, nessun backend. Tutta la persistenza (auth simulata, preferenze, zone, stato segnalazioni della sessione) vive in `localStorage`. La mappa usa **Google Maps** quando e' configurata una API key, altrimenti ripiega su una mappa stilizzata SVG locale.

Flusso utente: Onboarding (primo accesso) -> Login (ospite / base / attivo) -> Home (mappa + bottom sheet trascinabile col feed) -> Dettaglio segnalazione, Nuova segnalazione (3 step), Mappa fullscreen, Profilo, Notifiche, Impostazioni, Info & policy, Storico, gestione Zone (aggiungi / gestisci / verifica GPS).

Tre livelli di account (simulati): **ospite** (sola lettura), **base** (email/Google, no OTP), **attivo** (cellulare verificato via OTP: puo' segnalare e confermare). Le segnalazioni di sicurezza sono anonime per default. La risoluzione e' collaborativa: a `RESOLUTION_GOAL` (5) conferme di "non c'e' piu'" la segnalazione si chiude.

## Stack

- **Angular 21.2+**, standalone components (mai NgModules), `ChangeDetectionStrategy.OnPush` ovunque, **zoneless change detection** (`provideZonelessChangeDetection`).
- **Signals** (`signal`, `computed`, `effect`) per tutto lo stato reattivo. Niente NgRx. RxJS solo come dipendenza implicita del Router.
- **Parametri di route via input signal**: `provideRouter(routes, withComponentInputBinding())`, e nei componenti si legge il path param con `input.required<string>()` (es. `DetailComponent.id`, `VerifyZoneComponent.id`). Niente `ActivatedRoute.snapshot` se non per i query param (vedi `InfoComponent`, che legge `?tab=`).
- **Routing**: `provideRouter` con path location standard (no `#` nelle URL). Lazy `loadComponent` per ogni schermata. Guard in `core/guards.ts`. Su GitHub Pages il refresh diretto su una route deep funziona via `public/404.html`: salva il path in `sessionStorage` (chiave `civico-redirect`) e redirige a `/civico-app/`; lo script in `src/index.html` lo ripristina via `history.replaceState` prima del bootstrap.
- **Styling**: **SCSS**. Token di design globali in `src/styles/_tokens.scss` (palette, font, spacing, custom properties `--cv-*`), piu' `_animations.scss` e `_mixins.scss`, tutti importati da `src/styles.scss`. Ogni componente ha il suo SCSS scoped (inline `styles: []` per i piccoli, file `.component.scss` per i grandi). Font **Manrope** da Google Fonts. Niente librerie UI esterne.
- **Mappa**: `@angular/google-maps` + `@types/google.maps`. La JS API di Google Maps viene caricata a runtime da `GoogleMapsLoaderService` leggendo la key da `src/environments/environment.ts`. Senza key, l'app usa il fallback SVG (`MapBackgroundComponent` + `MapPinComponent`). Vedi sezione "Google Maps".
- **Build/test**: builder `@angular/build` (esbuild + vite dev server). Vitest e' presente come devDep ma non ci sono spec; `tsconfig.spec.json` resta placeholder.
- **Niente lint configurato**. Prettier presente come devDep (`.prettierrc`), usato come default editor, non invocato da CI.
- **Backend**: nessuno. App 100% locale. Se in futuro arriva auth/sync reale (es. Firebase), va documentata una sezione dedicata qui e in README, e va aggiornata la "Regola d'oro".

## Struttura

```
src/
  index.html                 # base href, Google Fonts (Manrope), restore SPA, registrazione service worker
  main.ts                    # bootstrap standalone
  styles.scss                # entrypoint stili globali (importa i partial sotto)
  styles/
    _tokens.scss             # design token come custom properties --cv-* (palette, font, layout)
    _animations.scss         # keyframes condivisi (toast, sheet, pulse, spin)
    _mixins.scss             # mixin SCSS (no-scrollbar, reset-button, truncate)
  environments/
    environment.ts           # config production (Google Maps key, centro/zoom default)
    environment.development.ts # config dev (key vuota -> fallback SVG)
  app/
    app.config.ts            # provideRouter(withComponentInputBinding) + provideZonelessChangeDetection
    app.routes.ts            # tabella route (lazy) + guard
    app.ts                   # root component: monta <cv-app-shell/>
    core/
      models.ts              # tipi: Report, Pin, Zone, Category*, UserType, SortKey, IconName, ...
      data.ts                # dati seed: CATS, USERS, PINS, SEED_REPORTS, BADGES, SEED_ZONES, SEED_NOTIFICATIONS, RESOLUTION_GOAL
      utils.ts               # parseHours, sortReports, timeVerb, reportLifecycle
      persisted-signal.ts    # helper: signal sincronizzato con localStorage (try/catch)
      auth.service.ts        # AuthService (onboarded/authed/identity/userType)
      settings.service.ts    # SettingsService (pinStyle/showPhoto/privacy/notifiche/polso)
      data.service.ts        # DataService (reports/pins/notifiche/zone, filtri+sort, mutazioni)
      toast.service.ts       # ToastService (toast transitorio)
      google-maps-loader.service.ts # carica la JS API di Google Maps a runtime
      guards.ts              # onboardingGuard, onboardingScreenGuard, loginScreenGuard
      build-info.ts          # APP_VERSION + BUILD_CONTEXT + BUILD_SHA (dev)
      build-info.prod.ts     # variante production via fileReplacements
    shared/                  # componenti UI condivisi, standalone, selettore cv-*
      icon/                  # cv-icon (tutte le icone SVG in un solo componente via @switch)
      avatar/ wordmark/ location-chip/ icon-btn/ category-badge/ photo/
      app-shell/             # cornice (desktop fake-frame / mobile fullscreen) + router-outlet + toast
      toast/ screen-header/
      map-background/ map-pin/  # fallback mappa SVG
      google-map/            # cv-google-map (wrapper Google Maps JS API + stile dark)
      report-card/ polso-card/
    features/                # una cartella per schermata: <nome>/<nome>.component.{ts,html,scss}
      onboarding/ login/ add-phone/
      home/                  # + zone-picker-sheet.component.ts
      detail/ new-report/ map-fullscreen/
      notifications/ profile/ settings/ info/ storico/
      zones/                 # manage-zones / add-zone / verify-zone
scripts/
  write-build-sha.mjs        # genera src/app/core/build-sha.local.ts (npm hook)
.github/
  workflows/release.yml      # release-please
  workflows/deploy.yml       # deploy GitHub Pages su release published
  scripts/release-notes.py   # compone le release notes "In sintesi + Dettagli"
public/
  404.html                   # SPA fallback per Pages
  manifest.webmanifest sw.js icon.svg  # PWA installable
```

### Convenzioni

- **Selettori**: prefisso `cv-` (configurato in `angular.json`, `prefix: "cv"`). Mantienilo. Es. `cv-home`, `cv-icon`, `cv-report-card`.
- **Componenti**: standalone, `ChangeDetectionStrategy.OnPush`. Naming **con suffisso** `.component.ts` e classe con suffisso `Component` (es. `home.component.ts` / `home.component.html` / `home.component.scss`, classe `export class HomeComponent`). I componenti piccoli tengono template e stili inline; quelli grandi usano `templateUrl` + `styleUrl`.
- **Lazy loading** di ogni schermata via `loadComponent: () => import(...)`. Quando aggiungi una pagina segui lo stesso pattern in `app.routes.ts`.
- **Input/Output**: API signal-based (`input()`, `input.required()`, `output()`, `model()`), niente decoratori `@Input()/@Output()`. Anche i path param di route arrivano come `input()` grazie a `withComponentInputBinding()`.
- **Reattivita'**: solo signals e computed. Niente RxJS nella logica di stato.
- **Stato globale**: signal dentro un service `@Injectable({ providedIn: 'root' })`. Side-effect (DOM, localStorage) via `effect` in costruttore o via `persistedSignal`. Vedi `AuthService`, `DataService`, `SettingsService` come modello.
- **Persistenza `localStorage`**: **solo** tramite l'helper `persistedSignal(key, initial)` (`core/persisted-signal.ts`), che fa lettura iniziale + scrittura automatica via `effect`, tutto dentro `try/catch`. Chiavi sempre con prefisso `civico.` (es. `civico.onboarded`, `civico.authed`, `civico.userType`, `civico.zones`, `civico.activeZone`, `civico.pinStyle`, `civico.filter`, `civico.sort`). Niente `localStorage` diretto nei componenti.
- **Icone**: tutte centralizzate in `cv-icon` (`shared/icon/icon.component.html`, un grande `@switch` sul nome). Per aggiungere un'icona: nuovo `@case` nel template + nuovo valore nel tipo `IconName` in `core/models.ts`. Non creare SVG inline sparsi nei componenti (eccezione: loghi/illustrazioni una-tantum come il logo Google nel login).
- **Dati seed**: `core/data.ts`. I `CategoryKey` (`buca`, `furtoAuto`, ...) sono id stabili: rinominarli e' breaking (vivono dentro lo stato persistito). Estendere i tipi e' OK.
- **Stili dei componenti**: usa i token `--cv-*` definiti in `styles/_tokens.scss` (mai colori hardcoded che li duplicano). I keyframe condivisi stanno in `_animations.scss`.

### Servizi core (cosa fanno)

- `AuthService` (`core/auth.service.ts`): signal persistiti `onboarded`, `authed`, `identity` (quale persona/avatar), `userType` (`'guest' | 'base' | 'active'`). `computed` `phoneVerified`/`canParticipate`. Metodi `setUserType`, `finishOnboarding`, `loginAs`, `logout`, `resetAll`.
- `DataService` (`core/data.service.ts`): cuore dei dati. Signal `reports`, `pins`, `notifications`; `filter`/`sort` persistiti; `computed` `visibleReports`, `visiblePinIds`, `activeCount`, `unreadNotificationsCount`. Gestione zone (`zones`, `activeZoneId`, `activeZone`, `addZone`/`removeZone`/`updateZone`/`verifyZone`/`setZoneRole`). Mutazioni segnalazioni: `confirm`, `toggleFollow`, `flag`, `addReport`, `markAllNotificationsRead`.
- `SettingsService` (`core/settings.service.ts`): preferenze persistite (`pinStyle`, `showPhoto`, `privacyAnonDefault`, `notificationsPush`, `polsoDismissedAt`).
- `ToastService` (`core/toast.service.ts`): toast transitorio (`show(message, kind, durationMs)`), un signal `current` letto da `cv-toast`.
- `GoogleMapsLoaderService` (`core/google-maps-loader.service.ts`): inietta lo script della JS API di Google Maps a runtime usando `environment.googleMaps.apiKey`; signal `state` (`idle | loading | ready | disabled | error`). `disabled` quando la key e' vuota: la UI usa allora il fallback SVG.
- Guard (`core/guards.ts`): `onboardingGuard` (richiede onboarded + authed, applicata alle schermate dell'app), `onboardingScreenGuard` e `loginScreenGuard` (saltano le rispettive schermate se gia' superate). Da ricordare quando aggiungi una route.

### Build info (dev vs release)

`core/build-info.ts` espone `APP_VERSION` (da `package.json`), `BUILD_CONTEXT` (`'dev'` / `'release'`), `BUILD_SHA` (hash short, solo in dev). La versione e' mostrata in tre punti, tutti con la stessa logica (`v0.1.0` in release, `v0.1.0 · dev · abc1234` in dev):

- in fondo al feed della **Home** (`HomeComponent.buildLabel`, classe `.home-version`);
- nella riga versione in fondo a **Impostazioni** (`SettingsComponent.buildLabel`);
- nel **titolo della scheda** del browser: in dev `app.ts` prefissa `[dev] ` davanti a "Civico" (in release resta "Civico").

Meccanismo (identico nello spirito a come si gestisce la versione altrove):

- `build-info.ts` (committato): importa `BUILD_SHA` da `build-sha.local.ts` e `version` da `package.json`. `BUILD_CONTEXT = 'dev'`.
- `build-info.prod.ts` (committato): sostituisce `build-info.ts` in configuration `production` via `fileReplacements` di `angular.json`. Non importa il file local-only, `BUILD_CONTEXT = 'release'`, `BUILD_SHA = ''`.
- `build-sha.local.ts` (gitignored): solo `export const BUILD_SHA = '<sha>'`. Autogenerato da `scripts/write-build-sha.mjs` ad ogni `npm install`/`start`/`build` (hook `postinstall`/`prestart`/`prebuild`). Senza git, fallback `'unknown'`.

Se modifichi questa logica: `build-info.prod.ts` deve esistere e avere la stessa shape esportata, altrimenti il build di produzione fallisce. Serve `resolveJsonModule: true` in `tsconfig.json` per importare `version` da `package.json`.

## Google Maps

La mappa reale usa la JS API di Google Maps; senza key l'app funziona lo stesso con la mappa stilizzata SVG.

- La key vive in `src/environments/environment.ts` (production) e `environment.development.ts` (dev, lasciata **vuota** apposta cosi' in locale si usa il fallback SVG e non si consuma quota). `angular.json` fa `fileReplacements` di `environment.ts` con `environment.development.ts` in configuration `development`.
- `GoogleMapsLoaderService.load()` inietta lo script `maps.googleapis.com/maps/api/js` con la key e la libreria `marker`. Se la key e' vuota, ritorna subito `disabled`.
- I componenti che mostrano mappe (`HomeComponent`, `MapFullscreenComponent`, e i mini-map di dettaglio/nuova segnalazione) controllano lo stato del loader: se `ready` montano `cv-google-map`, altrimenti `cv-map-background` + `cv-map-pin`.
- I `Pin` (`core/data.ts`) hanno sia `xp`/`yp` (percentuali, per il fallback SVG) sia `lat`/`lng` (derivate, centrate su Trastevere/Roma) per i marker Google.
- **Restringi sempre la key** (Cloud Console -> Credentials -> HTTP referrers): `localhost:4200/*` e `alessiopesit-boop.github.io/*`. La key di una JS API e' pubblica per natura (gira nel browser), la restrizione referrer e' la vera protezione contro l'abuso di quota.
- Lo stile dark della mappa e' in `shared/google-map/google-map-dark-style.ts`.

## Comandi

```bash
npm start          # ng serve, dev server su http://localhost:4200 (mappa = fallback SVG salvo key in environment.development.ts)
npm run build      # build di produzione in dist/civico-app/browser/
npm run watch      # build dev con --watch
npm test           # vitest (nessuna spec custom presente)
```

Gli hook `prestart`/`prebuild`/`postinstall` lanciano `scripts/write-build-sha.mjs` (per questo si usa `npm run build`, non `npx ng build`: serve a generare `build-sha.local.ts`). Non e' configurato `ng e2e`, non c'e' lint.

## Branching e Pull Request

Flow stile GitHub Flow: niente push diretti su `main`, tutto passa da una PR (eccezione: il commit iniziale di bootstrap del repo).

### Branch

Crea sempre un branch dal `main` aggiornato. Prefissi convenzionali (orientamento, nessuna validazione automatica):

- `feat/<slug>`: feature nuova rivolta all'utente.
- `fix/<slug>`: bugfix.
- `chore/<slug>`: lavori interni (build, CI, dipendenze, riordino).
- `docs/<slug>`: modifiche solo a documentazione (incluso CLAUDE.md).
- `refactor/<slug>`: refactor a comportamento invariato.

Esempi: `feat/detail-share`, `fix/sheet-drag-edge`, `chore/bump-actions`.

### Scope di una PR

**Una PR copre uno scope logico.** Due bug non correlati, anche piccoli, vanno in due PR separate. Regola pratica: se lo `scope` del Conventional Commit dovrebbe essere diverso tra una modifica e l'altra, sono due PR (es. `fix(home):` + `fix(detail):` non si bundlano).

Eccezione: ritocchi adiacenti che condividono lo stesso "perche'" possono stare in una sola PR (es. una pass di responsiveness mobile che tocca quattro schermate ha un solo motivo). PR piccole e mono-scope sono piu' rapide da revieware, piu' facili da rollbaccare e generano release notes piu' pulite.

### Commit: Conventional Commits + body discorsivo

Tutti i commit (e i titoli delle PR) seguono [Conventional Commits](https://www.conventionalcommits.org/).

- Il **subject** e' la riga breve e tecnica, formato `tipo(scope opzionale): cosa`. Serve a release-please per il bump version e per il bullet nell'indice della Release.
- Il **body** e' una **descrizione user-facing breve, 1-2 frasi**, dal punto di vista di chi usa l'app (non dello sviluppatore). Niente nomi di file, regole CSS, signal/effect, jargon tecnico a meno che non sia il punto. Compare nella sezione "Dettagli" della Release.

Anti-esempi di body troppo tecnici:

- NO: `Sostituito flex-wrap: nowrap con wrap nelle media query a 640px su .feed.`
- SI: `Su mobile le card del feed ora vanno a capo invece di scrollare fuori schermo.`

**Niente hard-wrap a 72 caratteri** nel body: GitHub Flavored Markdown rende ogni newline singolo come `<br>` nelle Release. Scrivi una frase per riga lunga e separa i paragrafi con una riga vuota. (`release-notes.py` ricongiunge comunque i wrap con `unwrap_paragraphs()`, ma meglio non spezzarle alla fonte.)

Tipi e mapping:

| Tipo | Bump | Appare nella Release? | Etichetta |
|---|---|---|---|
| `feat:` | MINOR | si | Novita' |
| `fix:` | PATCH | si | Correzioni |
| `perf:` | PATCH | si | Performance |
| `refactor:` | PATCH | si | Refactor |
| `chore:` / `docs:` / `test:` / `ci:` / `build:` / `style:` | nessuno | no | (storia git) |
| `feat!:` o `BREAKING CHANGE:` nel body | MAJOR | si, in cima | Modifiche incompatibili |

Body **consigliato sempre** per `feat:`, `fix:`, `perf:`, `refactor:`. Se manca, il workflow usa come fallback il subject ripulito e capitalizzato.

### Merge: squash sempre

Strategia per le PR: **Squash and merge**.

- Il **titolo della PR** = subject del commit squashato = Conventional Commit. release-please lo legge da li'.
- Il **body della PR** = body del commit squashato = descrizione discorsiva. La Release lo prende da qui.

Quindi cura titolo **e** descrizione della PR: insieme diventano il commit, da cui release-please costruisce la release.

### Pulizia branch dopo il merge

Il branch remoto viene cancellato in automatico (setting `delete_branch_on_merge`). Lato locale ogni tanto ripulisci:

```bash
git fetch --prune
git branch | grep -vE '^\*|main$' | xargs -r git branch -D
```

Il `-D` (maiuscolo) serve perche' lo squash merge non lascia una merge-base diretta.

## Versioning

Schema [SemVer](https://semver.org): `MAJOR.MINOR.PATCH`. Fonte di verita': il campo `version` in `package.json` (e `.release-please-manifest.json`). Da li' la riga versione in Impostazioni la legge a build-time.

### Rilascio: lo fa release-please, non tu

Il rilascio e' automatizzato dal workflow `.github/workflows/release.yml` ([release-please](https://github.com/googleapis/release-please)). **La Release PR non la apri tu**, te la trovi gia' aperta dal bot, e **il numero di versione lo calcola il bot** dai tipi dei commit dopo l'ultimo tag (`fix:` => PATCH, `feat:` => MINOR, `BREAKING CHANGE` => MAJOR).

In pratica:

1. Mergi su `main` un commit `feat:` o `fix:`.
2. `release.yml` parte ad ogni push su `main`. release-please apre/aggiorna una PR `chore(main): release X.Y.Z` con bump di `package.json`/manifest e aggiornamento `CHANGELOG.md`. Uno step del workflow riscrive il body della Release PR nello stile "In sintesi + Dettagli".
3. La Release PR resta aperta e si auto-aggiorna a ogni nuovo commit rilasciabile.
4. **La tua unica decisione e' quando rilasciare**: mergi la Release PR. Solo allora release-please crea il tag (`vX.Y.Z`) e la GitHub Release; lo step finale riscrive il body in "In sintesi" (indice) + "Dettagli" (descrizioni). La logica e' in `.github/scripts/release-notes.py`.

`chore:`/`docs:`/`ci:`/`test:`/`build:`/`style:` non bumpano e non appaiono nelle note (ma vengono comunque mergiati). Serve almeno un `fix:`/`feat:`/`perf:` perche' la Release PR si apra.

**Non** modificare a mano `package.json`, `CHANGELOG.md`, ne' creare tag git: gestisce tutto release-please. Per forzare una versione: commenta `Release-As: X.Y.Z` nella Release PR.

Tag: prefisso `v` (`v0.1.0`).

## Deploy: GitHub Pages

Pubblicazione su `https://alessiopesit-boop.github.io/civico-app/` via GitHub Actions, workflow `.github/workflows/deploy.yml`.

**Trigger: solo Release pubblicata** (`on: release: types: [published]`). Quando mergi la Release PR nasce un tag + GitHub Release, e quell'evento fa partire il deploy. **I merge su `main` da soli non vanno live**: scelta deliberata, cosi' il sito in produzione coincide sempre con un tag e la versione mostrata e' sempre vera. `workflow_dispatch` resta come fuga di sicurezza per pubblicare a mano l'ultimo `main` (demo).

Cose da sapere se lo modifichi:

- Build con `--base-href=/civico-app/`: il sito vive su un sottopath di `*.github.io`. Se cambia il nome del repo, aggiorna qui (e in `public/404.html`, `manifest.webmanifest`, `sw.js`).
- Il workflow chiama `npm run build` (non `npx ng build`) per attivare lo step `prebuild` che scrive `build-sha.local.ts`.
- Output del builder `@angular/build` in `dist/civico-app/browser/`: e' la cartella caricata come artifact Pages.
- `public/404.html`: fallback SPA. Pages lo serve per ogni path inesistente, lui salva `location.pathname+search+hash` in `sessionStorage.civico-redirect` e redirige a `/civico-app/`; `src/index.html` ripristina l'URL prima del bootstrap. Cosi' i deep link (`/civico-app/detail/1`) funzionano al refresh.
- `.nojekyll` (vuoto, alla root) impedisce a Pages di processare i file via Jekyll.

### Setup una-tantum del repo (manuale, da fare al primo giro)

1. **`RELEASE_PLEASE_TOKEN`**: crea un PAT fine-grained dell'account `alessiopesit-boop` con permessi `Contents: write` + `Pull requests: write` sul repo `civico-app`, e aggiungilo come **Actions secret** `RELEASE_PLEASE_TOKEN`. Serve perche' la Release pubblicata da release-please propaghi l'evento `release: published` a `deploy.yml` (col `GITHUB_TOKEN` di default GitHub blocca la propagazione, anti-loop). Senza questo secret il job `release-please` fallisce.
2. **Pages**: *Settings > Pages > Source = GitHub Actions* (una volta sola).
3. **Environment `github-pages`**: di default consente deploy solo da `main`, ma `deploy.yml` parte dal tag `vX.Y.Z`. Aggiungi una deployment branch policy `name: v*`, `type: tag` (*Settings > Environments > github-pages*, oppure `gh api -X POST repos/alessiopesit-boop/civico-app/environments/github-pages/deployment-branch-policies -f name='v*' -f type='tag'`). Senza, il job `deploy` fallisce con "not allowed to deploy ... environment protection rules".
4. **Merge settings**: squash-only, `Automatically delete head branches`, branch protection su `main`. Applicabili via `gh api` (richiede `Administration: write` sul PAT).

## PWA (installable)

L'app e' installabile ("Aggiungi a schermata home"):

- `public/manifest.webmanifest`: name/short_name `Civico`, scope e start_url `/civico-app/`, display `standalone`, theme/background `#0F1115`, icona `icon.svg`.
- `public/icon.svg`: il wordmark Civico (tre blocchi ambra/bianco/verde su fondo scuro). **TODO**: per il massimo supporto cross-browser e per un eventuale wrapping TWA servono icone raster PNG 192x192 e 512x512 (any + maskable); ora si usa l'SVG, che Chrome moderno accetta per l'installabilita'.
- `public/sw.js`: service worker network-first con fallback cache (`civico-shell-v1`). Registrato in `src/index.html`, **skip su localhost** per non interferire col live reload di `ng serve`.

Android / Google Play (TWA): non configurato. Possibile sviluppo futuro (richiederebbe icone PNG, keystore, account Play, secrets dedicati). Per ora fuori scope.

## Vincoli e cose da non fare

- **Non** introdurre RxJS observable per lo stato applicativo: usa signal/computed/effect. RxJS resta ammesso solo dove serve a integrare API Angular che lo richiedono.
- **Non** rimuovere lo script SPA-fallback in `src/index.html` ne' lo script di `public/404.html` senza un'alternativa al routing path-location: rompe il refresh diretto sulle route deep su Pages.
- **Non** bypassare `persistedSignal` con scritture dirette a `localStorage`: passa sempre dai service (`AuthService`, `DataService`, `SettingsService`) e dal prefisso `civico.`.
- **Non** introdurre librerie UI esterne (Material, PrimeNG, Tailwind): il design system (token `--cv-*` + componenti shared) e' gia' coerente.
- **Non** hardcodare colori della palette nei componenti: usa le custom properties `--cv-*` di `styles/_tokens.scss`.
- **Non** committare la Google Maps API key di produzione in chiaro se un domani diventa sensibile (oggi e' una JS key pubblica restritta per referrer: ok in `environment.ts`). Service account o segreti veri vanno in `.gitignore`/secrets.
- **Non** rimuovere `.nojekyll` o cambiare `base-href` in `deploy.yml` senza aggiornare anche `404.html`, `manifest.webmanifest`, `sw.js`.
- **Non** committare `dist/`, `node_modules/`, `.angular/cache`, ne' `build-sha.local.ts` (gia' in `.gitignore`).
- **Non** modificare a mano `package.json`/`CHANGELOG.md`/tag: e' lavoro di release-please.

## Quando aggiungi una pagina nuova

1. Crea `src/app/features/<nome>/<nome>.component.ts` (+ `.html`/`.scss` se grande) come standalone, `OnPush`, selettore `cv-<nome>`, classe `export class <Nome>Component`.
2. Aggiungi la route in `src/app/app.routes.ts` con `loadComponent` e (quasi sempre) `canActivate: [onboardingGuard]`. Se deve essere accessibile prima del login (es. `/onboarding`, `/login`), usa il guard giusto o nessuno.
3. Se la pagina riceve un path param, leggilo come `input.required<string>()` (grazie a `withComponentInputBinding`).
4. Se serve un link da un'altra schermata, aggiorna il componente che lo espone.
5. Riusa i componenti shared (`cv-screen-header`, `cv-icon`, `cv-icon-btn`, ...) e i token `--cv-*`.
6. **Aggiorna questo file** se la pagina introduce un nuovo concetto (categoria di pagina, dipendenza, pattern, servizio).

## Note operative per l'assistente

- Quando ti viene chiesto di "fare X" rispondi in italiano (il proprietario lavora in italiano).
- Niente em-dash (`—`) e niente freccia (`→`) nei file di questo repo, ne' nei messaggi: usa virgole, due punti, parentesi, o parole ("a", "verso", "diventa").
- Prima di marcare un task come finito, lancia `npm run build` (o almeno `npm start` e controlla la console) per essere sicuro che compili.
- Le azioni che toccano stato remoto/condiviso (push, `gh pr create`, merge, deploy, config repo) vanno proposte e confermate, non eseguite di slancio, salvo via libera esplicito.
