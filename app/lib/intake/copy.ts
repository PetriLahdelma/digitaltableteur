import { ENABLED_INTAKE_LOCALES } from "./data-policy";
import type { IntakeLocale, LocalizedCopy } from "./types";

/**
 * Interface copy for the intake client area and its emails. Server-rendered
 * from one typed table so every string exists in every locale (a test checks
 * it). Swedish is drafted and switched off with ENABLED_INTAKE_LOCALES.
 *
 * `{name}` style placeholders are filled by `format`.
 */
export const INTAKE_COPY = {
  // Shell
  areaName: { en: "Client intake", fi: "Asiakkaan esitiedot", sv: "Förhandsuppgifter" },
  signOut: { en: "Sign out", fi: "Kirjaudu ulos", sv: "Logga ut" },
  privacyLink: { en: "How we handle your answers", fi: "Näin käsittelemme vastauksesi", sv: "Så hanterar vi dina svar" },
  backToSite: { en: "digitaltableteur.com", fi: "digitaltableteur.com", sv: "digitaltableteur.com" },
  languageLabel: { en: "Language", fi: "Kieli", sv: "Språk" },

  // Sign in by email
  signInTitle: { en: "Sign in to your intake", fi: "Kirjaudu esitietolomakkeeseesi", sv: "Logga in till dina förhandsuppgifter" },
  signInIntro: {
    en: "Enter the email address your invitation was sent to. We will email you an 8-digit code. There is no password.",
    fi: "Anna sähköpostiosoite, johon kutsusi lähetettiin. Lähetämme sinulle 8-numeroisen koodin. Salasanaa ei ole.",
    sv: "Ange e-postadressen som inbjudan skickades till. Vi mejlar dig en kod med 8 siffror. Det finns inget lösenord.",
  },
  emailLabel: { en: "Email address", fi: "Sähköpostiosoite", sv: "E-postadress" },
  sendCode: { en: "Email me a code", fi: "Lähetä koodi", sv: "Mejla mig en kod" },
  codeSentGeneric: {
    en: "If this address has an active intake, we have sent a code to it. It is valid for 10 minutes.",
    fi: "Jos osoitteella on avoin esitietolomake, lähetimme siihen koodin. Koodi on voimassa 10 minuuttia.",
    sv: "Om adressen har aktiva förhandsuppgifter har vi skickat en kod till den. Koden gäller i 10 minuter.",
  },

  // Invite landing
  inviteTitle: { en: "Your intake invitation", fi: "Kutsu esitietolomakkeeseen", sv: "Din inbjudan till förhandsuppgifter" },
  inviteIntro: {
    en: "Continue and we will email an 8-digit code to the invited address. The code proves the invitation reached you.",
    fi: "Jatka, niin lähetämme 8-numeroisen koodin kutsuttuun osoitteeseen. Koodi varmistaa, että kutsu tavoitti sinut.",
    sv: "Fortsätt så mejlar vi en kod med 8 siffror till den inbjudna adressen. Koden visar att inbjudan nådde dig.",
  },
  continue: { en: "Continue", fi: "Jatka", sv: "Fortsätt" },
  inviteMissing: {
    en: "This page needs the link from your invitation email. Open the link again, or sign in with your email address.",
    fi: "Tämä sivu tarvitsee kutsusähköpostin linkin. Avaa linkki uudelleen tai kirjaudu sähköpostiosoitteellasi.",
    sv: "Sidan behöver länken i inbjudan. Öppna länken igen eller logga in med din e-postadress.",
  },
  inviteInvalid: {
    en: "This invitation link has expired or has already been used. If you have started your intake, sign in with your email address.",
    fi: "Kutsulinkki on vanhentunut tai jo käytetty. Jos olet jo aloittanut, kirjaudu sähköpostiosoitteellasi.",
    sv: "Inbjudningslänken har gått ut eller redan använts. Om du redan har börjat, logga in med din e-postadress.",
  },
  signInWithEmail: { en: "Sign in with email", fi: "Kirjaudu sähköpostilla", sv: "Logga in med e-post" },

  // Code step
  codeTitle: { en: "Check your email", fi: "Tarkista sähköpostisi", sv: "Kolla din e-post" },
  codeSentTo: {
    en: "We sent an 8-digit code to the invited address. It is valid for 10 minutes.",
    fi: "Lähetimme 8-numeroisen koodin kutsuttuun osoitteeseen. Koodi on voimassa 10 minuuttia.",
    sv: "Vi skickade en kod med 8 siffror till den inbjudna adressen. Koden gäller i 10 minuter.",
  },
  codeLabel: { en: "8-digit code", fi: "8-numeroinen koodi", sv: "Kod med 8 siffror" },
  verifyCode: { en: "Sign in", fi: "Kirjaudu", sv: "Logga in" },
  codeWrong: { en: "That code is not right. Check the latest email and try again.", fi: "Koodi ei täsmää. Tarkista uusin viesti ja yritä uudelleen.", sv: "Koden stämmer inte. Kontrollera det senaste mejlet och försök igen." },
  codeExpired: { en: "This code has expired or was replaced by a newer one. Request a new code.", fi: "Koodi on vanhentunut tai korvattu uudella. Pyydä uusi koodi.", sv: "Koden har gått ut eller ersatts av en nyare. Begär en ny kod." },
  codeLocked: { en: "Too many attempts. Request a new code.", fi: "Liian monta yritystä. Pyydä uusi koodi.", sv: "För många försök. Begär en ny kod." },
  codeFormat: { en: "Enter the 8 digits from the email.", fi: "Anna viestin 8 numeroa.", sv: "Ange de 8 siffrorna i mejlet." },
  requestNewCode: { en: "Request a new code", fi: "Pyydä uusi koodi", sv: "Begär en ny kod" },
  privacyBeforeCode: {
    en: "Before you continue: read how we handle your answers.",
    fi: "Ennen kuin jatkat: lue, miten käsittelemme vastauksesi.",
    sv: "Innan du fortsätter: läs hur vi hanterar dina svar.",
  },
  rateLimited: { en: "Too many requests. Wait a few minutes and try again.", fi: "Liian monta pyyntöä. Odota hetki ja yritä uudelleen.", sv: "För många förfrågningar. Vänta några minuter och försök igen." },
  genericError: { en: "Something went wrong on our side. Try again in a moment.", fi: "Jokin meni vikaan meidän päässämme. Yritä hetken päästä uudelleen.", sv: "Något gick fel hos oss. Försök igen om en stund." },

  // Client home
  homeTitle: { en: "Your intake", fi: "Esitietolomakkeesi", sv: "Dina förhandsuppgifter" },
  homeIntro: {
    en: "Your answers save as you type. You can leave and come back at any time before you submit.",
    fi: "Vastauksesi tallentuvat kirjoittaessasi. Voit poistua ja palata milloin tahansa ennen lähettämistä.",
    sv: "Dina svar sparas medan du skriver. Du kan lämna och komma tillbaka när som helst innan du skickar.",
  },
  statusNotStarted: { en: "Not started", fi: "Ei aloitettu", sv: "Inte påbörjad" },
  statusInProgress: { en: "In progress", fi: "Kesken", sv: "Pågår" },
  statusSubmitted: { en: "Submitted", fi: "Lähetetty", sv: "Skickad" },
  openIntake: { en: "Continue", fi: "Jatka", sv: "Fortsätt" },
  startIntake: { en: "Start", fi: "Aloita", sv: "Börja" },
  viewSubmission: { en: "View submission", fi: "Näytä vastaukset", sv: "Visa svaren" },
  lastSaved: { en: "Last saved", fi: "Tallennettu viimeksi", sv: "Senast sparad" },
  submittedOn: { en: "Submitted", fi: "Lähetetty", sv: "Skickad" },
  noIntakes: {
    en: "There is nothing here right now. Submitted intakes stay viewable for 12 months.",
    fi: "Täällä ei ole nyt mitään. Lähetetyt lomakkeet ovat nähtävissä 12 kuukautta.",
    sv: "Här finns inget just nu. Skickade förhandsuppgifter går att se i 12 månader.",
  },

  // Form
  partsLabel: { en: "Intake parts", fi: "Lomakkeen osat", sv: "Formulärets delar" },
  sectionCaption: { en: "{part}: section {n} of {total}", fi: "{part}: osio {n}/{total}", sv: "{part}: avsnitt {n} av {total}" },
  back: { en: "Back", fi: "Takaisin", sv: "Tillbaka" },
  cancel: { en: "Cancel", fi: "Peruuta", sv: "Avbryt" },
  clearSection: { en: "Clear answers", fi: "Tyhjennä vastaukset", sv: "Rensa svaren" },
  clearSectionTitle: {
    en: "Clear the answers in this section?",
    fi: "Tyhjennetäänkö tämän osion vastaukset?",
    sv: "Rensa svaren i det här avsnittet?",
  },
  clearSectionDescription: {
    en: "Everything you entered on this screen is removed. This cannot be undone.",
    fi: "Kaikki tälle sivulle syöttämäsi poistetaan. Toimintoa ei voi perua.",
    sv: "Allt du har fyllt i på den här sidan tas bort. Det går inte att ångra.",
  },
  continueTo: { en: "Continue: {next}", fi: "Jatka: {next}", sv: "Fortsätt: {next}" },
  checkAndSubmit: { en: "Check and submit", fi: "Tarkista ja lähetä", sv: "Kontrollera och skicka" },
  checkIntro: {
    en: "Check your answers and change anything that needs it. After you submit, the answers are locked.",
    fi: "Tarkista vastauksesi ja muuta tarvittaessa. Lähettämisen jälkeen vastauksia ei voi muuttaa.",
    sv: "Kontrollera dina svar och ändra det som behövs. När du har skickat låses svaren.",
  },
  change: { en: "Change", fi: "Muuta", sv: "Ändra" },
  neededBeforeCall: { en: "Needed before our call", fi: "Tarvitaan ennen puheluamme", sv: "Behövs före vårt samtal" },
  statusCompleted: { en: "Completed", fi: "Valmis", sv: "Klar" },
  statusAfterFirstPart: { en: "After part 1", fi: "Osan 1 jälkeen", sv: "Efter del 1" },
  accountMenu: { en: "Account menu for {name}", fi: "Tilivalikko: {name}", sv: "Kontomeny för {name}" },
  saving: { en: "Saving", fi: "Tallennetaan", sv: "Sparar" },
  saved: { en: "All changes saved", fi: "Kaikki muutokset tallennettu", sv: "Alla ändringar sparade" },
  saveFailed: { en: "Not saved yet. We will try again.", fi: "Ei vielä tallennettu. Yritämme uudelleen.", sv: "Inte sparat än. Vi försöker igen." },
  conflictTitle: { en: "This intake changed in another window", fi: "Lomaketta muokattiin toisessa ikkunassa", sv: "Formuläret ändrades i ett annat fönster" },
  conflictBody: {
    en: "Reload to continue from the latest saved answers.",
    fi: "Lataa sivu uudelleen jatkaaksesi viimeksi tallennetuista vastauksista.",
    sv: "Ladda om för att fortsätta från de senast sparade svaren.",
  },
  reload: { en: "Reload", fi: "Lataa uudelleen", sv: "Ladda om" },
  required: { en: "Required", fi: "Pakollinen", sv: "Obligatorisk" },
  requiredError: { en: "Answer this before submitting.", fi: "Vastaa tähän ennen lähettämistä.", sv: "Svara på detta innan du skickar." },
  invalidError: { en: "Check this answer.", fi: "Tarkista tämä vastaus.", sv: "Kontrollera svaret." },
  errorSummaryTitle: { en: "Some answers need attention", fi: "Osa vastauksista vaatii huomiota", sv: "Några svar behöver ses över" },
  errorSummaryIntro: { en: "Fix these before submitting:", fi: "Korjaa nämä ennen lähettämistä:", sv: "Rätta dessa innan du skickar:" },
  selectPlaceholder: { en: "Choose", fi: "Valitse", sv: "Välj" },
  scaleLegend: { en: "From {min} to {max}", fi: "Ääripäät: {min} ja {max}", sv: "Från {min} till {max}" },
  scaleAnswer: { en: "{value} of {max}, closer to {side}", fi: "{value}/{max}, lähempänä: {side}", sv: "{value} av {max}, närmare {side}" },
  scaleAnswerMiddle: { en: "{value} of {max}, in the middle", fi: "{value}/{max}, keskellä", sv: "{value} av {max}, i mitten" },
  submit: { en: "Submit", fi: "Lähetä", sv: "Skicka" },
  submitHint: {
    en: "After you submit, your answers are locked. You can still view them here for 12 months.",
    fi: "Lähettämisen jälkeen vastauksia ei voi muuttaa. Näet ne täällä 12 kuukauden ajan.",
    sv: "När du har skickat låses svaren. Du kan fortfarande se dem här i 12 månader.",
  },
  submissionDatePending: { en: "Set when you submit", fi: "Asetetaan lähetettäessä", sv: "Sätts när du skickar" },

  // Submission
  submittedTitle: { en: "Thank you, your answers are in", fi: "Kiitos, vastauksesi on vastaanotettu", sv: "Tack, dina svar har kommit fram" },
  submittedIntro: {
    en: "We will read them before our first conversation. This copy stays here for 12 months.",
    fi: "Luemme ne ennen ensimmäistä keskusteluamme. Tämä kopio säilyy täällä 12 kuukautta.",
    sv: "Vi läser dem före vårt första samtal. Den här kopian finns kvar här i 12 månader.",
  },
  fingerprint: { en: "Fingerprint (SHA-256)", fi: "Tunniste (SHA-256)", sv: "Fingeravtryck (SHA-256)" },
  notAnswered: { en: "Not answered", fi: "Ei vastausta", sv: "Inget svar" },
  downloadPdf: { en: "Download PDF", fi: "Lataa PDF", sv: "Ladda ner PDF" },
  pdfPage: { en: "Page", fi: "Sivu", sv: "Sida" },
  pdfSubmitted: { en: "Submitted", fi: "Lähetetty", sv: "Skickat" },
  pdfClient: { en: "Client", fi: "Asiakas", sv: "Kund" },
  yes: { en: "Yes", fi: "Kyllä", sv: "Ja" },
  no: { en: "No", fi: "Ei", sv: "Nej" },

  // Emails (never carry answers). Each mail is built from these parts in
  // service/mail.ts, as HTML and as the plain-text alternative.
  mailBrand: { en: "Digitaltableteur", fi: "Digitaltableteur", sv: "Digitaltableteur" },
  mailSignature: { en: "Petri Lahdelma\nDigitaltableteur", fi: "Petri Lahdelma\nDigitaltableteur", sv: "Petri Lahdelma\nDigitaltableteur" },
  mailLinkFallback: {
    en: "If the button does not work, copy this link into your browser:",
    fi: "Jos painike ei toimi, kopioi tämä linkki selaimeesi:",
    sv: "Om knappen inte fungerar, kopiera den här länken till webbläsaren:",
  },
  mailFooter: {
    en: "You are receiving this email because Digitaltableteur invited this address to its client intake.",
    fi: "Saat tämän viestin, koska Digitaltableteur kutsui tämän osoitteen esitietolomakkeelleen.",
    sv: "Du får det här mejlet eftersom Digitaltableteur bjöd in den här adressen till sina förhandsuppgifter.",
  },

  mailInviteSubject: { en: "Your intake for Digitaltableteur", fi: "Esitietolomakkeesi Digitaltableteurille", sv: "Dina förhandsuppgifter till Digitaltableteur" },
  mailInvitePreheader: {
    en: "Your {questionnaire} form is ready. Answers save as you go.",
    fi: "Lomakkeesi {questionnaire} on valmiina. Vastaukset tallentuvat sitä mukaa.",
    sv: "Ditt formulär {questionnaire} är klart. Svaren sparas medan du fyller i.",
  },
  mailInviteHeading: { en: "Your intake is ready", fi: "Esitietolomakkeesi on valmiina", sv: "Dina förhandsuppgifter är klara" },
  mailInviteGreeting: { en: "Hello {name},", fi: "Hei {name},", sv: "Hej {name}," },
  mailInviteLead: {
    en: "here is your link to the {questionnaire} form. Your answers save as you go, so you can fill it in over more than one sitting.",
    fi: "tässä on linkkisi lomakkeeseen {questionnaire}. Vastauksesi tallentuvat sitä mukaa, joten voit täyttää lomakkeen useammassa osassa.",
    sv: "här är din länk till formuläret {questionnaire}. Dina svar sparas medan du fyller i, så du kan göra det i flera omgångar.",
  },
  mailInviteButton: { en: "Open your intake", fi: "Avaa esitietolomake", sv: "Öppna förhandsuppgifterna" },
  mailInviteNote: {
    en: "The link is valid until {expires}. When you open it, we email you a one-time code. There is no password.",
    fi: "Linkki on voimassa {expires} asti. Kun avaat sen, lähetämme sinulle kertakäyttöisen koodin. Salasanaa ei tarvita.",
    sv: "Länken gäller till {expires}. När du öppnar den mejlar vi dig en engångskod. Inget lösenord behövs.",
  },

  mailCodeSubject: { en: "Your sign-in code: {code}", fi: "Kirjautumiskoodisi: {code}", sv: "Din inloggningskod: {code}" },
  mailCodePreheader: {
    en: "{code} is your code for the Digitaltableteur client intake.",
    fi: "{code} on koodisi Digitaltableteurin esitietolomakkeeseen.",
    sv: "{code} är din kod till Digitaltableteurs förhandsuppgifter.",
  },
  mailCodeHeading: { en: "Your sign-in code", fi: "Kirjautumiskoodisi", sv: "Din inloggningskod" },
  mailCodeLead: {
    en: "Enter this code on the sign-in page to open your client intake.",
    fi: "Syötä tämä koodi kirjautumissivulle avataksesi esitietolomakkeesi.",
    sv: "Ange koden på inloggningssidan för att öppna dina förhandsuppgifter.",
  },
  mailCodeLabel: { en: "Sign-in code", fi: "Kirjautumiskoodi", sv: "Inloggningskod" },
  mailCodeNote: {
    en: "The code is valid for 10 minutes and works once.",
    fi: "Koodi on voimassa 10 minuuttia, ja sen voi käyttää kerran.",
    sv: "Koden gäller i 10 minuter och kan användas en gång.",
  },
  mailCodeIgnore: {
    en: "Did not ask for a code? You can ignore this email. Nobody can sign in without the code.",
    fi: "Etkö pyytänyt koodia? Voit jättää viestin huomiotta. Kukaan ei voi kirjautua ilman koodia.",
    sv: "Bad du inte om en kod? Då kan du strunta i mejlet. Ingen kan logga in utan koden.",
  },

  mailSubmittedSubject: { en: "We received your intake", fi: "Vastaanotimme esitietosi", sv: "Vi har fått dina förhandsuppgifter" },
  mailSubmittedPreheader: {
    en: "Your answers arrived on {date}. Thank you.",
    fi: "Vastauksesi saapuivat {date}. Kiitos.",
    sv: "Dina svar kom fram {date}. Tack.",
  },
  mailSubmittedHeading: { en: "We received your intake", fi: "Vastaanotimme esitietosi", sv: "Vi har fått dina förhandsuppgifter" },
  mailSubmittedLead: {
    en: "Thank you. Your answers to {questionnaire} arrived on {date}. We will read them before our first conversation.",
    fi: "Kiitos. Vastauksesi lomakkeeseen {questionnaire} saapuivat {date}. Luemme ne ennen ensimmäistä keskusteluamme.",
    sv: "Tack. Dina svar på {questionnaire} kom fram {date}. Vi läser dem före vårt första samtal.",
  },
  mailSubmittedButton: { en: "View your answers", fi: "Katso vastauksesi", sv: "Se dina svar" },
  mailSubmittedNote: {
    en: "Your answers stay in the client area for 12 months.",
    fi: "Vastauksesi säilyvät asiakasalueella 12 kuukautta.",
    sv: "Dina svar finns kvar i kundområdet i 12 månader.",
  },
} as const satisfies Record<string, LocalizedCopy>;

export type IntakeCopyKey = keyof typeof INTAKE_COPY;

export function format(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export type IntakeCopyTable = Readonly<Record<IntakeCopyKey, string>>;

/** Every string in one locale, for passing to client components as a plain object. */
export function copyTable(locale: IntakeLocale): IntakeCopyTable {
  return Object.fromEntries((Object.keys(INTAKE_COPY) as IntakeCopyKey[]).map((key) => [key, INTAKE_COPY[key][locale]])) as IntakeCopyTable;
}

/** Copy lookup bound to one locale. */
export function intakeCopy(locale: IntakeLocale) {
  return (key: IntakeCopyKey, values?: Record<string, string | number>) => format(INTAKE_COPY[key][locale], values);
}

export function isEnabledLocale(value: unknown): value is IntakeLocale {
  return typeof value === "string" && (ENABLED_INTAKE_LOCALES as readonly string[]).includes(value);
}

/** Picks the interface locale from an explicit choice, then Accept-Language. */
export function resolveIntakeLocale(requested: string | null | undefined, acceptLanguage?: string | null): IntakeLocale {
  if (isEnabledLocale(requested)) return requested;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const base = part.trim().split(";")[0]?.split("-")[0]?.toLowerCase();
    if (isEnabledLocale(base)) return base;
  }
  return "en";
}
