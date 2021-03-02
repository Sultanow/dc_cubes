import React, { Component, useEffect, useState } from 'react'
import { timeStamp } from 'console';
import { object } from 'lodash';
import 'brace/ext/searchbox';
import 'brace/mode/xml';
import 'brace/theme/github';
import 'brace/theme/chrome';
import AceEditor from "react-ace";
import { testValue } from "./stringXML"
import { CoreStart } from '../../../../src/core/public';
// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
// import {faClock} from "@fortawesome/free-solid-svg-icons"

import {
    EuiIcon,
    EuiButtonIcon,
    EuiFlyout,
    EuiFlyoutHeader,
    EuiTitle,
    EuiFlyoutBody,
    EuiButton,
    EuiButtonEmpty,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeaderTitle,
    EuiModalHeader,
    EuiOverlayMask,
    EuiFlyoutFooter
} from '@elastic/eui';

type TimeboxState = {
    timePosition: String,
    timestamp: any,
    isEnter: Boolean,
    queueName: String,
    isHistoric: Boolean,
    isFlyOutVisible: boolean,
    windowWidth: number,
    windowHeight: number,
    censhareDataUrl: string,
    d2cDataUrl: string,
    XMLContent: string
}

interface TimeboxProps {
    isEnter: Boolean,
    item: string,
    informationType?: string,
    gte: string,
    lte: string,
    queueName: String,
    timestamp: any,
    http: CoreStart['http']
}

export class TimeBox extends React.Component<TimeboxProps, TimeboxState>{
    constructor(props: any) {
        super(props);

        this.state = {
            timePosition: "",
            timestamp: this.props.timestamp,
            isEnter: true,
            queueName: this.props.queueName,
            isHistoric: true,
            isFlyOutVisible: false,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            censhareDataUrl: "https://cors-test.appspot.com/test?censhare:asset.name=#{vib}",
            d2cDataUrl: "https://cors-test.appspot.com/test?censhare:asset.name=#{vib}", //http://fe0vm2671.bsh.corp.bshg.com:8799/d2c-feed-service/d2c-vib-file-info/vib/#{vib}/brand/#{brand}/locale/#{locale}
            XMLContent: ""
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            timestamp: nextProps.timestamp,
        };
    }

    handleResize = (e) => {
        this.setState({ windowWidth: window.innerWidth });

        this.setState({ windowHeight: window.innerHeight });
    };

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentDidUpdate() {
        //console.log("did update in Timebox props: ", this.props.timestamps)
        //console.log("did update in Timebox state: ", this.state.timestamps)

        //checkDates(this.state.timestamp);
    }

    showFlyOut() {
        if (this.state.isFlyOutVisible == true) {
            var flyOut =
                <EuiFlyout
                    size="l"
                    onClose={() => this.setState({ isFlyOutVisible: false })}
                    aria-labelledby="flyoutTitle">
                    <EuiFlyoutHeader hasBorder>
                        <EuiTitle size="m">
                            <h2 id="flyoutTitle">{this.props.item}</h2>
                        </EuiTitle>
                    </EuiFlyoutHeader>
                    <EuiFlyoutBody>
                        <div style={{ height: (this.state.windowHeight) * 0.7 }} >
                            <AceEditor
                                width="100%"
                                height="100%"
                                mode="xml"
                                theme="chrome"
                                value={this.prettifyXml(this.state.XMLContent)}
                                editorProps={{ $blockScrolling: true }}
                                readOnly={true}
                            />
                        </div>
                    </EuiFlyoutBody>
                    <EuiFlyoutFooter>
                        <EuiButtonEmpty onClick={() => this.setState({ isFlyOutVisible: false })}>Cancel</EuiButtonEmpty>
                    </EuiFlyoutFooter>
                </EuiFlyout>
            return flyOut
        }
    }

    prettifyXml(sourceXml) {
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
        return resultXml;
    }

    async copyToClipBoard() {
        navigator.clipboard.writeText(this.prettifyXml(await this.getXMLContents()));
    }

    async getXMLContents(): Promise<string> {
        if (this.props.item != "" && this.props.item != "undefined") {

            const bodyPicXML = { item: this.props.item };
            switch (this.state.queueName) {
                case "censhare":
                    /* 
                    this.props.http.post("/api/censhare/xml", { body: JSON.stringify(bodyPicXML) }).then(res => {
                        if (res) {
                            console.log(res);
                                            }
                    });
                    */

                    let censhareDataUrl = this.state.censhareDataUrl.replace("#{vib}", this.props.item);
                    await this.fetchWithTimeout(censhareDataUrl)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`${res.status}: ${res.statusText}`);
                            }
                            return res.json()
                        })
                        .then(result => {
                            this.setState({ XMLContent: result["status"] });
                            return result["status"];
                        })
                        .catch((error) => {
                            console.error("Error in censahre XML fetch: " + error.message)
                        })

                    break;

                case "pic":

                    this.props.http.post("/api/pic/xml", { body: JSON.stringify(bodyPicXML) }).then(res => {
                        if (res) {
                            this.setState({ XMLContent: "xml pic" });
                            return "Elasticsearch request has to be tested";
                        }
                    });
                    break;

                case "d2c":

                    let d2cDataUrl = this.state.d2cDataUrl.replace("#{vib}", this.props.item);
                    d2cDataUrl = d2cDataUrl.replace("#{brand}", "A23");
                    d2cDataUrl = d2cDataUrl.replace("#{locale}", this.props.informationType);

                    await this.fetchWithTimeout(d2cDataUrl)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`${res.status}: ${res.statusText}`);
                            }
                            return res.json()
                        })
                        .then(async result => {
                            let d2cXMLURL = result["xml-content"];
                            return await this.fetchWithTimeout(d2cXMLURL)
                                .then(res2 => {
                                    if (!res2.ok) {
                                        throw new Error(`${res2.status}: ${res2.statusText}`);
                                    }
                                    return res2.json()
                                })
                                .then(result2 => {
                                    this.setState({ XMLContent: result2 });
                                    return result2;
                                })
                                .catch(error => {
                                    console.error('Error in D2C XML second request fetch: ', error);
                                });
                        })
                        .catch(error => {
                            console.error('Error in D2C XML first request fetch:: ', error);
                        });

                    break;

                default:
                    this.setState({ XMLContent: "Not implemented yet" });
                    console.log("Not implemented yet...");
                    return;
            }
        }
        else {
            this.setState({ XMLContent: "No item selected" });
            return "No item selected...";
        }
    }

    fetchWithTimeout = (uri, options = {}, time = 5000) => {
        const controller = new AbortController()
        const config = { ...options, signal: controller.signal }

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


    async downloadXML() {
        var xmltext = this.prettifyXml(await this.getXMLContents());

        var pom = document.createElement('a');

        var filename = this.props.item + ".xml";
        var pom = document.createElement('a');
        var bb = new Blob([xmltext], { type: 'text/plain' });

        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);

        pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
        pom.draggable = true;
        pom.classList.add('dragout');

        pom.click();
    }

    render() {
        return (
            <div className="timebox-container" style={timeboxContainer}>
                <div className="time-box" style={this.state.isHistoric ? timebox.historic : timebox.forecast}>
                    <div className="timebox-title" style={this.state.isHistoric ? timeboxTitle.historic : timeboxTitle.forecast}>
                        <EuiIcon type="clock" />  {this.state.isHistoric ? "Inbox" : "Forecast"} {this.props.isEnter ? "Entered" : "Left"}:
                    </div>
                    <div className="timebox-inner-bottom" style={timeboxInnerBottom}>
                        <TimestampDisplay timestamp={this.state.timestamp} />
                    </div>
                    {this.props.isEnter ? <div className="icons-block">
                        <EuiButtonIcon
                            title={'Show XML'}
                            aria-label={'Show XML'}
                            iconType={'document'}
                            onClick={() => {
                                this.getXMLContents();
                                this.setState({ isFlyOutVisible: true })
                            }}
                        />

                        <EuiButtonIcon
                            title={'Copy XML'}
                            aria-label={'Copy XML'}
                            iconType={'copyClipboard'}
                            onClick={() => {
                                this.copyToClipBoard();
                            }}
                        />

                        <EuiButtonIcon
                            title={'Download XML'}
                            aria-label={'Download XML'}
                            iconType={'download'}
                            onClick={() => {
                                this.downloadXML();
                            }}
                        />
                    </div> : <div></div>}

                    {this.showFlyOut()}

                </div>
            </div >
        )
    }
}

export default TimeBox

function checkDates(timestamp) {
    var CurrentDate = new Date();
    if (timestamp && timestamp != undefined && new Date(timestamp.hits.hits[0]._source.timestamp) > CurrentDate) {

    }
    else {

    }
}

// .toLocaleDateString('de-DE', {timeZoneName:'short'}).toString()

const TimestampDisplay = ({ timestamp }) => {
    var offset = new Date().getTimezoneOffset();
    if (timestamp != null && typeof timestamp.hits.hits[0] === "object") {
        return <div style={{ paddingTop: "5px", whiteSpace: "nowrap" }}>{new Date(timestamp.hits.hits[0]._source.timestamp).toDateString() + " " + new Date(timestamp.hits.hits[0]._source.timestamp).toLocaleTimeString('de-DE', { timeZoneName: 'short' }).toString()}</div>;
    }
    return <div style={{ textAlign: "center", paddingTop: "8px" }}>- - - - - - -</div>;
};

function hoursLeft(enter: string, left: string): number {
    //console.log("enter date: ", enter)
    //console.log("left date: ", left)

    var enterDate = new Date(enter)
    var leftDate = new Date(left)

    var hours = Math.abs(enterDate.getTime() - leftDate.getTime()) / 36e5
    console.log("Hours Left: ", hours)
    return Math.round(hours)
}

const timeboxContainer = {
    position: "relative" as "relative",
    width: "75%",
    marginBottom: "15px",
    marginTop: "15px",
    fontSize: ".7rem"
}

const timeboxInnerBottom = {
    // display: "flex",
}

const timeboxTitle = {
    historic: {
        // fontSize: ".8rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "#2e2e2e",
        textTransform: "uppercase" as "uppercase",
        opacity: ".7"
    },
    forecast: {
        // fontSize: ".8rem", 
        fontWeight: "bold" as "bold",
        textAlign: "left" as "left",
        color: "#2e2e2e",
        textTransform: "uppercase" as "uppercase",
        opacity: ".7"
    }
}

const iconClock = {
    historic: {
        color: "lightgrey",
        fontSize: "1rem",
        marginRight: "4px"
    },
    forecast: {
        color: "black",
        opacity: ".3",
        fontSize: "1rem",
        marginRight: "4px"
    }
}

const timebox = {
    historic: {
        backgroundColor: "white",
        color: "black",
        border: "2px solid #dbdbdb",
        borderRadius: "10px",
        // fontSize: ".8rem",
        padding: "10px",
        cursor: "pointer",
        height: "70px"
    },
    forecast: {
        backgroundColor: "#e9dcf7",
        color: "black",
        border: "2px solid #e9dcf7",
        borderRadius: "10px",
        // fontSize: ".8rem",
        padding: "10px",
        cursor: "pointer",
        height: "70px"
    }
}