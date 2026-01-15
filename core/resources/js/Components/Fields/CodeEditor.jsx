// resources/js/Components/Fields/CodeEditor.jsx
import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ 
    value, 
    onChange, 
    language = 'html', 
    placeholder = '',
    height = '300px',
    className = '',
    ...props 
}) => {
    const handleEditorChange = (value) => {
        onChange(value || '');
    };

    return (
        <div className={`code-editor border rounded overflow-hidden ${className}`}>
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        useShadows: false
                    },
                    automaticLayout: true,
                    formatOnType: true,
                    formatOnPaste: true,
                    suggestOnTriggerCharacters: true,
                    wordBasedSuggestions: true,
                    parameterHints: { enabled: true },
                    renderLineHighlight: 'all',
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    renderValidationDecorations: 'on',
                    matchBrackets: 'always',
                    tabSize: 2,
                    insertSpaces: true,
                    detectIndentation: true,
                    trimAutoWhitespace: true,
                    // Placeholder support
                    overviewRulerBorder: false,
                }}
                loading={
                    <div className="d-flex justify-content-center align-items-center" style={{ height }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading editor...</span>
                        </div>
                    </div>
                }
                {...props}
            />
        </div>
    );
};

export default CodeEditor;