// @flow

import React from 'react';

import Autosuggest from './autosuggest';
import { AUTOCOMPLETE_REGEX, BACKLINK_REGEX } from './regex';

import type { EntryType, BacklinkType, BacklinksType } from './types';

type PropsType = {
    entry: EntryType,
    backlinks: BacklinksType,
    currentBacklink: ?BacklinkType,
    onBacklink: (backlink: BacklinkType) => void,
    onChange?: ?(entry: EntryType) => void,
};

const EMPTY_AUTOSUGGEST = {
    prefix: '',
    rect: new DOMRect(0, 0, 0, 0),
};

function wrapInBrackets(text: string): string {
    return '[[' + text + ']]';
}

export default function Entry(props: PropsType) {
    const { entry, backlinks, currentBacklink, onChange, onBacklink } = props;
    const textRef = React.useRef(null);
    const [autosuggest, setAutosuggest] = React.useState(EMPTY_AUTOSUGGEST);
    if (onChange) {
        const onKeyUp = e => {
            const selection = window.getSelection();
            const startCaretIndex = selection.getRangeAt(0).startOffset;
            const textBeforeCaret = selection.anchorNode?.data?.substring(
                0,
                startCaretIndex,
            );
            if (textBeforeCaret && textBeforeCaret.length >= 2) {
                const match = AUTOCOMPLETE_REGEX.exec(textBeforeCaret);
                if (match) {
                    setAutosuggest({
                        prefix: match[1],
                        rect: selection.getRangeAt(0).getBoundingClientRect(),
                    });
                    return;
                }
            }
            setAutosuggest(EMPTY_AUTOSUGGEST);
        };
        const onKeyDown = e => {
            if (
                e.key !== '[' &&
                ((e.key !== 'b' && e.key !== 'i') || !e.metaKey)
            )
                return;
            const selection = window.getSelection();
            const startCaretIndex = selection.getRangeAt(0).startOffset;
            const endCaretIndex = selection.getRangeAt(0).endOffset;
            e.preventDefault();
            document.execCommand(
                'insertHTML',
                false,
                wrapInBrackets(selection),
            );
            const range = document.createRange();
            const node = textRef.current?.childNodes[0];
            if (!node) return;
            if (selection.isCollapsed) {
                range.setStart(node, startCaretIndex + 2);
                range.setEnd(node, endCaretIndex + 2);
            } else {
                range.setStart(node, startCaretIndex + 2);
                range.setEnd(node, endCaretIndex + 4);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        };
        const onAdd = backlink => {
            const suffix = backlink.substring(autosuggest.prefix.length);
            document.execCommand('insertHTML', false, suffix);
            setAutosuggest(EMPTY_AUTOSUGGEST);
        };
        const autosuggestPanel = autosuggest.prefix ? (
            <Autosuggest
                backlinks={backlinks}
                prefix={autosuggest.prefix}
                rect={autosuggest.rect}
                onAdd={onAdd}
            />
        ) : null;
        return (
            <>
                <div
                    className="entry"
                    suppressContentEditableWarning
                    contentEditable
                    onBlur={() => {
                        setAutosuggest(EMPTY_AUTOSUGGEST);
                        onChange(textRef.current?.innerText ?? '');
                    }}
                    onKeyDown={onKeyDown}
                    onKeyUp={onKeyUp}
                    ref={textRef}
                >
                    {entry}
                </div>
                <div>{autosuggestPanel}</div>
            </>
        );
    }
    const elements = [];
    let lastIndex = 0;
    let match;
    while ((match = BACKLINK_REGEX.exec(entry))) {
        if (match.index > lastIndex) {
            elements.push(entry.substring(lastIndex, match.index));
        }
        const backlink = match[1];
        let content;
        if (
            currentBacklink &&
            backlink.toLowerCase() === currentBacklink.toLowerCase()
        ) {
            content = <strong>{match[0]}</strong>;
        } else {
            content = match[0];
        }
        elements.push(
            <span
                className="link"
                key={match.index}
                onMouseDown={() => onBacklink(backlink)}
            >
                {content}
            </span>,
        );
        lastIndex = match.index + match[0].length;
    }
    if (entry.length > lastIndex) {
        elements.push(entry.substring(lastIndex));
    }
    return <div className="entry">{elements}</div>;
}
