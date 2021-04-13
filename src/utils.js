// @flow

import { ENTRIES_PER_DAY, START_DATE } from './constants';

import type {
    EntryIdType,
    EntriesType,
    BacklinksType,
    BacklinksInfoType,
} from './types';

export function getNumWords(entries: EntriesType): number {
    return entries
        .map(entry => (entry ?? '').split(' ').length)
        .reduce((a, b) => a + b, 0);
}

export function getNumBacklinkOccurrences(
    backlinksInfo: BacklinksInfoType,
): number {
    return Object.keys(backlinksInfo)
        .map(backlink => backlinksInfo[backlink].length)
        .reduce((a, b) => a + b, 0);
}

export function getNumEntries(entries: EntriesType): number {
    return entries.length;
}

export function getNumBacklinks(backlinks: BacklinksType): number {
    return backlinks.length;
}

export function getDateStr(date: Date): string {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        weekday: 'short',
    });
}

export function getDateFromEntryId(entryId: EntryIdType): Date {
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + Math.floor(entryId / ENTRIES_PER_DAY));
    return date;
}

export function searchBacklinks(
    backlinks: Array<string>,
    prefix: string,
    limit: number,
): Array<string> {
    if (!prefix.length) return backlinks;
    return backlinks
        .filter(backlink => backlink.startsWith(prefix.toLowerCase()))
        .slice(0, limit);
}
