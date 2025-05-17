# UBA Wärmepumpen-Tool

Ein Online-Beratungstool für die Wärmepumpen-Eignung von Gebäuden.

## Projektübersicht

Das Wärmepumpen-Tool ist eine webbasierte Anwendung zur Analyse und Bewertung der Eignung von Gebäuden für Wärmepumpen. 
Es werden Gebäudeinformationen, Raumdaten und Heizkörperinformationen erfasst, um passende Wärmepumpen-Empfehlungen zu geben.

## Technische Details

- **Framework**: Angular 19.2.7
- **UI-Framework**: Bootstrap 5.3.3 mit Bootstrap Icons 1.11.3
- **Build-System**: Angular CLI 19.2.8
- **Hosting**: Express.js basierter Node.js Server

## Komponenten und Struktur

Das Tool folgt einem Wizard-Ansatz mit folgenden Hauptabschnitten:

1. **Gebäude**: Erfassung allgemeiner Gebäudedaten
2. **Räume**: Eingabe von raumspezifischen Daten
3. **Ergebnis**: Auswertung

## Entwicklungsumgebung einrichten

### Voraussetzungen

- Node.js (v20 oder höher)
- npm (wird mit Node.js installiert)
- LibreOffice (für Excel-Konvertierung)

### Installation

1. Repository klonen:
   ```bash
   git clone https://github.com/.../uba-waermepumpen.git
   cd uba-waermepumpen
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Entwicklungsserver starten:
   ```bash
   npm start
   ```
   Die Anwendung ist dann unter `http://localhost:4200/uba-waermepumpen/` erreichbar (`baseHref`-Konfiguration in angular.json).

## Build und Deployment

### Produktions-Build

```bash
npm run build
```

Die Build-Artefakte werden im `dist/uba-waermepumpen/` Verzeichnis erstellt.

Alternativ kann der gesamte Build-Prozess mit dem build.sh Script ausgeführt werden, welches zusätzlich **Version-Informationen** in die Build-Dateien einfügt:

```bash
./build.sh
```

## Projektstruktur

- `src/app/gebaeude/`: Komponenten für die Gebäudeerfassung
- `src/app/raeume/`: Komponenten für die Raumerfassung
- `src/app/ergebnis/`: Komponenten für die Ergebnisdarstellung
- `src/app/shared/`: Gemeinsam genutzte Komponenten wie Tabs
- `src/app/berechnung.service.ts`: Zentrale Datenhaltung und Berechnungslogik

## Datenhaltung

Die Anwendung speichert Benutzereingaben in localStorage. Die Eingaben werden bei Änderungen automatisch gespeichert und beim Laden der Anwendung wiederhergestellt.

## Datenquellen und Excel-Konvertierung

Die Anwendung verwendet Excel-Tabellen als Datenquelle für Berechnungsmodelle und Referenzwerte. Diese werden mit einem speziellen Tool in TypeScript-Module konvertiert.

### Excel zu TypeScript Konvertierung

Um Excel-Dateien in TypeScript-Module zu konvertieren, wird folgendes Kommando verwendet:

```bash
npx tsx xlsx-to-json.ts -i [Excel-Datei].xlsx -o [Ausgabeverzeichnis]
```

Beispiel:
```bash
npx tsx xlsx-to-json.ts -i *_Vorlage.xlsx -o 20250507_WP_Check_Vorlage_ts_export
```

Der Konvertierungsprozess:

1. Konvertiert die Excel-Datei temporär zu LibreOffice FODS Format
2. Extrahiert benannte Bereiche, Formeln und Datenbanktabellen
3. Liest alle Zellwerte und Formeln aus der Excel-Datei
4. Generiert für jedes Arbeitsblatt ein TypeScript-Modul
5. Erstellt zusätzliche TS-Module für benannte Bereiche und Datenbanktabellen
6. Erzeugt eine `master.ts` Datei, die alle Module exportiert

Alle konvertierten Daten werden im Verzeichnis `[Excel-Dateiname]_ts_export` abgelegt und können direkt in der Angular-Anwendung importiert werden.

