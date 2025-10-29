# UD Block: Muotamap

Ein interaktiver Karten-Block auf Basis von **Leaflet.js**, optimiert für die Anzeige und Verwaltung von Messstationen, Standorten oder Routen entlang der Muota.  
Das Plugin integriert zwei Blöcke – eine **Einzelkarte** und eine **Sammlungskarte** – zur flexiblen Darstellung von Messpunkten, Strecken und Detailinformationen.

---

## Funktionen

- 🌍 **Zwei Block-Typen**
  - `muotamap/single-map` – zeigt eine einzelne Station oder Position
  - `muotamap/collection-map` – zeigt mehrere Punkte oder Standorte gemeinsam
- 🗺️ **Leaflet-Integration** mit OpenStreetMap-Tiles
- 📍 Dynamische Marker für Messstationen, Routen oder benutzerdefinierte Punkte
- 🚶 **Routenanzeige & Navigation** via *Leaflet Routing Machine*
- 🔄 Echtzeit-Aktualisierung über JSON- oder REST-Datenquellen möglich
- 🎨 Anpassbares Design über globale Styles (`global.css`)
- 🔧 Kompatibel mit **Full Site Editing (FSE)**
- 💡 Erweiterbar durch zusätzliche Layer oder GeoJSON-Daten

---

## Editor-Ansicht

![Editor-Ansicht](./assets/editor-view.png)
*Abbildung: Karte im Gutenberg-Editor mit Vorschau der Station oder Sammlung.*

---

## Frontend-Ansicht

![Frontend-Ansicht](./assets/ud-muotamap.png)
*Abbildung: Darstellung im Frontend.*

---

## Technische Details

- Basierend auf **Leaflet.js** und **Leaflet Routing Machine**
- JavaScript-Dateien:
  - `leaflet.js` – Karten-Engine
  - `leaflet-routing-machine.js` – Routing-Erweiterung
  - `view.js` – Frontend-Logik (Initialisierung & Interaktion)
  - `edit.js` – Gutenberg-Integration
- PHP-Integration (`ud-muotamap.php`) registriert Skripte, Styles und Blöcke
- Unterstützt Block-Attribute und REST-basierte Datenübergabe
- Beide Blöcke verwenden einheitliche CSS-Struktur (`global.css`, `editor.css`)

---

## Installation

1. Plugin-Ordner `ud-muotamap-block` in `wp-content/plugins/` kopieren  
2. Im WordPress-Backend unter **Plugins → Installierte Plugins** aktivieren  
3. Im Block-Editor den Block **„UD Muotamap“** einfügen  
4. Zwischen *Single Map* und *Collection Map* wählen  
5. Marker oder Datenquelle konfigurieren  

---

## Anforderungen

- WordPress ≥ 6.7  
- PHP ≥ 7.4  
- Aktiver Block-Editor (Gutenberg oder FSE-Theme)
- Internetzugang für OpenStreetMap-Tiles

---

## Autor

**ulrich.digital gmbh**  
[https://ulrich.digital](https://ulrich.digital)

---

## Lizenz

GPL v2 or later  
[https://www.gnu.org/licenses/gpl-2.0.html](https://www.gnu.org/licenses/gpl-2.0.html)
