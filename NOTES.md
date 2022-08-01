# Notes

## Purpose

Just a random collection of ideas and things I found out. To not have to keep everything in mind.

## Logging

## Tracktrix

```js
const get_monster_count = (mtype) => {
    return new Promise((resolve) => {
        parent.socket.removeListener("tracker");
        parent.socket.once("tracker", function (data) {
            parent.smart_eval('socket.on("tracker", function(a) {tracker = a;render_tracker()})');
            resolve([data.monsters[mtype], data.monsters_diff[mtype]]);
        });
        parent.socket.emit("tracker");
    })
}
```

_note_ very costly!

there also is data in `parent.tracker` not sure if above code is needed for updating it.

## Disconnect ##

```js
parent.api_call("disconnect_character", {name: "Sjur"})
parent.api_call("disconnect_character", {name: "Schnapper"})
parent.api_call("disconnect_character", {name: "Elvira"})
```

## Ponty ##

* [09:14] Dre4mc4tcher: is it possible to buy from ponty via code ?
* [09:49] Yabalchoath: sure is.

```javascript
parent.socket.on("secondhands", function (d) {
    var wanting = ["harbringer", "oozingterror", "bowofthedead", "angelwings", "wbook0", "dexbelt", "intbelt", "intring", "dexring"];
    for (var i = 0; i < d.length; i++) {
        if (wanting.indexOf(d[i].name) > -1 && d[i].level == 0) {
            parent.socket.emit("sbuy", {"rid": d[i].rid})
        }
    }
})
```

this goes outside of your loop. ofcourse change the items to what you want. inside your loop you can

```javascript
parent.socket.emit("secondhands")
```

* [09:50] Yabalchoath: but if you do the top part inside your loop, or restart the code, it wont work. need to serverhop /
relog if you do on accident.
* [09:59] egehanhk: Mioya posted the answer, but I'll post my solution aswell since it has on_destroy() in it to so you
don't have to relog.

```javascript
// Handler to buy from Ponty
function secondhands_handler(event) {
    for (const i in event) {
        const item = event[i];
        if (item && item.name === "wbook0") {
            parent.socket.emit("sbuy", {"rid": item.rid});
        }
    }
}
```
