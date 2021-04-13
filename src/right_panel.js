// @flow

import React from 'react';

import Entry from './entry';

import { getDateStr, getDateFromEntryId } from './utils';

import type {
    EntryIdType,
    EntryType,
    EntriesType,
    BacklinkType,
    BacklinkInfoType,
    BacklinksType,
} from './types';

type PropsType = {
    currentBacklink: ?BacklinkType,
    currentBacklinkInfo: ?Array<BacklinkInfoType>,
    backlinks: BacklinksType,
    entries: EntriesType,
    isEditing: boolean,
    onEdit: (newEntry: EntryType, entryId: EntryIdType) => void,
    onBacklink: (backlink: ?BacklinkType) => void,
};

export default function RightPanel(props: PropsType) {
    const {
        currentBacklink,
        currentBacklinkInfo,
        backlinks,
        entries,
        isEditing,
        onEdit,
        onBacklink,
    } = props;

    if (!currentBacklink || !currentBacklinkInfo) {
        return <div className="right" />;
    }

    return (
        <div className="right">
            <h2 className="flex">
                <div className="flex-grow">{currentBacklink}</div>
                <div className="count" onClick={() => onBacklink(null)}>
                    {currentBacklinkInfo.length}
                </div>
            </h2>
            <div>
                {currentBacklinkInfo.map(({ entryId, startPosition }) => {
                    const currentDate = getDateFromEntryId(entryId);
                    const currentDateStr = getDateStr(currentDate);
                    return (
                        <div
                            key={`${entryId}-${startPosition}`}
                            className={isEditing ? 'is-editing' : ''}
                        >
                            <h3>
                                <a href={`#${currentDateStr}`}>
                                    {currentDateStr}
                                </a>
                            </h3>
                            <Entry
                                entry={entries[entryId]}
                                backlinks={backlinks}
                                currentBacklink={currentBacklink}
                                onBacklink={onBacklink}
                                onChange={
                                    isEditing
                                        ? newEntry => {
                                              onEdit(newEntry, entryId);
                                          }
                                        : null
                                }
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
