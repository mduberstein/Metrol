export interface IAlbum {
    title: string;
    trackLength: number; //milliseconds
    trackCount: number;
}

export class Album implements IAlbum {
    constructor(public title: string, public trackLength, public trackCount){

    };
    get durationMsec():number {
        return this.trackCount * this.trackLength;
    }
}