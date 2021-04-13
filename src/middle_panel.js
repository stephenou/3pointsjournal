// @flow

import React from 'react';

import Entry from './entry';

import type {
    EntryIdType,
    EntryType,
    EntriesType,
    EntryIdsByDateType,
    BacklinkType,
    BacklinksType,
} from './types';

type PropsType = {
    entryIdsByDate: EntryIdsByDateType,
    entries: EntriesType,
    backlinks: BacklinksType,
    isEditing: boolean,
    onEdit: (newEntry: EntryType, entryId: EntryIdType) => void,
    onBacklink: (backlink: ?BacklinkType) => void,
};

export default function MiddlePanel(props: PropsType) {
    const {
        entryIdsByDate,
        entries,
        backlinks,
        isEditing,
        onEdit,
        onBacklink,
    } = props;
    const dates = Object.keys(entryIdsByDate).reverse();

    return (
        <div className="middle">
            {dates.map(date => {
                return (
                    <div key={date}>
                        <h2 id={date}>{date}</h2>
                        <div className={isEditing ? 'is-editing' : ''}>
                            {entryIdsByDate[date].map((entryId, index) => (
                                <Entry
                                    key={index}
                                    entry={entries[entryId]}
                                    backlinks={backlinks}
                                    onChange={
                                        isEditing
                                            ? newText => {
                                                  onEdit(newText, entryId);
                                              }
                                            : null
                                    }
                                    onBacklink={onBacklink}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
