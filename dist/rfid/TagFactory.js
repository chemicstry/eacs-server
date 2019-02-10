"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = require("./Tag");
const Log_1 = require("Log");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TagFactory {
    static Identify(info) {
        for (let tag of TagFactory.Tags) {
            if (tag.Identify(info))
                return tag;
        }
        throw new Error("Could not identify tag type");
    }
    static Register(classname) {
        let name = classname.name;
        if (!(classname.prototype instanceof Tag_1.Tag)) {
            Log_1.Log.error("TagFactory::Register(): Class is not instance of Tag", { name });
            return;
        }
        TagFactory.Tags.push(classname);
        Log_1.Log.info("TagFactory::Register(): Registered tag", { name });
    }
    // Loads all tag modules from 'Tags' dir
    static InitializeTypes() {
        Log_1.Log.verbose("TagFactory::InitializeTypes(): Scanning for modules");
        fs.readdir(path.join(__dirname, "Tags"), (err, files) => __awaiter(this, void 0, void 0, function* () {
            for (let file of files) {
                Log_1.Log.verbose("TagFactory::InitializeTypes(): Found module", { file });
                // ./Tags/TypeTag/TypeTag
                let filePath = path.join(__dirname, "Tags", file, file);
                try {
                    const module = yield Promise.resolve().then(() => __importStar(require(filePath)));
                    TagFactory.Register(module.default);
                }
                catch (e) {
                    Log_1.Log.error("TagFactory::InitializeTypes(): Error importing module", { e });
                }
            }
        }));
    }
}
// Holds all registered tag modules
TagFactory.Tags = [];
exports.TagFactory = TagFactory;
TagFactory.InitializeTypes();
