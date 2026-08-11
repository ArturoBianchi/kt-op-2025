## CARDS
### OVERVIEW
L idea e' di fattorizzare la parte di design in comune, realizzando una classe capace di leggere
i dati delle carte da file json. Ogni sottoclasse specifichera' da quale file json leggere i dati.
Ogni sottoclasse aggiungera eventuali componenti di design specifici, come ad esempio il colore di sfondo, etc.

Le carte si suddividono in due categorie:
- CRIT OP
- TAC OP

#### CRIT OP  
Ogni crit op e' caratterizzata da un numero identificativo, da 1 a N, seguito da un titolo.
Ogni carta e'composta da:
1. Sezione regole aggiuntive
2. Sezione con mission action (che possono essere da 0 ad N)
3. Sezione punti vittoria

#### TAC OP
Ogni carta e'composta da:
1. Archetipo
2. Nome
3. Rivela
4. Mission Action
5. Punti vittoria

### Project Structure
- `vue-project/src/configurations/cards/`: path per i file json di configurazione delle carte
- 
### REQUIREMENTS
- **JSON CONFIG**: definire struttura dati per le carte
- **CONFIGURATIONS**: creare path per i file json di configurazione, con sottocartella specifica per le carte
- **GENERIC CARD CLASS**: creare classe base per le carte, che legga i dati da file json. La classe definira' il layout base delle carte
- **CRIT/TAC CARD CLASS**: creare sottoclassi per le carte CRIT OP e TAC OP. La classe aggiungera elementi specifici per la carta figlia.



