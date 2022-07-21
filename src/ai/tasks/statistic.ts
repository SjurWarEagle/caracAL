// const https = require("https");
// const httpsAgent = new https.Agent({
//     rejectUnauthorized: false
// });

import {CharAvgCollector} from "./char-avg-collector";

export class StatisticDistributor {

    constructor(private charAvgCollector: CharAvgCollector) {
        charAvgCollector.startCollecting();
    }

    /**
     * publish global data, only one char needs this
     *
     * 1x @ 1min
     */
    public async startPublishingCharSpecificData() {
        setInterval(() => {
            this.publishCharData();
        }, 60_000)
    }

    /**
     * publish collected avg-data
     *
     *  @ 5min
     */
    public async startPublishingCharAvgData() {
        setInterval(() => {
            this.publishCharAvgData();
        }, 60_000)
    }

    /**
     * 1x @ 5min
     */
    public async startPublishingGlobalData() {
        setInterval(() => {
            this.publishGameInfoData();
        }, 300_000)
    }

    private async publishCharAvgData() {
        await this.postData('http://localhost:3700/charAvg', this.charAvgCollector.getAndReset());
    }

    private async publishCharData() {
        // console.log(parent.character);
        // console.log(JSON.parse(this.stringifyWithoutMethods(parent.character)));
        await this.postData('http://localhost:3700/character', JSON.parse(this.stringifyWithoutMethods(parent.character)))
    }

    private async publishGameInfoData() {
        // console.log(parent.character);
        // console.log(JSON.parse(this.stringifyWithoutMethods(parent.character)));
        await this.postData('http://localhost:3700/GameInfo', G)
    }

    private async postData(url = '', data = {}): Promise<void> {
        // Default options are marked with *
        await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
    }

    private stringifyWithoutMethods(object: any): string {
        let simpleObject: any = {};
        for (let prop in object) {
            if (!object.hasOwnProperty(prop)) {
                continue;
            }
            if (prop.startsWith("_")) {
                continue;
            }
            if (typeof (object[prop]) == 'object') {
                //allow some objects
                if (!prop.startsWith("items")
                    && !prop.startsWith("slots")
                    && prop !== "s"
                    && prop !== "c"
                ) {
                    // console.log(prop);
                    continue;
                }
                // continue;
            }
            if (typeof (object[prop]) == 'function') {
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return JSON.stringify(simpleObject); // returns cleaned up JSON
    };
}
