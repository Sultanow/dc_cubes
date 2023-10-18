import timezones from 'timezone-abbr-offsets';

/* START CONFIG BLOCK */

//replace in url: #{vib}
export let censhareDataUrl = "../api/censhare/mock";

//replace in url: #{vib} #{brand} #{locale}
//#{brand} is set to "A01" in TimeBox
export let d2cDataUrl = "../api/d2c/mock";

export let d2cQueueSizeURL = "../api/d2c/queueSize/mock";

//replace in url: #{vib} #{brand} #{locale}
//#{brand} is set to "A01" in TimeBox
export let iCoreDataURL = "../api/icore/mock";

//calc basis is set to one hour in QueueMetrics
export let timeWindow = 5;

//predictions URL
export let predictionURL = 'http://localhost:5000/updatePrediction';

/*  END CONFIG BLOCK  */


//default max time before timeOut set to 5s
export function fetchWithTimeout(uri, time = 5000, method = 'GET', body = '') {
    const controller = new AbortController()

    let config;
    method == 'GET' ? config == { signal: controller.signal, method: method } : config = { signal: controller.signal, method: method, body: JSON.stringify(body) }

    const timeout = setTimeout(() => {
        controller.abort()
    }, time)

    return fetch(uri, config)
        .then((response) => response)
        .catch((error) => {
            if (error.name === 'AbortError') {
                throw new Error('Response timed out')
            }
            throw new Error(error.message)
        })
}

export function timeZonesBrackets(timeString){
    var search = ' ';
    var n = 4;
    var finalValue = timeString.replace(RegExp("^(?:.*? ){" + n + "}"), function (x) { return x.replace(RegExp(search + "$"), " (") });
    finalValue = finalValue.replace(RegExp("^(?:.*? ){" + (n + 1) + "}"), function (x) { return x.replace(RegExp(search + "$"), ") ") });

    return finalValue;
}

export function prettifyXml(sourceXml) {
    const xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    const xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    const resultXml = new XMLSerializer().serializeToString(resultDoc);

    if (resultXml.startsWith('<html xmlns="http://www.w3.org/1999/xhtml">')) {
        return `XML prettifier returned error. Below the original response:

` + sourceXml;
    } else {
        return resultXml;
    }
}