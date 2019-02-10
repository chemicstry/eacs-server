"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const optionDefinitions_1 = __importDefault(require("./optionDefinitions"));
function initOptions() {
    exports.options = commandLineArgs(optionDefinitions_1.default);
    // Print usage
    if (exports.options.help) {
        const sections = [
            {
                header: 'eacs-server',
                content: 'Extensible Access Control System Server'
            },
            {
                header: 'Options',
                optionList: optionDefinitions_1.default
            }
        ];
        console.log(commandLineUsage(sections));
        process.exit();
    }
}
exports.initOptions = initOptions;
