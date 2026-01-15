// resources/js/Components/Fields/RichTextEditor.jsx
import React, { useEffect, useRef } from 'react';

const RichTextEditor = ({ value, onChange, placeholder, height = '200px' }) => {
    const editorRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Quill) {
            initQuill();
        } else {
            // Load Quill dynamically
            loadQuill();
        }

        return () => {
            if (editorRef.current && editorRef.current.quill) {
                editorRef.current.quill = null;
            }
        };
    }, []);

    const loadQuill = () => {
        // Load Quill CSS
        const link = document.createElement('link');
        link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Load Quill JS
        const script = document.createElement('script');
        script.src = 'https://cdn.quilljs.com/1.3.7/quill.js';
        script.async = true;
        script.onload = () => initQuill();
        document.body.appendChild(script);
    };

    const initQuill = () => {
        if (!editorRef.current || !window.Quill) return;

        // Ensure dark theme for toolbar
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ];

        // Create Quill instance
        const quill = new window.Quill(editorRef.current, {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: placeholder || 'Start typing...'
        });

        // Set initial value
        if (value) {
            quill.clipboard.dangerouslyPasteHTML(value);
        }

        // Update textarea on content change
        quill.on('text-change', () => {
            const html = editorRef.current.querySelector('.ql-editor').innerHTML;
            onChange(html);
        });

        // Store reference
        editorRef.current.quill = quill;
    };

    // Update Quill content when value prop changes
    useEffect(() => {
        if (editorRef.current?.quill && value !== editorRef.current.quill.root.innerHTML) {
            editorRef.current.quill.clipboard.dangerouslyPasteHTML(value || '');
        }
    }, [value]);

    return (
        <div className="rich-text-editor">
            <div 
                ref={editorRef}
                className="bg-white"
                style={{ 
                    height,
                    borderRadius: '0.375rem',
                    border: '1px solid #dee2e6'
                }}
            />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="d-none"
            />
            
            <style jsx>{`
                .rich-text-editor :global(.ql-toolbar) {
                    border-color: #dee2e6 !important;
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    background: #f8f9fa;
                }
                .rich-text-editor :global(.ql-container) {
                    border-color: #dee2e6 !important;
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    font-family: inherit;
                }
                .rich-text-editor :global(.ql-editor) {
                    min-height: ${height};
                    font-size: 16px;
                }
                .rich-text-editor :global(.ql-toolbar .ql-stroke) {
                    stroke: #212529 !important;
                }
                .rich-text-editor :global(.ql-toolbar .ql-fill) {
                    fill: #212529 !important;
                }
                .rich-text-editor :global(.ql-toolbar .ql-picker) {
                    color: #212529 !important;
                }
                .rich-text-editor :global(.ql-toolbar .ql-picker-options) {
                    background-color: #fff !important;
                    color: #212529 !important;
                }
                /* Ensure black text in editor */
                .rich-text-editor :global(.ql-editor) {
                    color: #000 !important;
                }
                .rich-text-editor :global(.ql-editor p) {
                    color: #000 !important;
                }
                .rich-text-editor :global(.ql-editor h1),
                .rich-text-editor :global(.ql-editor h2),
                .rich-text-editor :global(.ql-editor h3),
                .rich-text-editor :global(.ql-editor h4),
                .rich-text-editor :global(.ql-editor h5),
                .rich-text-editor :global(.ql-editor h6) {
                    color: #000 !important;
                }
                /* Fix for dark theme toolbar text */
                .rich-text-editor :global(.ql-snow .ql-picker-label) {
                    color: #212529 !important;
                }
                .rich-text-editor :global(.ql-snow.ql-toolbar button:hover),
                .rich-text-editor :global(.ql-snow .ql-toolbar button:hover),
                .rich-text-editor :global(.ql-snow.ql-toolbar button:focus),
                .rich-text-editor :global(.ql-snow .ql-toolbar button:focus),
                .rich-text-editor :global(.ql-snow.ql-toolbar button.ql-active),
                .rich-text-editor :global(.ql-snow .ql-toolbar button.ql-active),
                .rich-text-editor :global(.ql-snow.ql-toolbar .ql-picker-label:hover),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-label:hover),
                .rich-text-editor :global(.ql-snow.ql-toolbar .ql-picker-label.ql-active),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-label.ql-active),
                .rich-text-editor :global(.ql-snow.ql-toolbar .ql-picker-item:hover),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-item:hover),
                .rich-text-editor :global(.ql-snow.ql-toolbar .ql-picker-item.ql-selected),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-item.ql-selected) {
                    color: #0d6efd !important;
                }
                .rich-text-editor :global(.ql-snow .ql-toolbar button:hover .ql-stroke),
                .rich-text-editor :global(.ql-snow .ql-toolbar button:focus .ql-stroke),
                .rich-text-editor :global(.ql-snow .ql-toolbar button.ql-active .ql-stroke),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke),
                .rich-text-editor :global(.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke) {
                    stroke: #0d6efd !important;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;