// const https = require("https");
// const httpsAgent = new https.Agent({
//     rejectUnauthorized: false
// });

import {CharAvgCollector} from "./char-avg-collector";
import {TrackTrixCollector} from "./track-trix-collector";

export class StatisticDistributor {

    constructor(private charAvgCollector: CharAvgCollector, private trackTrixCollector: TrackTrixCollector) {
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
    public async startPublishingCharTracktrix() {
        setInterval(() => {
            this.publishTracktrixData();
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

    public async publishBankContent() {
        await this.postData('http://localhost:3700/api/bank', character.bank);
    }

    private async publishCharAvgData() {
        await this.postData('http://localhost:3700/api/charAvg', this.charAvgCollector.getAndReset());
    }

    private async publishCharData() {
        await this.postData('http://localhost:3700/api/character', JSON.parse(this.stringifyWithoutMethods(parent.character)))
    }

    private async publishTracktrixData() {
        await parent.smart_eval('socket.on("tracker", function(a) {tracker = a;render_tracker();hide_modals()})');
        await new Promise(f => setTimeout(f, (character.ping||100)*2));
        await parent.socket.emit("tracker");
        await new Promise(f => setTimeout(f, (character.ping||100)*2));
        await this.postData('http://localhost:3700/api/tracktrix', JSON.parse(this.stringifyWithoutMethods(parent.tracker)))
        console.log(parent.tracker);
    }

    private async publishGameInfoData() {
        await this.postData('http://localhost:3700/api/gameInfo', G)
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
                // continue;
                if (!prop.startsWith("items")
                    && !prop.startsWith("sprites")
                    && !prop.startsWith("slots")
                    && !prop.startsWith("monsters")
                    && !prop.startsWith("monsters_diff")
                    && !prop.startsWith("exchange")
                    && !prop.startsWith("maps")
                    && !prop.startsWith("tables")
                    && !prop.startsWith("max")
                    && !prop.startsWith("drops")
                    && !prop.startsWith("global")
                    && !prop.startsWith("global_static")
                    && prop !== "s"
                    && prop !== "c"
                ) {
                    // console.log(prop);
                    continue;
                }
            }
            if (typeof (object[prop]) == 'function') {
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return JSON.stringify(simpleObject); // returns cleaned up JSON
    };
}
