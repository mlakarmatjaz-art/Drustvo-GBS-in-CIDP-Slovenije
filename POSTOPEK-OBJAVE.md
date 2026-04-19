# Postopek objave spletne strani na GitHub Pages

## 1. Prenesi in razširi paket
1. Prenesi ZIP paket spletne strani.
2. Razširi ZIP na računalniku.
3. Preveri, da v mapi vidiš datoteke `index.html`, `styles.css`, `script.js`, mapo `assets`, mapo `docs` in datoteko `.nojekyll`.

## 2. Ustvari repozitorij na GitHubu
1. Prijavi se v GitHub.
2. Klikni **New repository**.
3. Vpiši ime repozitorija, na primer `drustvo-gbs-cidp-slovenije`.
4. Izberi **Public**.
5. Klikni **Create repository**.

## 3. Naloži datoteke
1. Odpri nov repozitorij.
2. Klikni **Add file** → **Upload files**.
3. Povleci vse datoteke iz pripravljene mape v okno za nalaganje.
4. Počakaj, da se prenos zaključi.
5. Klikni **Commit changes**.

## 4. Vključi GitHub Pages
1. V repozitoriju odpri **Settings**.
2. V levem meniju odpri **Pages**.
3. V razdelku **Build and deployment** izberi **Deploy from a branch**.
4. Kot vejo izberi **main**.
5. Kot mapo izberi **/ (root)**.
6. Klikni **Save**.

## 5. Počakaj na objavo
1. GitHub bo stran pripravil samodejno.
2. Po nekaj minutah se bo prikazal javni naslov v obliki:
   `https://uporabnisko-ime.github.io/ime-repozitorija/`
3. Odpri povezavo in preveri, ali delujejo:
   - glavni meni
   - dokumenti v razdelku Dokumenti
   - obrazec za članstvo
   - povezave v razdelku Podpora

## 6. Kako spremeniš vsebino pozneje
- za besedila odpri `index.html`
- za barve in videz odpri `styles.css`
- za delovanje menija in obrazca odpri `script.js`
- nove dokumente dodaj v mapo `docs`
- če dodaš nov dokument, v `index.html` dodaj še novo povezavo

## 7. Lastna domena
Ko boš imel domeno, jo lahko povežeš v:
**Settings** → **Pages** → **Custom domain**

Priporočena oblika domene:
- `drustvo-gbs-cidp.si`
- `drustvogbsincidp.si`

## 8. Pomembno
- ime domene ne sme vsebovati šumnikov ali presledkov
- če spremeniš datoteke, jih moraš znova naložiti v repozitorij
- če boš uporabljal lastno domeno, običajno dodaš tudi DNS zapise pri ponudniku domene
