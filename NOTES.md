# Notes
## Purpose
Just a random collection of ideas and things I found out. To not have to keep everything in mind.

## Logging

## Tracktrix

```js
const get_monster_count = (mtype) => {
    return new Promise((resolve) => {
        parent.socket.removeListener("tracker");
        parent.socket.once("tracker", function(data) {
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
parent.api_call("disconnect_character", {name: "Schnapper"})
parent.api_call("disconnect_character", {name: "Elvira"})
```
