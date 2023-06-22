# USB data configuratie.

Om data vanuit een usb automatisch te laten in lezen moet er voldoen aan een aantal eisen.

- Formateer de usb stick en geef het de naam `EXTERNAL`.
- Maak op de usb stick de voor elke onderdeel een map aan: `music`, `movies`, `location` en `products`.
- Plaats bij music, movies en location een `info.json` bestand.
- in de root plaats de bestanden `products.json` en `users.json`

De folder `external` is een representatie van hoe het er uiteindelijk op de usb uit komt te zien.

## Muziek

In de info.json wordt de volgende structuur verwacht:

```JSON

[
    {
    "name": "7 rings",
    "singer": "Ariana Grande",
    "img": "cover/music_cover.jpg",
    "path": "music.mp3"
  }
]

```

Maak een `cover` folder aan in de `music` folder, de mp3 bestanden moeten in de zelfde laag zijn als de `info.json` bestand.

## Movies

In de `info.json` wordt de volgende structuur verwacht:

```JSON
[
  {
    "Name": "sintel",
    "Description": "dummmy movie",
    "Image": "sintel/sintel.jpg",
    "file": "sintel/sintel.mp4",
    "subtitles": [
      { "lan": "DE", "file": "sintel/sintel_de.vtt" },
      { "lan": "ES", "file": "sintel/sintel_es.vtt" },
      { "lan": "en", "file": "sintel/sintel_en.vtt" }
    ]
  },
]

```

Subtitles array kan leeg blijven voor als er geen vertalingen zijn voor de film. in de `movies` folder maak je voor elke film een aparte folder aan, plaats daarin de jpg, mp4 en de vtt bestanden.

## Producten & categorien

om de producten en categorien toe tevoegen in je database hou de volgende structuur aan, plaats op de usb een folder genaamd `products`, hierin kan je de product afbeeldingen plaatsen.
de `products.json` bestand moet gelijk op de usb zonder folders.

```JSON

{
  "category": [
    { "category_name": "Cold" },
  ],
  "products": [
    { "isbn": 432423, "price": 18.82, "product_name": "Milk", "imageUrl": "milk.jpg", "quantity": 452 },
  ],

  "product_category": [
    { "isbnProduct": 432423, "categoryName": "Cold" },
  ]
}

```

## Gebruikers

Om gebruikers te toevoegen maak in de usb een file zonder het in een folder te stoppen genaamd `users.json`. Voeg hier de gebruikers toe als volgd:

```JSON

{
  "users": [
    { "username": "Murat", "seat_Number": "28C", "ticket_number": "mert" },
  ],
  "workers": [
    { "username": "mert", "password": "gunes" }
  ]
}

```

## Locatie

Om informatie te verwerken van de locatie waar je naar toe vliegt hou de volgende style aan. Let op er kan maar 1 locatie er in beschreven worden:

```JSON

{
  "Vlucht_naar": "Barcalona",
  "Vlucht_van": "Amsterdam",
  "Luchthaven_naar": "Josep Tarradellas Barcelona-El Prat",
  "Luchthaven_van": "Schiphol",
  "image": "barcalona.jpg",
  "bezienswaardigheden": [
    {
      "name": "Sagrada Familia",
      "description": "Blank",
      "image": "sagrada.jpg"
    },
    {
      "name": "Park Güell",
      "description": "Blank",
      "image": "park.jpg"
    }
  ]
}

```

Zorg er voor dat er op de usb een folder genaamd location aangemaakt wordt, plaats hier een json file genaamd info.json en hieren plaats je de gegevens zoals de structuur hierboven.
Plaats de afbeeldingen in de zelfde folder als de info.json file zoals de afbeelding hieronder:

![usb image](/backend/info/images/usb_all_files_needed.jpg)
