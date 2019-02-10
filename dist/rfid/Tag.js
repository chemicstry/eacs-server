"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tag {
    constructor(info, transceiveFn) {
        this.info = info;
        this.Transceive = transceiveFn;
    }
    // returns true if taginfo matches the specific card type
    static Identify(info) {
        return false;
    }
}
exports.Tag = Tag;
