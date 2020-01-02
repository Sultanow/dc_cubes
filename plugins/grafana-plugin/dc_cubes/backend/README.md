## Python Environment
Installiere pipenv:

    pip install pipenv

Stelle sicher, dass du dich im Ordner **backend** befindest

Das ***Pipfile*** definiert ähnlich wie das ***package.json*** die Dependencies und ihre Versionen. 

Mit `pipenv install` werden die Dependiencies installiert und die Umgebung erstellt.

Mit dem Befehl `pipenv shell` wechselst du, von der globalen Python Umgebung,in die vom ***Pipfile*** definierte Umgebung dieses Projekts. 

Benutze `pipenv install <packagename>` bzw. `pipenv unistall <packagename>` um eine Dependency in die Umgebung zu de/installieren.

Mit `exit` verlässt du die Umgebung