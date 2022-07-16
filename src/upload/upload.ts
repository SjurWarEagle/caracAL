import fs from "fs";
import http, { ClientRequest } from "http";
import querystring from "querystring";

function getAuthCookie(): string {
  if (!fs.existsSync(".secret")) {
    throw new Error("You need to create a .secret file with your auth token.");
  }
  const secret = fs.readFileSync(".secret").toString();
  return `auth=${secret}`;
}

const authCookie: string = getAuthCookie();

class ALUploader {
  // A map from the output JS file names to the request that is handling them,
  // so that we can abort ongoing requests if a rebuild is triggered before a request
  // from a previous rebuild is finished
  private requestMap: Map<string, ClientRequest> = new Map();

  public uploadFile = async (jsFile: string, saveName: string, slot: number) => {
    const code = fs.readFileSync(jsFile);
    const req = await http.request(
      {
        hostname: "adventure.land",
        path: "/api/save_code",
        method: "POST",
        headers: {
          Cookie: authCookie.trim(),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      },
      (res) => {
        res.on("data", (response) => {
          console.log(Buffer.from(response).toString());
          // const asJson: APIResponse[] = JSON.parse(Buffer.from(response).toString());
          // console.log(`${jsFile}: ${asJson[2].message}`);
        });
      }
    );
    req.on("error", (err) => {
      console.error("Error talking to the AL API:", err);
    });

    const r = this.requestMap.get(jsFile);
    if (r) {
      console.log("Aborted ongoing request..");
      r.abort();
    }
    this.requestMap.set(jsFile, req);

    // yes, the API is kind of convoluted.
    // pack it into a JSON object, stringify it and then encode such that
    // we do: /save_code?method=save_code?args=<URI encoded json object>
    const obj = {
      method: "save_code",
      arguments: JSON.stringify({
        slot: slot.toString(),
        code: code.toString(),
        name: saveName,
        log: "0"
      })
    };

    req.write(querystring.stringify(obj));
    req.end();
  };
}

// console.log(getAuthCookie());
const uploader = new ALUploader();

////////////////////////////////////////////////////////////////////////////////
///                          \/ EDIT THIS \/                                ////
////////////////////////////////////////////////////////////////////////////////

async function start() {
  // await uploader.uploadFile("dist/warrior.js", "warrior", 2);
  // await uploader.uploadFile("dist/priest.js", "priest", 3);
  await uploader.uploadFile("CODE/caracAL/chars/merchant.js", "merchant", 4);
  // await uploader.uploadFile("dist/merchant.js", "merchant", 4);
  // await uploader.uploadFile("dist/mage.js", "mage", 5);
  // await uploader.uploadFile("CODE/caracAL/chars/ranger.js", "ranger", 6);
  await uploader.uploadFile("CODE/caracAL/chars/ranger.js", "ranger", 7);
}
////////////////////////////////////////////////////////////////////////////////
///                          /\ EDIT THIS /\                                ////
////////////////////////////////////////////////////////////////////////////////


start().then(() => {});
