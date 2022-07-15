const https = require("https");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});


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
