# DC-Cubes per Docker starten

<img src="img/cubes_screenshot.png" alt="drawing" width="560"/>

Diese Anleitung hilft beim Ausführen von DC_Cubes mithilfe von Docker und ist aktuell nur für Windows
vorgesehen. 

## 1. Voraussetzungen

1. Windows 10 mit installiertem [Docker-Desktop](https://hub.docker.com/editions/community/docker-ce-desktop-windows).
2. Lokale Version des [Repositorys](https://github.com/Sultanow/dc_cubes) per Git klonen. Alternativ kann auch das Repo als Zip heruntergeladen und entpackt werden.

## 2. Bauen und Starten von DC-Cubes
Starten der Powershell (Windowstaste > Suchen nach "Windows PowerShell" > starten)
Zum Repository wechseln:
```
cd C:\**HIER_PFAD_EINFÜGEN**\dc_cubes
```
Aus dem **Hauptverzeichnis** des lokal vorliegenden Repos folgenden Befehl ausführen:
```
 .\docker\start.ps1
 ```
Anschließend wird DC-Cubes für gebaut, die notwendigen Docker-Container werden hochgefahren und der Import von Beispieldaten wird gestartet.
Wenn das Script durchgelaufen ist (Laufzeit ca. 8-10 min), dann öffnet sich der Standardbrowser mit der Adresse zu DC-Cubes.

## 3. Ändern der Datenquelle (Temporärer notwendiger Schritt):

Zunächst erscheint folgende Fehlermeldung:

<img src="img/cubes_datenquelle_nicht_erreichbar.jpg" alt="drawing" width="400"/>

Da die Adresse zur Datenquelle (Apache Solr) von der Entwicklungsinstanz abweicht, muss derzeit die Datenquelle in DC-Cubes händisch angepasst werden. Dieser Schritt fällt demnächst weg - eine Lösung hierfür befindet sich aktuell in Entwicklung.

Die Datenquelle kann über diesen Punkt "Einstellung Datenquelle" (Icon in der Sidebar): 

<img src="img/cubes_datenquelle_einstellungen.jpg" alt="drawing" width="48"/>

angepasst werden. 

Folgende Einstellungen sind vorzunehmen:

<img src="img/cubes_docker_solr_einstellungen.png" alt="drawing" width="524"/>

Wichtig ist hier die Anpassung der URL von ```http://localhost:8983/solr/``` auf ```http://localhost/solr/```

----

## Problembehandlung

### Datenquelle nicht erreichbar

Bitte überprüfen ob Schritt 3. durchgeführt wurde. 
Zusätzlich kann mithilfe des Befehls ```docker ps ``` nachgesehen werden, ob die Container auch laufen:
<img src="img/cubes_dockerps.jpg" alt="drawing" width="600"/>

Sicherstellen, dass hier bei Container (NAMES): dc_cubes und dc_cubes_solr gelistet sind und der Status jeweils "Up" entspricht. 

Bei Fehlern bitte mit ```docker logs dc_cubes``` bzw. ```docker logs dc_cubes_solr``` die Logs anschauen und ggf. die Ausgabe an die Entwickler weiterleiten.

> In jedem Fall kann das Skript auch einfach nochmals gestartet werden. Hierzu wieder bei Schritt 1 beginnen.

### Keine Daten sichtbar?

Wurde die Seite neugeladen? - Dann muss die Datenquelle aktuell leider erneut angepasst werden.
Eine Speicherung der Einstellung ist derzeit in Entwicklung.





