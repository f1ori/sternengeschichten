# ⭐ Sternengeschichten - Podcast PWA

Eine Web App zum Streamen des [Sternengeschichten Podcast](https://sternengeschichten.podigee.io/) von Florian Freistetter. Eine simple App um alle Episoden eine nach der anderen anzuhören.

**🌐 [Zur App](https://f1ori.github.io/sternengeschichten/)**

## Über diese App

Die **Sternengeschichten Podcast-App** ist die einfachste Podcast-App: optimiert für genau eine Podcast-Serie. Sie ermöglicht es dir, bei einer beliebigen Episode zu starten und die Serie dann Episodenweise durchzuarbeiten. 

Diese App wurde speziell für eine **Schlaf-Routine** entwickelt – zum Anhören einer Episode jeden Abend vor dem Schlafengehen. Sie interferiert nicht mit Playlisten anderer Podcasts.

## ⚠️ Disclaimer

Diese App ist **nicht** offiziell mit Florian Freistetter oder dem Sternengeschichten-Podcast verbunden. Sie wurde von KI generiert.

## Features

- 🎙️ **600+ Episoden streamen** - Keine Downloads nötig, direkt aus dem Heimnetz
- 📱 **Progressive Web App** - Installierbar auf Desktop und mobilen Geräten
- 💾 **Lokales Feed-Caching** - RSS-Feed wird lokal gespeichert, manuelles Aktualisieren möglich
- 🔖 **Merkt sich die zuletzt angezeigte Episode** - Speichert nur die ID der zuletzt angezeigten Episode (keine Zeitpositionen)
- 🎚️ **Abspielgeschwindigkeit** - Unterstützt 0.75x bis 2x Geschwindigkeit
- ⏩ **Schnelle Navigation** - ±30 Sekunden Spulen und Fortschrittsleiste
- 📴 **Offline Support** - Basis-Offline-Funktionalität durch Service Worker

## Tech Stack

- **Vue 3** - Reaktives UI-Framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Schneller Build-Tool und Dev-Server
- **Pinia** - State Management
- **IndexedDB** - Lokales Feed-Caching
- **HTML5 Audio** - Direkte Audio-Streaming
- **Service Worker** - PWA-Funktionalität

## Installation & Entwicklung

### Voraussetzungen
- Node.js 18+
- npm

### Setup

```bash
# Abhängigkeiten installieren
npm install

# Development-Server starten (öffnet auf http://localhost:5173)
npm run dev

# Production-Build erstellen
npm run build

# Build-Ergebnis Preview
npm preview
```

## Verwendung

1. **App öffnen** - Beim ersten Start lädt die App den Podcast-Feed
2. **Feed aktualisieren** (optional) - Klicke "Feed aktualisieren" für die neuesten Episoden
3. **Episode auswählen** - Klicke auf eine Episode in der Liste
4. **Abspielen** - Nutze die Play/Pause, Spulen und Geschwindigkeitsregler
5. **Fortschritt speichern** - Es wird nur die zuletzt angezeigte Episode gespeichert (ID), nicht die exakte Zeitposition
6. **Nächste Episode** - Beim nächsten Start wird die Episode nach der zuletzt angezeigten vorgeschlagen

## Architektur

### Services
- **feedService.ts** - Lädt und parsed den Podcast-RSS-Feed, cachert in IndexedDB

### State Management (Pinia)
- **podcastStore** - Verwaltet die Episode-Liste
- **playbackStore** - Speichert nur die zuletzt angezeigte Episode (ID), persistiert in localStorage

### Komponenten
- **App.vue** - Main-Container, Feed-Management und Layout
- **EpisodeList.vue** - Episoden-Liste mit Fortschrittsanzeige
- **AudioPlayer.vue** - Audio-Player mit Kontrollen und Fortschritt

### PWA
- **manifest.json** - PWA-Manifest mit App-Metadaten
- **sw.js** - Service Worker für Offline-Support und Caching

## Datenspeicherung

- **IndexedDB** - RSS-Feed-Metadaten (Episoden, Beschreibungen, Audio-URLs)
- **localStorage** - Nutzer-Einstellungen und Abspielfortschritt

## License

MIT

## Credits

Podcast von Florian Freistätter

https://sternengeschichten.podigee.io/
