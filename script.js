<!doctype html>
<html lang="sl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="assets/logo.png">

  <title>Novice in dogodki | Društvo GBS in CIDP Slovenije</title>
  <meta name="description" content="Rubrika za novice, obvestila, srečanja, pohode, delavnice in druge dogodke društva.">
</head>
<body data-page="novice">
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="index.html" aria-label="Društvo GBS in CIDP Slovenije">
        <img src="assets/logo.png" alt="Logotip Društva GBS in CIDP Slovenije">
        <span>Društvo GBS in CIDP Slovenije</span>
      </a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="menu">Meni</button>
      <nav id="menu" class="menu">
        <a href="index.html">Domov</a>
        <a href="bolezni.html">GBS in CIDP</a>
        <a href="clanstvo.html">Članstvo</a>
        <a href="novice-dogodki.html">Novice in dogodki</a>
        <a href="podprite.html">Podprite nas</a>
        <a href="index.html#dokumenti">Dokumenti</a>
        <a href="index.html#kontakt">Kontakt</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero hero-subpage">
      <div class="container narrow">
        <p class="eyebrow">Aktualno</p>
        <h1>Novice in dogodki</h1>
        <p class="lead">Ta stran je pripravljena kot enostavno urejiva rubrika za objavo novic, obvestil, srečanj, pohodov, delavnic in drugih aktivnosti društva. Vsebino lahko spreminjate v datoteki <strong>script.js</strong>, brez posebnega sistema za urejanje.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading split-heading">
          <div>
            <p class="eyebrow">Novice</p>
            <h2>Obvestila in napovedi</h2>
          </div>
          <span class="small-note">Rubrika je pripravljena za sprotno dopolnjevanje.</span>
        </div>
        <div id="news-list" class="cards three"></div>
      </div>
    </section>

    <section class="section alt" id="dogodki-lista">
      <div class="container">
        <div class="section-heading split-heading">
          <div>
            <p class="eyebrow">Dogodki</p>
            <h2>Srečanja, delavnice in rekreativne aktivnosti</h2>
          </div>
          <span class="small-note">Datume in lokacije dopolnite po registraciji društva.</span>
        </div>
        <div id="events-list" class="cards three"></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="callout-box">
          <h3>Kako urediti vsebino</h3>
          <p>V datoteki <strong>script.js</strong> sta polji <strong>siteNews</strong> in <strong>siteEvents</strong>. Spremeniš naslov, datum, povzetek, lokacijo, povezavo ali oznako, shraniš datoteko in stran je posodobljena.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <strong>Društvo GBS in CIDP Slovenije</strong><br>
        Podpora | Informiranje | Povezovanje
        <p class="small-note footer-gap">Spletna stran je pripravljena za brezplačno objavo kot statična stran. Po registraciji društva dopolnite sedež, matično številko, davčno številko, TRR, uradna pooblastila in dejanske datume dogodkov.</p>
      </div>
      <div>
        <strong>Hitra povezava</strong>
        <ul class="footer-links">
          <li><a href="clanstvo.html">Postani član</a></li>
          <li><a href="podprite.html">Donacije in sponzorstva</a></li>
          <li><a href="novice-dogodki.html">Novice in dogodki</a></li>
          <li><a href="dokumenti/Statut_Drustvo_GBS_in_CIDP_Slovenije_dopolnjen.docx">Statut društva</a></li>
        </ul>
      </div>
      <div>
        <strong>Pomembno opozorilo</strong>
        <p class="small-note footer-gap">Vsebina na strani je informativne narave in ne nadomešča pregleda, diagnoze ali individualnega načrta zdravljenja. Ob hitrem slabšanju moči, težavah z dihanjem, požiranjem ali govorom takoj poiščite nujno medicinsko pomoč.</p>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>
