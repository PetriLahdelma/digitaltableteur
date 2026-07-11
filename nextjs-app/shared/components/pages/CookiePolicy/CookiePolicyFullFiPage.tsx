"use client";

import React from "react";
import Link from "next/link";

import { Button, Icon, Title } from "@digitaltableteur/react";
import styles from "./CookiePolicy.module.css";

export function CookiePolicyFullFiPage({
  onBack,
  backLabel = "Takaisin",
}: {
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className={styles.policyPage}>
      {onBack ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <Button variant="secondary" size="md" onClick={onBack}>
            <Icon
              name="arrow-left"
              ariaLabel={backLabel}
              style={{ marginInlineEnd: 8 }}
            />
            {backLabel}
          </Button>
        </div>
      ) : null}

      <Title>Tietosuojakäytäntö</Title>
      <Title level={2}>Sopimusrekisteri – Tietosuojaseloste</Title>
      <p>
        <strong>Laatimispäivä:</strong> 7.7.2025
      </p>
      <p>
        <strong>Rekisterinpitäjä:</strong> Digitaltableteur Tmi
        <br />
        Hämeentie 8 C
        <br />
        +358 45 657 4469
        <br />
        mail@digitaltableteur.com
      </p>
      <p>
        <br />
        <strong>Yhteyshenkilö rekisteriasioissa:</strong>
        <br />
        Petri Lahdelma
        <br />
        Hämeentie 8 C
        <br />
        +358 45 657 4469
        <br />
        mail@digitaltableteur.com
      </p>
      <br />
      <p>
        <strong>Rekisterin nimi:</strong> Sopimusrekisteri
      </p>
      <br />
      <p>
        <strong>Henkilötietojen käsittelyn tarkoitus:</strong> Käsittelyn
        oikeusperuste on sopimus. Tarkoituksena on ylläpitää, hallinnoida,
        arkistoida ja käsitellä asiakkaiden ja muiden sidosryhmien kanssa
        tehtyjä sopimuksia sekä ylläpitää asiakassuhteita. Tietoja voidaan
        käyttää toiminnan kehittämiseen, tilastointiin ja sisällön
        personointiin. Tietoja käsitellään henkilötietolain mukaisesti. Tietoja
        voidaan käyttää kohdennettuun mainontaan yrityksen omissa
        järjestelmissä, mutta niitä ei luovuteta ulkopuolisille. Teknisten
        rajapintojen kautta kumppaneita voidaan käyttää teknisiin tarpeisiin.
      </p>
      <br />
      <p>
        <strong>Oikeutettu etu:</strong> Tietojen käsittely ei perustu
        oikeutettuun etuun.
      </p>
      <br />
      <p>
        <strong>Henkilötietojen ryhmät:</strong> Asiakasyrityksen yhteyshenkilön
        nimi, sovitut teemat.
      </p>
      <br />
      <p>
        <strong>Vastaanottajat ja vastaanottajaryhmät:</strong>
        Rekisterinpitäjän henkilöstö sekä ulkoistuskumppanit tarvittaessa.
      </p>
      <br />
      <p>
        <strong>Suostumus:</strong> Tietojen käsittely ei perustu suostumukseen.
      </p>
      <br />
      <p>
        <strong>Rekisterin tietosisältö:</strong> Sopimusrekisterissä on: etu-
        ja sukunimi, edustettu yhteisö, Y-tunnus, sähköpostiosoite, postiosoite,
        puhelinnumero, tilatut palvelut ja muut sovitut liiketoiminta-asiat.
      </p>
      <br />
      <p>
        <strong>Säännönmukaiset tietolähteet:</strong> Puhelin- ja sähköinen
        viestintä. Tietoja voidaan saada myös alihankkijoiden tai kumppaneiden
        verkkosivustoilta, tietojärjestelmistä tai muista digitaalisista
        lähteistä evästeiden tai sähköisten tunnisteiden avulla.
      </p>
      <br />
      <p>
        <strong>Tietojen käyttö ja luovutus:</strong> Tietoja käytetään vain
        yrityksen sisällä, ellei ulkopuolista palveluntarjoajaa käytetä
        lisäarvo- tai luottopalveluihin. Tietoja ei luovuteta ulkopuolisille
        paitsi luottohakemuksiin, perintään, laskutukseen tai lain
        edellyttämissä tapauksissa. Tiedot poistetaan pyynnöstä, ellei
        lainsäädäntö, avoimet laskut tai perintä estä sitä.
      </p>
      <br />
      <p>
        <strong>Säilytysaika:</strong> 10 vuotta sopimuksen päättymisestä.
      </p>
      <br />
      <Title level={3}>Evästeet</Title>
      <p>
        Käytämme evästeitä parantaaksemme ja personoidaksemme käyttökokemusta
        sekä analysoidaksemme sivuston käyttöä. Evästeillä kerättyjä tietoja
        voidaan käyttää kohdennettuun viestintään ja markkinointiin, mutta
        pelkän evästeen perusteella kävijää ei voi tunnistaa. Evästeet voi
        kieltää selaimen asetuksista, mutta tämä voi vaikuttaa sivuston
        toimintaan.
      </p>
      <p>
        Evästeet jaetaan neljään kategoriaan: <strong>välttämättömiin</strong>{" "}
        (turvallisuus, suostumuksen tallennus), <strong>toiminnallisiin</strong>{" "}
        (kieli, ulkoasu, kartta- ja video-upotukset),{" "}
        <strong>analytiikkaan</strong> (yhdistetty käyttötieto) sekä{" "}
        <strong>markkinointi/yhteisö</strong> -evästeisiin (esim. Substack,
        Instagram). Valinnaiset kategoriat aktivoidaan vasta, kun valitset
        “Hyväksy kaikki”. Suostumus kirjataan 13 kuukauden ajaksi EU-sääntelyn
        mukaisesti.
      </p>
      <Title level={3}>Suostumuksen hallinta</Title>
      <p>
        Saat evästebannerin takaisin näkyviin tyhjentämällä selaimen
        “cookieConsent”-merkinnän tai pyytämällä meitä nollaamaan valintasi
        osoitteessa mail@digitaltableteur.com. Voit myös hallita evästeitä
        selaimesi asetuksissa.
      </p>
      <Title level={3}>Tekoälyn käyttö</Title>
      <p>
        Hyödynnämme tekoälyä mm. sisällön luonnostelussa ja käyttöliittymien
        testauksessa, mutta ihminen vastaa lopputuloksesta ja henkilökohtaiset
        tiedot minimoidaan ennen promptien lähettämistä. Lue lisää{" "}
        <Link href="/ai-use">
          AI:n käyttöä ja läpinäkyvyyttä koskevasta selosteesta
        </Link>
        .
      </p>
      <Title level={3}>Oikeuksien käyttäminen</Title>
      <p>
        Käyttääksesi oikeuksiasi ota yhteyttä rekisterinpitäjään tai yllä
        mainittuun yhteyshenkilöön. Voit tehdä valituksen
        tietosuojavaltuutetulle (
        <a href="mailto:tietosuoja@om.fi">tietosuoja@om.fi</a>,{" "}
        <a href="https://www.tietosuoja.fi">www.tietosuoja.fi</a>).
      </p>
    </div>
  );
}
