import { Model } from 'sequelize-typescript';
export declare class Event extends Model<Event> {
    id: number;
    date: Date;
    event: string;
    identifier: string;
    userId: number;
    data: string;
}
