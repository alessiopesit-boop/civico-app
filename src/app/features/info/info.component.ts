import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IconBtnComponent } from '../../shared/icon-btn/icon-btn.component';
import { IconComponent } from '../../shared/icon/icon.component';

type Tab = 'come' | 'regole' | 'privacy' | 'termini';

interface Section { title: string; body: string; }
interface Callout { kind: 'warn' | 'note' | 'ok'; title: string; body: string; }
type Item = (Section & { type: 'section' }) | (Callout & { type: 'callout' });

@Component({
  selector: 'cv-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconBtnComponent, IconComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
})
export class InfoComponent {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  readonly tab = signal<Tab>(this.initialTab());

  readonly tabs: { k: Tab; label: string }[] = [
    { k: 'come',    label: 'Come funziona' },
    { k: 'regole',  label: 'Regole' },
    { k: 'privacy', label: 'Privacy' },
    { k: 'termini', label: 'Termini' },
  ];

  private readonly content: Record<Tab, Item[]> = {
    come: [
      { type: 'section', title: "Cos'è Civico", body: "Civico è una rete civica fatta dai cittadini: un modo per segnalare e tenere d'occhio insieme ciò che succede nella propria zona: buche, lampioni rotti, alberi pericolanti, vandalismi, furti. Non dipendiamo dal Comune e non lo sostituiamo." },
      { type: 'section', title: 'Come si segnala', body: 'Tocca il "+" giallo, scatta una foto, scegli la categoria, posiziona il pin esatto sulla mappa, aggiungi una nota. In 30 secondi è online. Ogni segnalazione richiede un account verificato.' },
      { type: 'section', title: 'Conferme e risoluzione', body: 'Più vicini confermano una segnalazione, più peso ha. Quando almeno 5 persone (con pesi di reputazione coerenti) votano "non c\'è più", la segnalazione viene marcata come risolta. Nessun ente esterno la chiude al posto vostro.' },
      { type: 'section', title: 'Ciclo di vita', body: 'Le segnalazioni hanno una scadenza: disservizi 4 giorni, sicurezza 7 giorni, risolte 14 giorni in archivio. Ogni conferma estende la vita. Quelle senza reazioni decadono naturalmente: l\'app resta pulita, sempre.' },
      { type: 'section', title: 'Reputazione', body: 'Più segnalazioni e conferme accurate accumuli, più peso hai. I cittadini di lungo corso ("Pilastro", "Coscienza civica") contano di più nelle decisioni della community. Segnalazioni false fanno scendere il tuo peso.' },
    ],
    regole: [
      { type: 'section', title: 'Cosa puoi segnalare', body: 'Disservizi fisici della tua zona (buche, alberi, lampioni, rifiuti) e fatti di sicurezza che hai visto o subito (furti, vandalismi, scassi). Cose vere, viste, recenti.' },
      { type: 'section', title: 'Cosa non puoi segnalare', body: 'Persone (foto, nomi, dettagli identificativi), targhe, indirizzi precisi di vittime, conflitti privati, opinioni politiche, pubblicità. Le segnalazioni che violano queste regole vengono nascoste e tolgono peso al tuo account.' },
      { type: 'section', title: 'Falsi e duplicati', body: 'Tre segnalazioni di "Falsa" la mettono in revisione. Cinque la nascondono. I duplicati sono spesso uniti automaticamente. Segnalare falsamente come "falsa" è anch\'esso penalizzante.' },
      { type: 'callout', kind: 'warn', title: 'Civico non sostituisce 112, 113, 115', body: "Se è in corso un fatto pericoloso, chiama prima i numeri d'emergenza. Civico è memoria di zona: serve a vicini e Comune per capire ricorrenze, non a chiamare l'intervento." },
    ],
    privacy: [
      { type: 'section', title: 'Cosa raccogliamo', body: "Email per l'account, posizione GPS solo al momento della verifica zona (un singolo ping, non tracking continuo), foto e testi che pubblichi tu. Tutto qui." },
      { type: 'section', title: 'Cosa NON raccogliamo', body: 'Cronologia spostamenti, contatti rubrica, dati pubblicitari, profilo comportamentale. Non vendiamo i tuoi dati. Non integriamo tracker di terze parti.' },
      { type: 'section', title: 'Anonimato sulla sicurezza', body: 'Le segnalazioni di sicurezza (furti, vandalismi) sono anonime per default: i vicini non vedono il tuo nome né le tue iniziali. Puoi disattivarlo nelle impostazioni, ma è sconsigliato.' },
      { type: 'section', title: 'Cosa vedono gli altri di te', body: 'Pseudonimo (es. "Marco T."), iniziali colorate, badge raggiunti, segnalazioni pubbliche che hai aperto, conferme aggregate. Mai email, numero, indirizzo esatto.' },
      { type: 'callout', kind: 'note', title: 'Hai sempre il controllo', body: "Puoi esportare i tuoi dati, modificarli o cancellare l'account dalle impostazioni in qualsiasi momento. La cancellazione rimuove pseudonimo e collegamenti: le segnalazioni restano anonime nella memoria di zona." },
    ],
    termini: [
      { type: 'section', title: 'Responsabilità', body: 'Civico è un servizio civico volontario: pubblichiamo ciò che i cittadini segnalano, non garantiamo accuratezza, completezza o tempestività. Le decisioni di sicurezza, viabilità o legali che prendi sulla base di Civico sono tue.' },
      { type: 'section', title: 'Non sostituiamo', body: "Forze dell'ordine (112, 113), pronto soccorso (118), vigili del fuoco (115), uffici comunali, servizi tecnici della rete pubblica. Per emergenze e procedure ufficiali, rivolgiti agli enti competenti." },
      { type: 'section', title: 'Comuni e amministrazioni', body: 'Civico è indipendente. I Comuni possono richiedere una vista in sola lettura aggregata, ma non hanno poteri di moderazione né possono chiudere le segnalazioni unilateralmente: il giudizio resta della community.' },
      { type: 'section', title: 'Contenuti pubblicati', body: 'Caricando foto o testi confermi di averne il diritto e che non violano la privacy di altre persone. Civico può rimuovere contenuti che violano regole o legge italiana.' },
      { type: 'callout', kind: 'warn', title: 'Uso responsabile', body: "Civico è uno strumento di partecipazione. Non usare false identità, non incitare ad azioni illecite, non identificare individui terzi. Le segnalazioni che lo fanno vengono rimosse e l'account può essere sospeso." },
    ],
  };

  readonly items = computed<Item[]>(() => this.content[this.tab()]);

  back(): void { this.location.back(); }
  setTab(k: Tab): void { this.tab.set(k); }

  private initialTab(): Tab {
    const t = this.route.snapshot.queryParamMap.get('tab');
    if (t === 'come' || t === 'regole' || t === 'privacy' || t === 'termini') return t;
    return 'come';
  }
}
