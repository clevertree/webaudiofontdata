import fs from "fs";
import {drumSets} from "./drumSets.mjs";

const DIR = './sound'
const DIRS = './public'
const files = fs.readdirSync(DIR);
const drumPresets = {};
const drumKeys = [];
const instrumentKeys = [];

for (const file of files) {
    if(file.endsWith('.js')) {
        let fontJS = fs.readFileSync(`${DIR}/${file}`, "utf-8");
        if(file.startsWith('128')) {
            const drumKey = file.replace(/\.js$/, '').substring(3);
            fontJS = fontJS.replaceAll(`_drum_${drumKey}`, '_config')
                .replace("console.log('load _config');", '');
            fontJS = `(() => {${fontJS}; return _config;})()`
            const config = eval(fontJS);
            if (!config)
                throw new Error("Unable to evaluate webfont: " + file);
            fs.writeFileSync(`${DIRS}/p/128${drumKey}.json`, JSON.stringify(config));
            drumKeys.push(drumKey);
            const [pitch, drumSetID, ...libraryStringParts] = drumKey.split('_')
            const libraryString = libraryStringParts.join('_').replace(/\.js$/, '');
            const drumSetName = drumSets[libraryString][parseInt(drumSetID)];
            const libraryName = libraryString
                .replace(/_file$/, '')
                .replace(/_sf2$/, '')
            const presetName = `${libraryName}_${drumSetName}`
                .replaceAll(' ', '_')
                .toLowerCase();
            if(!drumPresets[presetName])
                drumPresets[presetName] = {zones: []}
            drumPresets[presetName].zones.push(...config.zones)
        } else {
            const instrumentKey = file.replace(/\.js$/, '');
            fontJS = fontJS.replaceAll(`_tone_${instrumentKey}`, '_config')
                .replace("console.log('load _config');", '');
            fontJS = `(() => {${fontJS}; return _config;})()`
            const config = eval(fontJS);
            if (!config)
                throw new Error("Unable to evaluate webfont: " + file);
            fs.writeFileSync(`${DIRS}/i/${instrumentKey}.json`, JSON.stringify(config));
            instrumentKeys.push(instrumentKey);
        }
    }
}
for(const presetName of Object.keys(drumPresets)) {
    const config = drumPresets[presetName];
    fs.writeFileSync(`${DIRS}/s/${presetName}.json`, JSON.stringify(config));
}
fs.writeFileSync(`${DIRS}/instrumentKeys.json`, JSON.stringify(instrumentKeys));
fs.writeFileSync(`${DIRS}/drumKeys.json`, JSON.stringify(drumKeys));
fs.writeFileSync(`${DIRS}/drumSets.json`, JSON.stringify(Object.keys(drumPresets)));

