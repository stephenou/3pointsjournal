// @flow

import React from 'react';

import {
    getNumWords,
    getNumBacklinkOccurrences,
    getNumEntries,
    getNumBacklinks,
    searchBacklinks,
} from './utils';

import type { EntriesType, BacklinkType, BacklinksInfoType } from './types';

type PropsType = {
    backlinksInfo: BacklinksInfoType,
    entries: EntriesType,
    onBacklink: (backlink: BacklinkType) => void,
    onImport: (file: File) => void,
    onExport: () => void,
    onClear: () => void,
};

export default function LeftPanel(props: PropsType) {
    const {
        backlinksInfo,
        entries,
        onBacklink,
        onImport,
        onExport,
        onClear,
    } = props;
    const [query, setQuery] = React.useState('');
    const fileInputRef = React.useRef(null);
    const backlinks = Object.keys(backlinksInfo);
    const onMouseUp = () => {
        const selection = window.getSelection().toString();
        if (selection) {
            setQuery(selection);
        } else {
            setQuery('');
        }
    };
    React.useEffect(() => {
        window.addEventListener('mouseup', onMouseUp);
    }, []);
    return (
        <div className="left">
            <h2>3PointsJournal</h2>
            <div className="info">
                <div className="flex">
                    <div className="flex-grow">words</div>
                    <div className="count">{getNumWords(entries)}</div>
                </div>
                <div className="flex">
                    <div className="flex-grow">backlinks</div>
                    <div className="count">
                        {getNumBacklinkOccurrences(backlinksInfo)}
                    </div>
                </div>
                <div className="flex">
                    <div className="flex-grow">entries</div>
                    <div className="count">{getNumEntries(entries)}</div>
                </div>
                <div className="flex">
                    <div className="flex-grow">tokens</div>
                    <div className="count">{getNumBacklinks(backlinks)}</div>
                </div>
            </div>
            <div className="buttons">
                <button onClick={() => fileInputRef.current?.click()}>
                    Import
                </button>
                <input
                    accept=".txt"
                    style={{ display: 'none' }}
                    type="file"
                    ref={fileInputRef}
                    onChange={e => {
                        onImport(e.target.files[0]);
                    }}
                />
                <button onClick={onExport}>Export</button>
                <button onClick={onClear}>Clear</button>
            </div>
            <h3>Backlinks</h3>
            <div className="search">
                <input
                    type="text"
                    onChange={e => setQuery(e.target.value)}
                    value={query}
                    placeholder="Search..."
                />
            </div>
            <div>
                {searchBacklinks(backlinks, query, Number.POSITIVE_INFINITY)
                    .sort((a, b) => {
                        const d =
                            backlinksInfo[b].length - backlinksInfo[a].length;
                        return d === 0
                            ? a.toLowerCase().localeCompare(b.toLowerCase())
                            : d;
                    })
                    .map(backlink => (
                        <div
                            key={backlink}
                            className="backlink flex"
                            onClick={() => {
                                onBacklink(backlink);
                                setQuery('');
                            }}
                        >
                            <div className="link flex-grow">{backlink}</div>
                            <div className="count">
                                {backlinksInfo[backlink].length}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
