import { Tag, TagInfo, TagConstructor} from './Tag';
import { Log } from 'src/Log';
import * as fs from 'fs';
import * as path from 'path';

class TagFactory
{
    // Holds all registered tag modules
    static Tags: TagConstructor[] = [];

    static Identify(info: TagInfo): TagConstructor
    {
        for (let tag of TagFactory.Tags)
        {
            if (tag.Identify(info))
                return tag;
        }

        throw new Error("Could not identify tag type");
    }

    static Register(classname: TagConstructor): void
    {
        let name = classname.name;


        if (!(classname.prototype instanceof Tag))
        {
            Log.error("TagFactory::Register(): Class is not instance of Tag", {name});
            return;
        }

        TagFactory.Tags.push(classname);

        Log.info("TagFactory::Register(): Registered tag", {name});
    }

    // Loads all tag modules from 'Tags' dir
    static InitializeTypes(): void
    {
        Log.verbose("TagFactory::InitializeTypes(): Scanning for modules");

        fs.readdir(path.join(__dirname, "Tags"), async (err, files) => {
            for (let file of files)
            {
                Log.verbose("TagFactory::InitializeTypes(): Found module", {file});

                // ./Tags/TypeTag/TypeTag
                let filePath = path.join(__dirname, "Tags", file, file);

                try {
                    const module = await import(filePath);
                    TagFactory.Register(module.default);
                } catch (e) {
                    Log.error("TagFactory::InitializeTypes(): Error importing module", {e});
                }
            }
        });
    }
}

TagFactory.InitializeTypes();

export {
    TagFactory
};
