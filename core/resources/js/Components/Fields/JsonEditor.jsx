// resources/js/Components/Fields/JsonEditor.jsx
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

const JsonEditor = ({ 
    value, 
    onChange, 
    placeholder = '',
    height = '200px',
    className = '',
    ...props 
}) => {
    const [isValid, setIsValid] = useState(true);
    const [validationError, setValidationError] = useState('');
    const editorRef = useRef(null);

    const handleEditorChange = (value) => {
        const newValue = value || '';
        
        // Validate JSON in real-time
        if (newValue.trim()) {
            try {
                JSON.parse(newValue);
                setIsValid(true);
                setValidationError('');
            } catch (error) {
                setIsValid(false);
                setValidationError(error.message);
            }
        } else {
            setIsValid(true);
            setValidationError('');
        }
        
        onChange(newValue);
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Add format command
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            formatJson();
        });

        // Configure JSON specific settings
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            allowComments: false,
            schemas: [],
            enableSchemaRequest: false,
        });
    };

    const formatJson = () => {
        if (!editorRef.current) return;

        try {
            const parsedValue = JSON.parse(value);
            const formatted = JSON.stringify(parsedValue, null, 2);
            onChange(formatted);
            setIsValid(true);
            setValidationError('');
        } catch (error) {
            setIsValid(false);
            setValidationError('Cannot format invalid JSON');
        }
    };

    return (
        <div className={`json-editor ${className}`}>
            <div className="code-editor border rounded overflow-hidden position-relative">
                <Editor
                    height={height}
                    language="json"
                    value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-light"
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
                
                {/* Format Button */}
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary position-absolute"
                    style={{ 
                        top: '8px', 
                        right: '8px',
                        zIndex: 10,
                        fontSize: '12px',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={formatJson}
                    title="Format JSON (Ctrl+S)"
                >
                    <i className="bx bx-align-left me-1"></i>
                    Format
                </button>
            </div>
            
            {/* Validation Status */}
            <div className="mt-2 d-flex justify-content-between align-items-center">
                <div>
                    {!isValid && validationError && (
                        <div className="text-danger small">
                            <i className="bx bx-error-alt me-1"></i>
                            {validationError}
                        </div>
                    )}
                    {isValid && value && value.trim() && (
                        <div className="text-success small">
                            <i className="bx bx-check me-1"></i>
                            Valid JSON
                        </div>
                    )}
                </div>
                <small className="text-muted">
                    Use <kbd>Ctrl+S</kbd> to format JSON
                </small>
            </div>
        </div>
    );
};

export default JsonEditor;