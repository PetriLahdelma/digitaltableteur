import { RETENTION } from "./data-policy";
import type { LocalizedCopy } from "./types";

/**
 * Privacy notice for the client intake (decision 9, docs/intake/README.md).
 * Shown before the code step and linked from every intake page. Controller
 * wording follows the site privacy policy, without a business ID.
 */
export type NoticeSection = Readonly<{ title: LocalizedCopy; body?: LocalizedCopy; items?: readonly LocalizedCopy[] }>;

export const PRIVACY_NOTICE_TITLE: LocalizedCopy = {
  en: "How we handle your intake answers",
  fi: "Näin käsittelemme esitietolomakkeen vastauksesi",
  sv: "Så hanterar vi dina svar i förhandsuppgifterna",
};

export const PRIVACY_NOTICE_UPDATED: LocalizedCopy = { en: "Updated 26 October 2026", fi: "Päivitetty 26.10.2026", sv: "Uppdaterad 26 oktober 2026" };

export const PRIVACY_NOTICE: readonly NoticeSection[] = [
  {
    title: { en: "Who is responsible", fi: "Rekisterinpitäjä", sv: "Personuppgiftsansvarig" },
    body: {
      en: "Petri Lahdelma (Digitaltableteur), Helsinki, Finland. Email: mail@digitaltableteur.com",
      fi: "Petri Lahdelma (Digitaltableteur), Helsinki. Sähköposti: mail@digitaltableteur.com",
      sv: "Petri Lahdelma (Digitaltableteur), Helsingfors, Finland. E-post: mail@digitaltableteur.com",
    },
  },
  {
    title: { en: "What we collect", fi: "Mitä tietoja keräämme", sv: "Vad vi samlar in" },
    items: [
      {
        en: "Your name and email address, from the invitation.",
        fi: "Nimesi ja sähköpostiosoitteesi kutsusta.",
        sv: "Ditt namn och din e-postadress, från inbjudan.",
      },
      {
        en: "Your answers to the questionnaire, including anything you write about your business.",
        fi: "Vastauksesi lomakkeeseen, myös yritystäsi koskevat tiedot.",
        sv: "Dina svar på formuläret, även det du skriver om ditt företag.",
      },
      {
        en: "Names or roles of other people you mention, such as colleagues or decision makers.",
        fi: "Muiden mainitsemiesi henkilöiden nimet tai roolit, kuten kollegat tai päättäjät.",
        sv: "Namn eller roller på andra personer du nämner, till exempel kolleger eller beslutsfattare.",
      },
      {
        en: "Sign-in records: when a code was sent and used. These never contain your answers.",
        fi: "Kirjautumistiedot: milloin koodi lähetettiin ja käytettiin. Ne eivät sisällä vastauksiasi.",
        sv: "Inloggningsuppgifter: när en kod skickades och användes. De innehåller aldrig dina svar.",
      },
    ],
  },
  {
    title: { en: "Why, and on what legal basis", fi: "Miksi ja millä perusteella", sv: "Varför och med vilken rättslig grund" },
    body: {
      en: "To prepare for and scope a possible project with you: steps taken at your request before a contract (GDPR article 6(1)(b)). Details about other people you mention are processed on our legitimate interest in understanding the project (article 6(1)(f)).",
      fi: "Mahdollisen projektin valmisteluun ja rajaamiseen kanssasi: pyynnöstäsi tehtävät toimet ennen sopimusta (tietosuoja-asetuksen 6 artiklan 1 kohdan b alakohta). Mainitsemiesi muiden henkilöiden tietoja käsitellään oikeutetun etumme perusteella, jotta ymmärrämme projektin (f alakohta).",
      sv: "För att förbereda och avgränsa ett möjligt projekt med dig: åtgärder på din begäran före ett avtal (artikel 6.1 b i dataskyddsförordningen). Uppgifter om andra personer du nämner behandlas med stöd av vårt berättigade intresse att förstå projektet (artikel 6.1 f).",
    },
  },
  {
    title: { en: "How your answers are protected", fi: "Miten vastauksesi suojataan", sv: "Hur dina svar skyddas" },
    items: [
      {
        en: "Answers are encrypted (AES-256-GCM) before they are stored, with keys kept apart from the database.",
        fi: "Vastaukset salataan (AES-256-GCM) ennen tallennusta, ja avaimet säilytetään erillään tietokannasta.",
        sv: "Svaren krypteras (AES-256-GCM) innan de lagras, och nycklarna förvaras skilt från databasen.",
      },
      {
        en: "You sign in with a one-time code sent to your email. There is no password to leak.",
        fi: "Kirjaudut sähköpostiisi lähetetyllä kertakäyttöisellä koodilla. Vuotavaa salasanaa ei ole.",
        sv: "Du loggar in med en engångskod som skickas till din e-post. Det finns inget lösenord som kan läcka.",
      },
      {
        en: "Intake pages load no analytics, chat or advertising scripts.",
        fi: "Lomakesivuilla ei ladata analytiikka-, chat- tai mainosskriptejä.",
        sv: "Formulärsidorna laddar inga skript för analys, chatt eller annonser.",
      },
    ],
  },
  {
    title: { en: "Who processes the data for us", fi: "Ketkä käsittelevät tietoja puolestamme", sv: "Vem som behandlar uppgifterna åt oss" },
    items: [
      { en: "Neon: the database, in Frankfurt, Germany.", fi: "Neon: tietokanta, Frankfurt, Saksa.", sv: "Neon: databasen, i Frankfurt, Tyskland." },
      { en: "Vercel: hosting; the intake runs in Frankfurt.", fi: "Vercel: palvelin; lomake toimii Frankfurtissa.", sv: "Vercel: drift; formuläret körs i Frankfurt." },
      {
        en: "Resend with Amazon SES (Ireland): sign-in and confirmation emails. Emails never contain your answers.",
        fi: "Resend ja Amazon SES (Irlanti): kirjautumis- ja vahvistusviestit. Viestit eivät koskaan sisällä vastauksiasi.",
        sv: "Resend med Amazon SES (Irland): inloggnings- och bekräftelsemejl. Mejlen innehåller aldrig dina svar.",
      },
      {
        en: "Sentry (Germany): error reports, which never include your answers.",
        fi: "Sentry (Saksa): virheraportit, jotka eivät koskaan sisällä vastauksiasi.",
        sv: "Sentry (Tyskland): felrapporter, som aldrig innehåller dina svar.",
      },
      {
        en: "Microsoft 365: Digitaltableteur's mailbox receives a PDF of your submitted answers.",
        fi: "Microsoft 365: Digitaltableteurin sähköposti vastaanottaa PDF-kopion lähettämistäsi vastauksista.",
        sv: "Microsoft 365: Digitaltableteurs e-post tar emot en PDF med dina inskickade svar.",
      },
    ],
  },
  {
    title: { en: "How long we keep it", fi: "Kuinka kauan tietoja säilytetään", sv: "Hur länge vi sparar uppgifterna" },
    items: [
      {
        en: `Invitation links work for ${RETENTION.inviteLinkHours} hours and sign-in codes for ${RETENTION.loginCodeMinutes} minutes.`,
        fi: `Kutsulinkki toimii ${RETENTION.inviteLinkHours} tuntia ja kirjautumiskoodi ${RETENTION.loginCodeMinutes} minuuttia.`,
        sv: `Inbjudningslänkar fungerar i ${RETENTION.inviteLinkHours} timmar och inloggningskoder i ${RETENTION.loginCodeMinutes} minuter.`,
      },
      {
        en: `Unsubmitted answers are deleted ${RETENTION.draftDaysSinceLastEdit} days after your last edit.`,
        fi: `Lähettämättömät vastaukset poistetaan ${RETENTION.draftDaysSinceLastEdit} päivän kuluttua viimeisestä muokkauksesta.`,
        sv: `Svar som inte skickats in raderas ${RETENTION.draftDaysSinceLastEdit} dagar efter din senaste ändring.`,
      },
      {
        en: `Submitted answers and their PDF are deleted from this service after ${RETENTION.submissionMonths} months; sign-in records after ${RETENTION.auditLogMonths} months.`,
        fi: `Lähetetyt vastaukset ja niiden PDF poistetaan palvelusta ${RETENTION.submissionMonths} kuukauden kuluttua, kirjautumistiedot ${RETENTION.auditLogMonths} kuukauden kuluttua.`,
        sv: `Inskickade svar och deras PDF raderas från tjänsten efter ${RETENTION.submissionMonths} månader, inloggningsuppgifter efter ${RETENTION.auditLogMonths} månader.`,
      },
      {
        en: "Digitaltableteur keeps the PDF with the project correspondence for as long as the business relationship needs it.",
        fi: "Digitaltableteur säilyttää PDF:n projektin kirjeenvaihdon yhteydessä niin kauan kuin asiakassuhde sitä edellyttää.",
        sv: "Digitaltableteur sparar PDF:en med projektkorrespondensen så länge affärsrelationen kräver det.",
      },
    ],
  },
  {
    title: { en: "Your rights", fi: "Oikeutesi", sv: "Dina rättigheter" },
    body: {
      en: "You can ask to see, correct or delete your data, restrict or object to its use, or receive it in a portable format: email mail@digitaltableteur.com. We answer within one month. You can also complain to the Data Protection Ombudsman (tietosuoja.fi).",
      fi: "Voit pyytää nähdä, korjata tai poistaa tietosi, rajoittaa niiden käyttöä tai vastustaa sitä tai saada ne siirrettävässä muodossa: lähetä viesti osoitteeseen mail@digitaltableteur.com. Vastaamme kuukauden kuluessa. Voit myös tehdä valituksen tietosuojavaltuutetulle (tietosuoja.fi).",
      sv: "Du kan be att få se, rätta eller radera dina uppgifter, begränsa eller invända mot behandlingen eller få dem i ett flyttbart format: mejla mail@digitaltableteur.com. Vi svarar inom en månad. Du kan också klaga hos dataombudsmannen (tietosuoja.fi).",
    },
  },
];
