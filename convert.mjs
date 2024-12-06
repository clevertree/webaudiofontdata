import fs from "fs";
import {drumSets} from "./drumSets.mjs";

const PRESET_PATH_INSTRUMENT_KEYS = '/instrumentKeys.json'
const PRESET_PATH_INSTRUMENT_NAMES = '/instrumentNames.json'
const PRESET_PATH_PERCUSSION_KEYS = '/percussionKeys.json'
const PRESET_PATH_PERCUSSION_NAMES = '/percussionNames.json'
const PRESET_PATH_DRUMSET_KEYS = '/drumSets.json'
const PRESET_PATH_DRUMSET_NAMES = '/drumSetNames.json'
const PRESET_PATH_INSTRUMENT = '/i'
const PRESET_PATH_PERCUSSION = '/p'
const PRESET_PATH_DRUMSET = '/s'

const DIR = './sound'
const DIRS = './public'
const files = fs.readdirSync(DIR);
const drumPresets = {};
const drumKeys = [];
const instrumentKeys = [];

for (const file of files) {
    if (file.endsWith('.js')) {
        let fontJS = fs.readFileSync(`${DIR}/${file}`, "utf-8");
        if (file.startsWith('128')) {
            const drumKey = file.replace(/\.js$/, '').substring(3);
            fontJS = fontJS.replaceAll(`_drum_${drumKey}`, '_config')
                .replace("console.log('load _config');", '');
            fontJS = `(() => {${fontJS}; return _config;})()`
            const config = eval(fontJS);
            if (!config)
                throw new Error("Unable to evaluate webfont: " + file);
            fs.writeFileSync(`${DIRS}${PRESET_PATH_PERCUSSION}/${drumKey}.json`, JSON.stringify(config));
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
            if (!drumPresets[presetName])
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
            fs.writeFileSync(`${DIRS}/${PRESET_PATH_INSTRUMENT}${instrumentKey}.json`, JSON.stringify(config));
            instrumentKeys.push(instrumentKey);
        }
    }
}
for (const presetName of Object.keys(drumPresets)) {
    const config = drumPresets[presetName];
    fs.writeFileSync(`${DIRS}/s/${presetName}.json`, JSON.stringify(config));
}
fs.writeFileSync(`${DIRS}${PRESET_PATH_INSTRUMENT_KEYS}`, JSON.stringify(instrumentKeys));
fs.writeFileSync(`${DIRS}${PRESET_PATH_DRUMSET_KEYS}`, JSON.stringify(drumKeys));
fs.writeFileSync(`${DIRS}${PRESET_PATH_DRUMSET}`, JSON.stringify(Object.keys(drumPresets)));

