// @flow

export type EntryType = string;
export type EntryIdType = number;

export type EntriesType = Array<EntryType>;
export type EntryIdsType = Array<EntryIdType>;

export type EntryIdsByDateType = { [date: string]: EntryIdsType };
export type EntriesByDateType = { [date: string]: EntriesType };

export type BacklinkType = string;
export type BacklinksType = Array<BacklinkType>;

export type BacklinkInfoType = { entryId: EntryIdType, startPosition: number };
export type BacklinksInfoType = {
    [backlink: BacklinkType]: Array<BacklinkInfoType>,
};
