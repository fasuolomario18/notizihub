---
---

# La valeur totale bloquée en DeFi chute su le 20 principali blockchain dopo l'hack di KelpDAO

<!-- TLDR -->
La valeur totale bloquée (TVL) en DeFi ha conosciuto una baisse significativa suite al hack majore di KelpDAO, affectando le 20 principali blockchains. Cet incident ha risvegliato le crainte concernenti la sicurezza dei protocolli decentralizzati e impactato la fiducia degli investitori nell'ecosistema.
<!-- /TLDR -->

## Introduzione: quando la DeFi si scontra con la realtà della sicurezza

Il settore della finanza decentralizzata nel 2026 si presenta come maturo e strutturato. Eppure l'hack di KelpDAO, avvenuto il 18 novembre, ha frantumato questa illusione in poche ore. Circa $35 milioni in ETH e token di staking sono svaniti da un protocollo che gestiva una TVL di $1,8 miliardi, lasciando scoperto un problema che gli esperti di sicurezza blockchain considerano risolto da anni.

Quello che rende questo incidente particolarmente preoccupante non è l'entità del furto, ma il metodo: una vulnerabilità di **reentrancy attack**, lo stesso vettore che aveva già devastato TheDAO nel 2016. A una decina di anni di distanza, con le migliori pratiche di security ormai consolidate, scoprire che uno dei principali provider di liquid staking cadeva nella medesima trappola ha innescato una reazione visceralmente negativa tra gli investitori istituzionali.

La contrazione della TVL aggregata nelle 20 principali blockchain è stata immediata: **una perdita di $6,3 miliardi in 7 giorni, equivalente al 12% del valore totale bloccato in DeFi**.

## Il meccanismo dell'attacco: anatomia di una falla fatale

KelpDAO operava come **liquid staking provider**, consentendo agli utenti di depositare ETH e ricevere in cambio rsETH, un token che manteneva i diritti ai rendimenti dello staking pur permettendo ai depositanti di trasferire o prestare i fondi altrove. Un design elegante sulla carta, disastroso nei dettagli dell'implementazione.

La sequenza dell'exploit è stata lineare ma lethale:

- **Fase 1**: l'attaccante deposita una grande quantità di ETH e riceve rsETH
- **Fase 2**: richiede il rimborso di rsETH mentre il contratto intelligente elabora ancora la transazione precedente
- **Fase 3**: il codice difettoso esegue il rimborso senza verificare se i fondi erano già stati assegnati o prelevati
- **Risultato finale**: i fondi vengono trasferiti multiple volte prima che il sistema possa sincronizzarsi

Questa non è stata un'operazione improvvisata, ma un attacco sofisticato che segnala come i bad actor continuino a scavare negli strati più profondi della sicurezza dei contratti intelligenti. L'attaccante ha anche utilizzato tecniche di **sandwich trading** per mascherare i movimenti sospetti tra migliaia di transazioni legittime.

## L'onda d'urto nei principali ecosistemi blockchain

### Ethereum: epicentro del contagio

Ethereum ospita il 62% della TVL DeFi globale, circa $52 miliardi al momento dell'hack. Essendo KelpDAO costruito nativamente su Ethereum, l'impatto diretto è stato significativo.

La TVL totale su Ethereum è diminuita da $32 miliardi a $29,4 miliardi in 72 ore. I flussi di capitale si sono concentrati su Aave e Lido, con quest'ultimo che ha attratto $420 milioni di nuovi depositi nei cinque giorni seguenti l'incidente. È il classico effetto "flight to safety": quando un'opzione affidabile crolla, il capitale si concentra su ciò che percepisce come più solido, indipendentemente dai rendimenti.

Interessante notare che i protocolli di staking diversificato come **Rocketpool**, con un track record di nove anni senza vulnerabilità critiche, hanno registrato un aumento del 18% della TVL. Gli investitori hanno deliberatamente scelto rendimenti inferiori in cambio di una reputazione di sicurezza verificata nel tempo.

### Polygon e Arbitrum: l'effetto contagio sulle L2

Sebbene KelpDAO avesse una bridged version su Polygon (con $2,1 miliardi TVL), l'impatto non era diretto. Eppure il panico si è propagato anche alle layer-2, dimostrando che gli investitori valutano l'intero ecosistema DeFi come un sistema interconnesso.

Polygon ha sperimentato una contrazione del 7,2%, passando da $5,8 miliardi a $5,4 miliardi. Arbitrum ha subito una perdita del 5,8%, scendendo da $4,2 a $3,96 miliardi. Optimism, con meno esposizione ai protocolli affini a KelpDAO, ha limitato il danno al 3,1%.

### Base, Solana e gli ecosistemi alternativi

Solana, che non dipende dal modello EVM e ospita soluzioni di staking native come Marinade Finance (con auditor decentralizzato), ha registrato un calo più contenuto del 4,2%. L'assenza di vulnerabilità di tipo reentrancy nel modello di programmazione della blockchain ha giocato a favore della percezione di sicurezza.

Base ha perso il 6,1% della TVL, scendendo a $890 milioni.

## Implicazioni per la regolamentazione e la fiducia istituzionale

Questo hack ha fornito munizioni ai regolatori che chiedevano supervisione più stretta sui protocolli DeFi. L'Unione Europea, tramite il framework MiCA, sta già accelerando i tempi di implementazione di requisiti di security audit obbligatori per i provider di servizi di finanza virtuale.

I fondi istituzionali, che rappresentano il 34% della TVL DeFi secondo Glassnode, hanno iniziato a diversificare verso stablecoin e strumenti tradizionali. Alcuni hedge fund hanno pubblicamente annunciato una riduzione dell'esposizione DeFi dal 15% al 9% dei loro portafogli.

## Cosa stanno facendo i protocolli per rispondere

KelpDAO ha annunciato un piano di rimborso del 95% delle perdite utilizzando la propria treasury e i guadagni da fee accumulate. È un approccio raro nella DeFi e ha parzialmente stabilizzato la fiducia nel protocollo. Tuttavia, ciò crea un precedente problematico: se i grandi protocolli possono "socializzare le perdite", quali incentivi rimangono per auditing rigoroso?

I principali protocolli stanno ora richiedendo **multiple auditor indipendenti** prima di qualsiasi deployment di codice critico. Aave ha implementato un processo di peer review in quattro fasi con premi in Bug Bounty che raggiungono i $2 milioni per vulnerabilità critiche non rilevate durante l'audit standard.

## Domande Frequenti

**D: Quanto ha perso in totale l'ecosistema DeFi in questa crisi?**

R: La perdita diretta è stata di $35 milioni (il furto a KelpDAO), ma la perdita di valore di mercato per la contrazione della TVL nelle 20 blockchain principali è stata stimata in $6,3 miliardi. Aggiungendo il calo dei prezzi dei token nativi dei protocolli DeFi nelle 48 ore successive (Lido token è sceso del 8,3%), la perdita totale di valore è oscillata intorno ai $12-14 miliardi.

**D: KelpDAO potrebbe scomparire completamente o riuscirà a recuperare?**

R: Il protocol
