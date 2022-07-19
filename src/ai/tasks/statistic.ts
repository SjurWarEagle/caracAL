const https = require("https");
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

export class StatisticDistributor {
    private async postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
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
        return response.json(); // parses JSON response into native JavaScript objects
    }

    private stringifyWithoutMethods(object: any): string {
        let simpleObject: any = {};
        for (var prop in object) {
            if (!object.hasOwnProperty(prop)) {
                continue;
            }
            if (typeof (object[prop]) == 'object') {
                continue;
            }
            if (typeof (object[prop]) == 'function') {
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return JSON.stringify(simpleObject); // returns cleaned up JSON
    };
}

export function startReportingGrafana() {
    //tmp disabled
    return;
    setInterval(() => {

        const headers = {
                "Content-type": "application/json; charset=UTF-8"
            }
        ;

        fetch("http://192.168.73.58:5000/post", {
            method: "POST",
            // @ts-ignore
            agent: httpsAgent,
            body: JSON.stringify({
                topic: "adventureland/" + character.name,
                message: JSON.stringify({
                    "name": character.name,
                    "gold ": character.gold,
                    "level": character.level,
                    "xp": character.xp,
                    "remain_xp": G.levels[character.level] - character.xp,
                    "hp": character.hp,
                    "max_hp": character.max_hp,
                    "mp": character.mp,
                    "max_mp": character.max_mp,
                    "cc": character.cc,
                    "speed": character.speed,
                    "resistance": character.resistance,
                    "armor": character.armor,
                    "ping": character.ping,
                    "attack": character.attack
                }),
                key: "mykey"
            }),
            headers: headers
        });
        // .then((res: any) => {
        //   return res.json();
        // })
        // .then(console.log);
    }, 60_000);
}
