// @flow

import React from 'react';

import { searchBacklinks } from './utils';

type PropsType = {
    backlinks: Array<string>,
    prefix: string,
    rect: DOMRect,
    onAdd: (token: string) => void,
};

export default function Autosuggest(props: PropsType) {
    const { backlinks, prefix, rect, onAdd } = props;
    const results = searchBacklinks(backlinks, prefix, 10);
    if (results.length) {
        return (
            <div
                className="autosuggest"
                style={{
                    top: rect.top + rect.height,
                    left: rect.left,
                }}
            >
                {results.map(result => (
                    <div
                        tabIndex={0}
                        key={result}
                        onMouseDown={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAdd(result);
                        }}
                    >
                        {result}
                    </div>
                ))}
            </div>
        );
    }
    return null;
}
