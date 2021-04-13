// @flow

import React from 'react';

import './app.css';

import LeftPanel from './left_panel';
import MiddlePanel from './middle_panel';
import RightPanel from './right_panel';

import {
    INITIAL_ENTRIES,
    ENTRIES_PER_DAY,
    START_DATE,
    LOCAL_STORAGE_KEY,
} from './constants';
import { BACKLINK_REGEX, ITEM_REGEX } from './regex';
import { getDateStr } from './utils';

import type {
    EntryType,
    EntryIdType,
    EntriesType,
    EntryIdsByDateType,
    BacklinkInfoType,
    BacklinksInfoType,
} from './types';

function getEntryIdsByDate(entries: EntriesType): EntryIdsByDateType {
    const entryIdsByDate: EntryIdsByDateType = {};
    const count = Math.floor(entries.length / ENTRIES_PER_DAY);
    for (let i = 0; i < count; i++) {
        const currentDate = new Date(START_DATE);
        currentDate.setDate(currentDate.getDate() + i);
        const currentDateStr = getDateStr(currentDate);
        entryIdsByDate[currentDateStr] = [];
        for (let j = 0; j < ENTRIES_PER_DAY; j++) {
            entryIdsByDate[currentDateStr].push(i * ENTRIES_PER_DAY + j);
        }
    }
    return entryIdsByDate;
}

function getBacklinksInfo(entries: EntriesType): BacklinksInfoType {
    const backlinksInfo: BacklinksInfoType = {};
    entries.forEach((entry, entryId) => {
        let match;
        while ((match = BACKLINK_REGEX.exec(entry))) {
            const backlink = match[1].toLowerCase();
            const startPosition = match.index;
            const backlinkInfo: BacklinkInfoType = {
                entryId,
                startPosition,
            };
            if (backlinksInfo[backlink]) {
                backlinksInfo[backlink].push(backlinkInfo);
            } else {
                backlinksInfo[backlink] = [backlinkInfo];
            }
        }
    });
    return backlinksInfo;
}

function importData(file: File): Promise<EntriesType> {
    return file.text().then(text => {
        const lines = text
            .split('\n')
            .filter(line => ITEM_REGEX.test(line))
            .map(line => line.substring(3));
        const entries = new Array(lines.length);
        const count = Math.floor(lines.length / ENTRIES_PER_DAY);
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < ENTRIES_PER_DAY; j++) {
                const index = (count - 1 - i) * ENTRIES_PER_DAY + j;
                entries[index] = lines[i * ENTRIES_PER_DAY + j];
            }
        }
        return entries;
    });
}

function getExportData(
    entries: EntriesType,
    entryIdsByDate: EntryIdsByDateType,
): string {
    const fragments = [];
    Object.keys(entryIdsByDate)
        .reverse()
        .forEach(date => {
            fragments.push(`\n## ${date}`);
            entryIdsByDate[date]
                .map(entryId => entries[entryId])
                .forEach((entry, index) => {
                    fragments.push(`${index + 1}. ${entry}`);
                });
        });
    return `# Journal${fragments.join('\n')}`;
}

function exportData(
    entries: EntriesType,
    entryIdsByDate: EntryIdsByDateType,
): void {
    const data = getExportData(entries, entryIdsByDate);
    const blob = new Blob([data], { type: 'text/plain' });
    const filename = 'journal.txt';
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    if (document.body) {
        document.body.appendChild(element);
    }
    element.click();
    if (document.body) {
        document.body.removeChild(element);
    }
}

export default function App() {
    const [entries, setEntries] = React.useState(INITIAL_ENTRIES);
    const [currentBacklink, setCurrentBacklink] = React.useState(null);
    const [isEditing, setIsEditing] = React.useState(true);
    const onKeyDown = e => {
        if (e.key === 'Control') {
            setIsEditing(isEditing => !isEditing);
        }
    };
    const padAndSetEntries = (entries: EntriesType) => {
        let paddedEntries = entries;
        let incomplete = false;
        for (let i = 0; i < ENTRIES_PER_DAY; i++) {
            if (!entries[entries.length - 1 - i]) {
                incomplete = true;
            }
        }
        if (!incomplete) {
            paddedEntries = [...entries, ...INITIAL_ENTRIES];
        }
        saveEntries(paddedEntries);
    };
    const getSavedEntries = () => {
        const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }
    };
    React.useEffect(() => {
        window.addEventListener('keydown', onKeyDown);
        getSavedEntries();
    }, []);

    const entryIdsByDate = React.useMemo(() => getEntryIdsByDate(entries), [
        entries,
    ]);
    const backlinksInfo = React.useMemo(() => getBacklinksInfo(entries), [
        entries,
    ]);
    const backlinks = Object.keys(backlinksInfo);
    const currentBacklinkInfo =
        currentBacklink && backlinksInfo[currentBacklink.toLowerCase()]
            ? backlinksInfo[currentBacklink.toLowerCase()].slice().reverse()
            : null;

    const saveEntries = (entries: EntriesType) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
        setEntries(entries);
    };
    const onImport = (file: File) => {
        importData(file).then(padAndSetEntries);
    };
    const onExport = () => {
        exportData(entries, entryIdsByDate);
    };
    const onClear = () => {
        saveEntries(INITIAL_ENTRIES);
    };
    const onEdit = (newEntry: EntryType, entryId: EntryIdType) => {
        if (entries[entryId] === newEntry) return;
        const newEntries = [
            ...entries.slice(0, entryId),
            newEntry,
            ...entries.slice(entryId + 1),
        ];
        padAndSetEntries(newEntries);
    };
    const onBacklink = backlink => {
        setCurrentBacklink(backlink);
    };

    return (
        <div className="container">
            <LeftPanel
                backlinksInfo={backlinksInfo}
                backlinks={backlinks}
                entries={entries}
                onBacklink={onBacklink}
                onImport={onImport}
                onExport={onExport}
                onClear={onClear}
            />
            <MiddlePanel
                entryIdsByDate={entryIdsByDate}
                entries={entries}
                backlinks={backlinks}
                isEditing={isEditing}
                onEdit={onEdit}
                onBacklink={onBacklink}
            />
            <RightPanel
                currentBacklink={currentBacklink}
                currentBacklinkInfo={currentBacklinkInfo}
                backlinks={backlinks}
                entries={entries}
                isEditing={isEditing}
                onEdit={onEdit}
                onBacklink={onBacklink}
            />
        </div>
    );
}
