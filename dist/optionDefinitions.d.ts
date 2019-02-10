declare const _default: ({
    name: string;
    alias: string;
    type: NumberConstructor;
    defaultValue: number;
    description: string;
} | {
    name: string;
    alias: string;
    type: StringConstructor;
    defaultValue: string;
    description: string;
} | {
    name: string;
    type: StringConstructor;
    defaultValue: string;
    description: string;
    alias?: undefined;
} | {
    name: string;
    type: BooleanConstructor;
    defaultValue: boolean;
    description: string;
    alias?: undefined;
} | {
    name: string;
    type: BooleanConstructor;
    description: string;
    alias?: undefined;
    defaultValue?: undefined;
})[];
export default _default;
