import { TagInfo, TagConstructor } from './Tag';
declare class TagFactory {
    static Tags: TagConstructor[];
    static Identify(info: TagInfo): TagConstructor;
    static Register(classname: TagConstructor): void;
    static InitializeTypes(): void;
}
export { TagFactory };
