# DC Cubes und Solr lokal aufsetzen
Diese Anleitung hilft beim Einrichten von Cubes (ohne Docker).
Das Setup mit Docker ist einfacher und geht vollautomatisch.
FÜr die Entwicklung ist es allerdings erforderlich DC Cubes mittels Node auszuführen um beispielsweise ein Debuggen zu ermöglichen.
> Hinweis: Diese Anleitung ist aktuell nur für Windows.

## Vorrausetzungen:
1. Installiertes [NodeJS](https://nodejs.org/en/download/) mit Path-Variable für npm

## 1. Projekt klonen
Das Projekt kann entweder per Git geklont werden oder als zip vom Repository bezogen werden.

## 2. Solr herunterladen
Solr kann [hier](https://lucene.apache.org/solr/downloads.html) heruntergeladen werden.
Hier den unter "Binary releases" das zip wählen (Neuste Releaseversion).
Es erfolgt eine Weiterleitung zu den Mirrors. Mit dem obersten Link unter HTTP kann Solr schließlich heruntergeladen werden.

Nach dem erfolgreichen Download kann Solr entpackt z.B. in `C:\development\solr\`
> Bitte den Inhalt von solr-8... entpacken und nicht den Ordner selbst.
Dies Erleichtert das Fortsetzen dieser Anleitung.

## 3. Erlauben von Cross-origin Resource Sharing (CORS)
Damit DC Cubes auf Solr zugreifen darf muss CORS erlaubt werden. Weitere Informationen zu CORS und Solr gibt es unter: https://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/

Hierzu bitte folgende Datei in einem beliebigen Editor öffnen:
`C:\development\solr\server\solr-webapp\webapp\WEB-INF\web.xml`

Direkt nach der `<web-app>` Zeile am Anfang folgendes ergänzen:
```xml
<filter>
  <filter-name>cross-origin</filter-name>
  <filter-class>org.eclipse.jetty.servlets.CrossOriginFilter</filter-class>
  <init-param>
    <param-name>allowedOrigins</param-name>
    <param-value>*</param-value>
  </init-param>
  <init-param>
    <param-name>allowedMethods</param-name>
    <param-value>GET,POST,OPTIONS,DELETE,PUT,HEAD</param-value>
  </init-param>
  <init-param>
    <param-name>allowedHeaders</param-name>
    <param-value>X-Requested-With,Content-Type,Accept,Origin</param-value>
  </init-param>
</filter>

<filter-mapping>
  <filter-name>cross-origin</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>
```

## 4. Starten, Stoppen, Neustarten von Solr
Powershell öffnen und folgende Befehle absetzen:

1. `cd C:\development\solr\bin\`

2. `.\solr.cmd start`

> Um mit der Anleitung fortzusetzen (Schritt 5) muss Solr gestartet sein.

Neustarten von Solr:
`.\solr.cmd restart -p 8983`

Stoppen von Solr:
`.\solr.cmd stop -p 8983`


## 5. DC Cubes Solr Core anlegen
Damit die Daten in Solr importiert werden können muss der entsprechende Core angelegt werden.
In Powershell folgenden Befehl absetzen:
`.\solr.cmd create -c dc_cubes`

## 6. Schema initialisieren und Beispieldaten importieren
Nun muss das Schema der Infrastrukturdaten auf dem angelegten Core angelegt werden.
Zunächst zum geklonten Projektordner wechseln:
`cd C:\development\repos\dc_cubes\src\scripts\`
Folgende Skripte ausführen (Reihenfolge ist wichtig!):
1. `.\init_schema.ps1`
2. `.\pushdata.ps1` (Dauer: ca 2 - 6min - Es werden ca. 70000 Datensätze importiert)

Folgenden Link im Browser öffnen: `http://localhost:8983/solr/dc_cubes/select?q=*%3A*`.
Werden hier Daten angezeigt, dann hat der Import funktioniert.

## 7. DC Cubes Backend starten
1. `cd C:\development\repos\dc_cubes\backend\`
2. `npm install`
3. `npm start`

## 8. DC Cubes Frontend starten
1. `cd C:\development\repos\dc_cubes\`
2. `npm install`
3. `npm start`
