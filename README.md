# Custom Speedtest (Övningsprojekt)

Ett modernt, minimalistiskt hastighetstest för webben
Projektet är skapat för att demonstrera hantering av asynkron JavaScript, `ReadableStreams` och realtidsuppdatering av DOM:en.

# Funktioner:
- Realtidmätning: Visar hastigheten live medans datan strömmar in (Istället för endast resultat)
- CSS-design: En stilren och responsiv UI-design
- Inga beroenden: Vanilla Javascript, HTML5 och CSS3

# Teknikstack:
- Frontend: HTML5, CSS3, JavaScript (ES6+)

# Hur mätningen fungerar:
Nedladdningshastigheten beröknas genom att en stor fil hämtas i bakgrunden med en cache-buster
Genom att läsa av filen i datablock kan applikationen kontinuerligt beräkna: `(Totala nerladdade bytes * 8) / förfluten tid i sekunder`
vilket sedan konverteras till Mbit/s och uppdaterar gränssnittet 10 gånger i sekunden.

