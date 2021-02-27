import { toNumber } from "lodash";

interface MATCHINTERFACE {
  group: RegExp;
  game: RegExp;
  user: RegExp;
}

const MATCHES: MATCHINTERFACE = {
  group: /(?:https:\/\/)?(?:web|www).roblox.com\/groups\/(?<groupId>[0-9]+)\/[^ \n]+/gi,
  game: /(?:https:\/\/)?(?:web|www).roblox.com\/games\/(?<gameId>[0-9]+)\/[^ \n]+/gi,
  user: /(?:https:\/\/)?(?:web|www).roblox.com\/users\/(?<gameId>[0-9]+)\/[^ \n]+/gi
  // TODO: Add more matches for other parts of the site
  // * Gamepasses, Catalog, etc..
};

type IMATCHKEYS = keyof MATCHINTERFACE;

export interface TextData {
  type: "text";
  data: string;
}
export interface CustomData {
  type: IMATCHKEYS;
  data: { id: number };
}
export type Data = TextData | CustomData;
export type DataContainer = Data[];

export function turnToTextComponents(data: string) {
  const lines = data.split(/\r?\n/g);
  const patchedLines: DataContainer[] = [];

  // * Prepare for regex search
  lines.forEach(line => patchedLines.push([{ type: "text", data: line }]));

  (Object.entries(MATCHES) as Array<[IMATCHKEYS, RegExp]>).forEach(
    ([key, regexp]) => {
      patchedLines.forEach(dataContainer => {
        dataContainer.forEach((data, index) => {
          regexp.lastIndex = 0;
          let result;
          if (data.type === "text")
            while ((result = regexp.exec(data.data)) !== null) {
              const split = data.data.split(result[0]);
              const textValueBefore = split.shift();
              dataContainer.splice(index, 0, {
                type: key,
                data: { id: toNumber(result[1]) }
              });
              if (textValueBefore && textValueBefore !== "")
                dataContainer.splice(index, 0, {
                  type: "text",
                  data: textValueBefore
                });
              data.data = split.join(result[0]);
            }
        });
      });
    }
  );

  return patchedLines;
}
