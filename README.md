# Civico

Webapp civica mobile-first per segnalazioni urbane: i cittadini segnalano disservizi (buche, lampioni, alberi, rifiuti) e fatti di sicurezza (furti, vandalismi) della propria zona, e si confermano a vicenda le segnalazioni. Dalla gente, per la gente: non dipende dal Comune.

Sito: https://alessiopesit-boop.github.io/civico-app/

> Stato: prototipo navigabile, 100% locale (nessun backend). Auth simulata, dati e preferenze in `localStorage`.

## Cosa c'e'

- Onboarding + login a tre livelli (ospite in sola lettura, base, attivo con OTP)
- Home con mappa e bottom sheet trascinabile, filtri e ordinamento del feed
- Dettaglio segnalazione con conferme, risoluzione collaborativa, timeline, "segui", flag
- Nuova segnalazione in 3 step (foto, posizione sulla mappa, descrizione), con anonimato per la sicurezza
- Mappa fullscreen, profilo, notifiche, impostazioni, info & policy, storico
- Gestione multi-zona con verifica GPS (simulata)
- PWA installabile

## Stack

Angular 21 (standalone, zoneless, signals), SCSS, Google Maps (con fallback a mappa SVG quando non c'e' la API key). Build con `@angular/build` (esbuild + vite).

## Sviluppo

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build di produzione in dist/civico-app/browser/
```

In locale la mappa usa il fallback SVG: nessuna API key necessaria.

### Google Maps (opzionale in locale)

Per la mappa reale, metti una API key della Google Maps JavaScript API in `src/environments/environment.ts` (e/o `environment.development.ts`). Restringi la key per HTTP referrer a `localhost:4200/*` e `alessiopesit-boop.github.io/*`. Senza key, l'app resta pienamente navigabile con la mappa stilizzata.

## Deploy

Pubblicazione automatica su GitHub Pages a ogni Release. Il versioning e le release sono gestiti da [release-please](https://github.com/googleapis/release-please): si mergiano PR con [Conventional Commits](https://www.conventionalcommits.org/), il bot apre la Release PR, e al merge nascono tag, GitHub Release e deploy.

Dettagli di sviluppo, convenzioni e flusso di lavoro completo: vedi [`CLAUDE.md`](./CLAUDE.md).
