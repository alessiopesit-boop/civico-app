# Changelog

## [0.3.0](https://github.com/alessiopesit-boop/civico-app/compare/v0.2.0...v0.3.0) (2026-06-05)


### Features

* aggancia client Supabase (wiring offline-safe) ([#15](https://github.com/alessiopesit-boop/civico-app/issues/15)) ([dc07cf7](https://github.com/alessiopesit-boop/civico-app/commit/dc07cf74763deeac15f86efe87ba7f7b3320f57f))
* auth reale via magic-link, account obbligatorio ([#26](https://github.com/alessiopesit-boop/civico-app/issues/26)) ([#17](https://github.com/alessiopesit-boop/civico-app/issues/17)) ([3cd57f6](https://github.com/alessiopesit-boop/civico-app/commit/3cd57f6601290d3158f453ca32013c111bb0e948))
* elimina account (Edge Function) ([#24](https://github.com/alessiopesit-boop/civico-app/issues/24)) ([d03e01c](https://github.com/alessiopesit-boop/civico-app/commit/d03e01c6cddd6d9cf878559353d57c50646a5608))
* foto reali delle segnalazioni (Supabase Storage) ([#23](https://github.com/alessiopesit-boop/civico-app/issues/23)) ([92002f8](https://github.com/alessiopesit-boop/civico-app/commit/92002f85ad41b9a4b2617c8a0985b507bc71dbe9))
* profili pubblici (vista limitata) ([#26](https://github.com/alessiopesit-boop/civico-app/issues/26)) ([d78360b](https://github.com/alessiopesit-boop/civico-app/commit/d78360b0fbeb42f39137896af7f42775576683c3))
* profili reali (nome, cognome puntato, età 14+) ([#18](https://github.com/alessiopesit-boop/civico-app/issues/18)) ([e0e29e6](https://github.com/alessiopesit-boop/civico-app/commit/e0e29e6ebbd3898c4cfdf338b0b085d09ae933cf))
* profilo reale + elimina segnalazione ([#22](https://github.com/alessiopesit-boop/civico-app/issues/22)) ([3a0fe38](https://github.com/alessiopesit-boop/civico-app/commit/3a0fe3806c85d0a9d850812e6271420c2af6998a))
* scadenza reale delle segnalazioni (archiviazione schedulata) ([#25](https://github.com/alessiopesit-boop/civico-app/issues/25)) ([7bee701](https://github.com/alessiopesit-boop/civico-app/commit/7bee701f6f7a0bbdf8f175818b5325fd690b1bba))
* segnalazioni reali e condivise su Supabase ([#21](https://github.com/alessiopesit-boop/civico-app/issues/21)) ([ca65a47](https://github.com/alessiopesit-boop/civico-app/commit/ca65a47a391abb65ee45ad58cb420e999f9be0f6))


### Bug Fixes

* avatar home adattivo + logout compatti rossi ([#19](https://github.com/alessiopesit-boop/civico-app/issues/19)) ([dba25aa](https://github.com/alessiopesit-boop/civico-app/commit/dba25aa020aadc5baed0d6712b2e84b911a6bd32))
* crash dettaglio su deep-link + conteggio foto onesto ([#27](https://github.com/alessiopesit-boop/civico-app/issues/27)) ([f3d7a9c](https://github.com/alessiopesit-boop/civico-app/commit/f3d7a9caf8c2caa01f65fabbfd6e1feb0f0276a8))

## [0.2.0](https://github.com/alessiopesit-boop/civico-app/compare/v0.1.0...v0.2.0) (2026-05-30)


### Features

* **map:** mappa reale Leaflet + OpenStreetMap ([#13](https://github.com/alessiopesit-boop/civico-app/issues/13)) ([d910765](https://github.com/alessiopesit-boop/civico-app/commit/d910765fe48b856878f4fe287f231b52877b7a81))
* **notifiche:** conferma prima di eliminare tutte le notifiche ([#12](https://github.com/alessiopesit-boop/civico-app/issues/12)) ([4a96821](https://github.com/alessiopesit-boop/civico-app/commit/4a9682120b59cdb5cc595b271af35ac646dc29af))
* **notifiche:** pulsante per eliminare tutte le notifiche ([#10](https://github.com/alessiopesit-boop/civico-app/issues/10)) ([e3bae72](https://github.com/alessiopesit-boop/civico-app/commit/e3bae725fb529e85f44c0edf661e1f5450ba6819))
* **ui:** mostra la versione in home e marca [dev] nel titolo ([#2](https://github.com/alessiopesit-boop/civico-app/issues/2)) ([18433ef](https://github.com/alessiopesit-boop/civico-app/commit/18433ef39480c67dd5c1beda2fa625f692e83d57))
* **ui:** via il lucchetto, FAB piu' evidente, niente layer e versione in home ([#11](https://github.com/alessiopesit-boop/civico-app/issues/11)) ([c676844](https://github.com/alessiopesit-boop/civico-app/commit/c676844b2f1c5bc2859b4fc73235340a14554001))


### Bug Fixes

* **login:** l'accesso come ospite ora entra nell'app ([#6](https://github.com/alessiopesit-boop/civico-app/issues/6)) ([0abc654](https://github.com/alessiopesit-boop/civico-app/commit/0abc6547b583df6ddd221e97c2d04ef22dec1971))
* **map:** la mappa non copre piu' header, feed e pulsanti ([#14](https://github.com/alessiopesit-boop/civico-app/issues/14)) ([97a1531](https://github.com/alessiopesit-boop/civico-app/commit/97a1531b35bf9421a54ba371106c356365b20d60))
* **ui:** freccia indietro a sinistra, ingranaggio piu' chiaro, logo torna alla home ([#9](https://github.com/alessiopesit-boop/civico-app/issues/9)) ([20f0dd7](https://github.com/alessiopesit-boop/civico-app/commit/20f0dd7193608ef8dc1c36c2f79d5db580c40754))

## 0.1.0 (2026-05-30)


### Features

* app Civico per segnalazioni urbane + setup CI/CD ([6bc461d](https://github.com/alessiopesit-boop/civico-app/commit/6bc461db146e45ee7162e8e3edc0efda496d3ec3))


### Miscellaneous Chores

* forza prima release a 0.1.0 (beta) ([f9d3aee](https://github.com/alessiopesit-boop/civico-app/commit/f9d3aee9230534657c5a2593a30606fff244ccc9))
