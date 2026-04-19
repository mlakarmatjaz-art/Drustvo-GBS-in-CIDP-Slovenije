const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const membershipForm = document.querySelector('#membership-form');

if (membershipForm) {
  membershipForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const ime = document.querySelector('#ime')?.value?.trim() || '';
    const email = document.querySelector('#email')?.value?.trim() || '';
    const telefon = document.querySelector('#telefon')?.value?.trim() || '';
    const vrsta = document.querySelector('#vrsta')?.value?.trim() || '';
    const sporocilo = document.querySelector('#sporocilo')?.value?.trim() || '';

    const subject = encodeURIComponent('Povpraševanje za članstvo – ' + (vrsta || 'Društvo GBS in CIDP Slovenije'));
    const body = encodeURIComponent(
`Pozdravljeni,

zanima me ${vrsta || 'članstvo'} v Društvu GBS in CIDP Slovenije.

Ime in priimek: ${ime}
E-pošta: ${email}
Telefon: ${telefon || '-'}
Vrsta članstva: ${vrsta || '-'}

Sporočilo:
${sporocilo || '-'}

Lep pozdrav.`
    );

    window.location.href = `mailto:gbs.cidp.skupnost@gmail.com?subject=${subject}&body=${body}`;
  });
}
