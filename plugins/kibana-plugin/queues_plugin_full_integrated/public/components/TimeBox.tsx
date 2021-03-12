import React, { Component, useEffect, useState } from 'react'
import { timeStamp } from 'console';
import { object } from 'lodash';
import 'brace/ext/searchbox';
import 'brace/mode/xml';
import 'brace/theme/github';
import 'brace/theme/chrome';
import AceEditor from "react-ace";
import { iCoreDataURL, d2cDataUrl, censhareDataUrl, fetchWithTimeout, prettifyXml } from "./Utils";
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
    EuiButtonEmpty,
    EuiFlyoutFooter,
    EuiBottomBar,
    EuiFlexGroup,
    EuiFlexItem,
    EuiTextColor

} from '@elastic/eui';
import { AuthResultType } from '../../../../src/core/server';
import { hasLeadingWildcard } from '../../../../src/plugins/data/common/es_query/kuery/node_types/wildcard';

type TimeboxState = {
    timePosition: String,
    timestamp: any,
    isEnter: Boolean,
    queueName: String,
    isHistoric: Boolean,
    isFlyOutVisible: boolean,
    isErrorVisible: boolean,
    windowWidth: number,
    windowHeight: number,
    XMLContent: string,
    errorMessage: string
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
            isErrorVisible: false,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            XMLContent: "<Loading.../>",
            errorMessage: ""
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

    showError() {
        if (this.state.isErrorVisible == true) {
            var errorbar =
                <EuiBottomBar>
                    <EuiFlexGroup justifyContent="spaceBetween">
                        <EuiFlexItem grow={false}>
                            <EuiFlexGroup gutterSize="s">
                                <EuiFlexItem grow={false}>
                                    <EuiTextColor color="ghost">{this.state.errorMessage} </EuiTextColor>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                            <EuiFlexGroup gutterSize="s">
                                <EuiFlexItem grow={false}>
                                    <EuiButtonEmpty
                                        onClick={() => this.setState({ isErrorVisible: false })}
                                        color="danger"
                                        size="s"
                                        iconType="cross">
                                        close
                                    </EuiButtonEmpty>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                </EuiBottomBar >
            return errorbar
        }
    }

    showFlyOut() {
        if (this.state.isFlyOutVisible == true) {
            var flyOut =
                <EuiFlyout
                    size="l"
                    onClose={() => this.setState({ isFlyOutVisible: false, isErrorVisible: false })}
                    aria-labelledby="flyoutTitle">
                    <EuiFlyoutHeader hasBorder>
                        <EuiTitle size="m">
                            <h2 id="flyoutTitle">{this.props.item == "undefined" || this.props.item == "" ? "No item selected" : this.props.item + " (" + this.state.queueName + ")"}</h2>
                        </EuiTitle>
                    </EuiFlyoutHeader>
                    <EuiFlyoutBody>
                        <div style={{ height: (this.state.windowHeight) * 0.7 }} >
                            <AceEditor
                                width="100%"
                                height="100%"
                                mode="xml"
                                theme="chrome"
                                value={this.state.XMLContent}
                                editorProps={{ $blockScrolling: true }}
                                readOnly={true}
                            />
                        </div>
                    </EuiFlyoutBody>
                    <EuiFlyoutFooter>
                        <EuiButtonEmpty onClick={() => this.setState({ isFlyOutVisible: false, isErrorVisible: false })}>Cancel</EuiButtonEmpty>
                    </EuiFlyoutFooter>
                </EuiFlyout>
            return flyOut
        }
    }


    async copyToClipBoard() {
        navigator.clipboard.writeText(prettifyXml(await this.getXMLContents()));
    }

    async getXMLContents(): Promise<string> {
        if (this.props.item != "" && this.props.item != "undefined") {
            if (this.props.informationType == undefined) {
                this.setState({ errorMessage: "Item could not be found", isErrorVisible: true, XMLContent: "<Item_could_not_be_found.../>" });
                return "<Item_could_not_be_found.../>";
            }
            else {
                let dataUrl;
                switch (this.state.queueName) {
                    case "censhare":
                        dataUrl = censhareDataUrl.replace("#{vib}", this.props.item);
                        return await fetchWithTimeout(dataUrl)
                            .then(res => {
                                if (!res.ok) {
                                    this.setState({ errorMessage: "Censhare XML response has status " + res.status + "; Error Message: " + res.statusText, isErrorVisible: true });
                                    throw new Error(`${res.status}: ${res.statusText}`);
                                }
                                return res.text();
                            })
                            .then(result => {
                                this.setState({ XMLContent: prettifyXml(result) });
                                return result;
                            })
                            .catch((error) => {
                                this.setState({ errorMessage: "Error in censahre XML fetch: " + error.message + "; Request URL:  " + dataUrl, isErrorVisible: true });
                                return ("Error in censahre XML fetch: " + error.message);
                            })

                    case "PICenter":
                        dataUrl = "/api/pic//mock";
                        const body = { item: this.props.item };
                        this.props.http.post(dataUrl, { body: JSON.stringify(body) }).then(res => {
                            this.setState({ XMLContent: "TEST" })
                            return "TEST";
                        });

                    case "D2C":

                        dataUrl = d2cDataUrl.replace("#{vib}", this.props.item);
                        dataUrl = dataUrl.replace("#{brand}", "A01");
                        dataUrl = dataUrl.replace("#{locale}", this.props.informationType);

                        return await fetchWithTimeout(dataUrl)
                            .then(res => {
                                if (!res.ok) {
                                    this.setState({ errorMessage: "D2C XML first response has status " + res.status + "; Error Message: " + res.statusText, isErrorVisible: true });
                                    throw new Error(`${res.status}: ${res.statusText}`);
                                }
                                return res.json()
                            })
                            .then(async result => {
                                let d2cXMLURL = result["xml-content"];
                                if (d2cXMLURL.startsWith("http") || d2cXMLURL.startsWith("//") || d2cXMLURL.startsWith("../")) {
                                    return await fetchWithTimeout(d2cXMLURL)
                                        .then(innerXML => {
                                            if (!innerXML.ok) {
                                                this.setState({ errorMessage: "D2C XML second response has status " + innerXML.status + "; Error Message: " + innerXML.statusText, isErrorVisible: true });
                                                throw new Error(`${innerXML.status}: ${innerXML.statusText}`);
                                            }
                                            return innerXML.text()
                                        })
                                        .then(innerResult => {
                                            this.setState({ XMLContent: prettifyXml(innerResult) });
                                            return innerResult;
                                        })
                                        .catch(error => {
                                            this.setState({ errorMessage: "Error in D2C XML second request fetch: " + error.message, isErrorVisible: true });
                                            return ("Error in D2C XML first request fetch: " + error.message);
                                        });
                                } else {
                                    this.setState({ errorMessage: "Error in D2C XML first request response. XMLURL: " + d2cXMLURL, isErrorVisible: true });
                                    return ("Error in D2C XML first request response. XMLURL: " + d2cXMLURL);
                                }
                            })
                            .catch(error => {
                                this.setState({ errorMessage: "Error in D2C XML first request fetch: " + error.message, isErrorVisible: true });
                                return ("Error in D2C XML first request fetch: " + error.message);
                            });

                    case "iCore":

                        let iCoreSite = ['MCW', 'MOK', 'SHA', 'SGP'];
                        let iCoreSiteUnit = 'PROD';
                        let producttype = 'VIB';

                        dataUrl = iCoreDataURL + iCoreSite[0] + '%20' + iCoreSiteUnit + '%20' + producttype + '%20' + this.props.item + '%20' + this.props.informationType;

                        return await fetchWithTimeout(dataUrl)
                            .then(res => {
                                if (!res.ok) {
                                    this.setState({ errorMessage: "iCore XML first response has status " + res.status + "; Error Message: " + res.statusText, isErrorVisible: true });
                                    throw new Error(`${res.status}: ${res.statusText}`);
                                }
                                return res.json()
                            })
                            .then(async result => {
                                let iCoreXMLURL = result["_source"]["docUrl"];
                                if (iCoreXMLURL.startsWith("http") || iCoreXMLURL.startsWith("//") || iCoreXMLURL.startsWith("../")) {
                                    return await fetchWithTimeout(iCoreXMLURL)
                                        .then(innerXML => {
                                            if (!innerXML.ok) {
                                                this.setState({ errorMessage: "iCore XML second response has status " + innerXML.status + "; Error Message: " + innerXML.statusText, isErrorVisible: true });
                                                throw new Error(`${innerXML.status}: ${innerXML.statusText}`);
                                            }
                                            return innerXML.text()
                                        })
                                        .then(innerResult => {
                                            this.setState({ XMLContent: prettifyXml(innerResult) });
                                            return innerResult;
                                        })
                                        .catch(error => {
                                            this.setState({ errorMessage: "Error in iCore XML second request fetch: " + error.message, isErrorVisible: true });
                                            return ("Error in iCore XML first request fetch: " + error.message);
                                        });
                                } else {
                                    this.setState({ errorMessage: "Error in iCore XML first request response. XMLURL: " + iCoreXMLURL, isErrorVisible: true });
                                    return ("Error in D2C XML first request response. XMLURL: " + iCoreXMLURL);
                                }
                            })
                            .catch(error => {
                                this.setState({ errorMessage: "Error in iCore XML first request fetch: " + error.message, isErrorVisible: true });
                                return ("Error in iCore XML first request fetch: " + error.message);
                            });


                    default:
                        this.setState({ XMLContent: "<Not_implemented_yet.../>" });
                        return "<Not_implemented_yet.../>";
                }
            }
        }
        else {
            this.setState({ errorMessage: "No item selected", isErrorVisible: true, XMLContent: "<No_item_selected.../>" });
            return "<No_item_selected.../>";
        }
    }

    async downloadXML() {
        var xmltext = prettifyXml(await this.getXMLContents());

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
                        <TimestampDisplay data={this.state.timestamp} queueName={this.state.queueName} isEnter={this.props.isEnter} />
                    </div>
                    {this.props.isEnter ? <div className="icons-block">
                        <EuiButtonIcon
                            title={'Show XML'}
                            aria-label={'Show XML'}
                            iconType={'document'}
                            onClick={() => {
                                this.setState({ XMLContent: "<Loading.../>" });
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
                    {this.showError()}
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

const TimestampDisplay = ({ data, queueName, isEnter }) => {
    var offset = new Date().getTimezoneOffset();

    if (queueName == "D2C") {
        if (!isEnter) {
            //TODO correct formatting
            let timestamp = data.toString();
            timestamp = timestamp.replace("CET", "MEZ");
            timestamp = timestamp.slice(0, -5);
            return <div style={{ paddingTop: "5px", whiteSpace: "nowrap" }}>{timestamp}</div>;
        }
    } else if (data != null && typeof data.hits.hits[0] === "object") {
        return <div style={{ paddingTop: "5px", whiteSpace: "nowrap" }}>
            {new Date(data.hits.hits[0]._source.timestamp).toDateString() + " " + new Date(data.hits.hits[0]._source.timestamp).toLocaleTimeString('de-DE', { timeZoneName: 'short' }).toString()}</div>;
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