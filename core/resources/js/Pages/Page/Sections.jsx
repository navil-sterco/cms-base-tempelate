import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  X,
  Blocks,
  Save,
  Upload,
  Image as ImageIcon,
  Video,
  File,
  Boxes,
  Search,
  Type,
  Calendar,
  Hash,
  Link,
  Mail,
  Palette,
  CheckSquare,
  Radio,
  FileText,
  Code,
  LayoutTemplate,
} from 'lucide-react';

import CodeEditor from '@/Components/Fields/CodeEditor';

const SectionBuilder = () => {
    const { props } = usePage();
    const { activeSections = [], sections: availableSections = [], page, images, flash } = props;
    
    const [sections, setSections] = useState([]);
    const [draggedSection, setDraggedSection] = useState(null);
    const [showComponentPicker, setShowComponentPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [filePreviews, setFilePreviews] = useState({});
    const [isDraggable, setIsDraggable] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(30);

    const modalRef = useRef(null);
    const searchInputRef = useRef(null);

    // Field type icons mapping
    const fieldTypeIcons = {
        text: <Type size={16} />,
        textarea: <FileText size={16} />,
        code: <Code size={16} />,
        number: <Hash size={16} />,
        email: <Mail size={16} />,
        url: <Link size={16} />,
        select: <ChevronDown size={16} />,
        checkbox: <CheckSquare size={16} />,
        radio: <Radio size={16} />,
        file: <Upload size={16} />,
        image: <ImageIcon size={16} />,
        date: <Calendar size={16} />,
        color: <Palette size={16} />,
    };

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Initialize sections from activeSections
    useEffect(() => {
        if (activeSections && activeSections.length > 0) {
            const formatted = activeSections.map((activeSection, index) => {
                let parsedData = {};
                let mappingItems = [];
                
                if (activeSection.pivot?.section_data) {
                    try {
                        const parsed = JSON.parse(activeSection.pivot.section_data);
                        if (parsed) {
                            // Regular fields
                            parsedData = parsed.data || {};
                            
                            // Mapping items (repeatable)
                            if (parsed.mapping_items && Array.isArray(parsed.mapping_items)) {
                                mappingItems = parsed.mapping_items;
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing section data:', e);
                        parsedData = {};
                    }
                }

                // Set up file previews for existing images
                const previews = {};
                Object.entries(parsedData).forEach(([key, value]) => {
                    if (typeof value === 'string' && value) {
                        // Check if it's an image file path
                        if (value.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) || 
                            value.includes('assets/img/') || 
                            value.includes('assets/images/') ||
                            value.startsWith('http')) {
                            previews[`${index}_${key}`] = value;
                        }
                    }
                });

                return {
                    section_id: activeSection.id,
                    pivot_id: activeSection.pivot?.id,
                    order: activeSection.pivot?.order ?? index,
                    data: parsedData,
                    mapping_items: mappingItems, // Repeatable items
                    isCollapsed: true,
                    files: {}
                };
            });
            
            setSections(formatted);
            // Set file previews after sections are set
            setTimeout(() => {
                const allPreviews = {};
                formatted.forEach((section, index) => {
                    Object.entries(section.data).forEach(([key, value]) => {
                        if (typeof value === 'string' && value && 
                            (value.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) || 
                             value.includes('assets/img/') || 
                             value.includes('assets/images/') ||
                             value.startsWith('http'))) {
                            allPreviews[`${index}_${key}`] = value;
                        }
                    });
                });
                setFilePreviews(allPreviews);
            }, 100);
        } else {
            setSections([]);
        }
    }, [activeSections]);

    // Focus search input when component picker opens
    useEffect(() => {
        if (showComponentPicker && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current.focus();
            }, 100);
        }
    }, [showComponentPicker]);

    // Filter and paginate available sections
    const filteredSections = availableSections.filter(section => {
        return searchTerm === '' || 
            section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.identifier.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Paginate filtered sections
    const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSections = filteredSections.slice(startIndex, endIndex);

    const addSection = (sectionId) => {
        const selectedSection = availableSections.find(s => s.id == sectionId);
        if (!selectedSection) {
            toast.error("Section not found");
            return;
        }

        const newSection = {
            section_id: parseInt(sectionId),
            order: sections.length,
            data: {},
            mapping_items: [],
            isCollapsed: false,
            files: {}
        };

        // Initialize data with empty values for all regular fields
        if (selectedSection.fields_config) {
            selectedSection.fields_config.forEach(fieldConfig => {
                newSection.data[fieldConfig.name] = fieldConfig.type === 'checkbox' ? false : '';
            });
        }

        setSections(prev => [...prev, newSection]);
        setShowComponentPicker(false);
        setSearchTerm('');
        setCurrentPage(1);
        toast.success(`${selectedSection.name} section added`);
    };

    const showDeleteModal = (sectionIndex) => {
        setDeleteTarget(sectionIndex);
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
    };

    const confirmDelete = () => {
        if (deleteTarget === null) return;
        
        const section = sections[deleteTarget];
    
        if (section.pivot_id) {
            router.get(route('pages.sections.destroy', section.pivot_id), {
                preserveScroll: true,
                onSuccess: () => {
                    removeSectionFromState(deleteTarget);
                    toast.success("Section deleted successfully");
                },
                onError: () => {
                    toast.error("Error deleting section");
                }
            });
        } else {
            // If it's a new section, just remove from state
            removeSectionFromState(deleteTarget);
            toast.success("Section removed");
        }

        const modal = window.bootstrap.Modal.getInstance(modalRef.current);
        modal.hide();
        setDeleteTarget(null);
    };

    const removeSectionFromState = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        const withUpdatedOrder = newSections.map((section, i) => ({
            ...section,
            order: i
        }));
        setSections(withUpdatedOrder);
        
        // Clean up file previews
        const newFilePreviews = { ...filePreviews };
        Object.keys(filePreviews).forEach(key => {
            if (key.startsWith(`${index}_`)) {
                delete newFilePreviews[key];
            }
        });
        setFilePreviews(newFilePreviews);
    };

    const updateSectionData = (sectionIndex, fieldName, value) => {
        const newSections = [...sections];
        if (!newSections[sectionIndex]) return;
        
        newSections[sectionIndex].data[fieldName] = value;
        setSections(newSections);
    };

    const updateMappingItem = (sectionIndex, itemIndex, fieldName, value) => {
        const newSections = [...sections];
        if (!newSections[sectionIndex] || !newSections[sectionIndex].mapping_items[itemIndex]) return;
        
        newSections[sectionIndex].mapping_items[itemIndex][fieldName] = value;
        setSections(newSections);
    };

    const addMappingItem = (sectionIndex) => {
        const newSections = [...sections];
        if (!newSections[sectionIndex]) return;
        
        const selectedSection = getSelectedSection(newSections[sectionIndex].section_id);
        if (!selectedSection || !selectedSection.mapping_config) return;
        
        const newItem = {};
        selectedSection.mapping_config.forEach(field => {
            newItem[field.name] = field.type === 'checkbox' ? false : '';
        });
        
        if (!newSections[sectionIndex].mapping_items) {
            newSections[sectionIndex].mapping_items = [];
        }
        
        newSections[sectionIndex].mapping_items.push(newItem);
        setSections(newSections);
    };

    const removeMappingItem = (sectionIndex, itemIndex) => {
        const newSections = [...sections];
        if (!newSections[sectionIndex] || !newSections[sectionIndex].mapping_items) return;
        
        newSections[sectionIndex].mapping_items.splice(itemIndex, 1);
        setSections(newSections);
    };

    const handleFileUpload = (sectionIndex, fieldName, file, isMapping = false, mappingItemIndex = null) => {
        const newSections = [...sections];
        if (!newSections[sectionIndex]) return;
        
        // Store file object
        if (isMapping && mappingItemIndex !== null) {
            if (!newSections[sectionIndex].mapping_files) {
                newSections[sectionIndex].mapping_files = {};
            }
            if (!newSections[sectionIndex].mapping_files[mappingItemIndex]) {
                newSections[sectionIndex].mapping_files[mappingItemIndex] = {};
            }
            newSections[sectionIndex].mapping_files[mappingItemIndex][fieldName] = file;
            
            // Update mapping item data
            newSections[sectionIndex].mapping_items[mappingItemIndex][fieldName] = file.name;
        } else {
            newSections[sectionIndex].files[fieldName] = file;
            newSections[sectionIndex].data[fieldName] = file.name;
        }
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            const previewKey = isMapping ? 
                `${sectionIndex}_mapping_${mappingItemIndex}_${fieldName}` : 
                `${sectionIndex}_${fieldName}`;
                
            setFilePreviews(prev => ({
                ...prev,
                [previewKey]: previewUrl
            }));
        }
        
        setSections(newSections);
    };

    const removeFile = (sectionIndex, fieldName, isMapping = false, mappingItemIndex = null) => {
        const newSections = [...sections];
        if (!newSections[sectionIndex]) return;
        
        // Remove file from section
        if (isMapping && mappingItemIndex !== null) {
            if (newSections[sectionIndex].mapping_files && 
                newSections[sectionIndex].mapping_files[mappingItemIndex]) {
                delete newSections[sectionIndex].mapping_files[mappingItemIndex][fieldName];
            }
            if (newSections[sectionIndex].mapping_items[mappingItemIndex]) {
                newSections[sectionIndex].mapping_items[mappingItemIndex][fieldName] = '';
            }
        } else {
            delete newSections[sectionIndex].files[fieldName];
            newSections[sectionIndex].data[fieldName] = '';
        }
        
        // Remove preview and revoke object URL
        const previewKey = isMapping ? 
            `${sectionIndex}_mapping_${mappingItemIndex}_${fieldName}` : 
            `${sectionIndex}_${fieldName}`;
            
        if (filePreviews[previewKey] && filePreviews[previewKey].startsWith('blob:')) {
            URL.revokeObjectURL(filePreviews[previewKey]);
        }
        
        setFilePreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[previewKey];
            return newPreviews;
        });
        
        setSections(newSections);
    };

    const toggleSectionCollapse = (index) => {
        const newSections = [...sections];
        if (!newSections[index]) return;
        
        newSections[index].isCollapsed = !newSections[index].isCollapsed;
        setSections(newSections);
    };

    const handleSectionDragStart = (e, index) => {
        if (!isDraggable) return;
        setDraggedSection(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleSectionDragOver = (e) => {
        if (!isDraggable) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleSectionDrop = (e, dropIndex) => {
        if (!isDraggable) return;
        e.preventDefault();
        if (draggedSection === null) return;

        const newSections = [...sections];
        const [removed] = newSections.splice(draggedSection, 1);
        newSections.splice(dropIndex, 0, removed);
        
        const withUpdatedOrder = newSections.map((section, index) => ({
            ...section,
            order: index
        }));
        
        setSections(withUpdatedOrder);
        setDraggedSection(null);
        toast.success("Section reordered");
    };

    const getSelectedSection = (sectionId) => {
        return availableSections.find(s => s.id == sectionId);
    };

    const getFileIcon = (fileType) => {
        if (fileType?.startsWith('image/')) return <ImageIcon size={16} />;
        if (fileType?.startsWith('video/')) return <Video size={16} />;
        return <File size={16} />;
    };

    // Safe file type check function
    const isFileObject = (obj) => {
        return obj && 
               typeof obj === 'object' && 
               typeof obj.name === 'string' &&
               typeof obj.type === 'string' &&
               typeof obj.size === 'number';
    };

    // Render field input based on type
    const renderFieldInput = (field, value, onChange, placeholder, required, sectionIndex, fieldName, isMapping = false, mappingItemIndex = null) => {
        const hasFile = isMapping ? 
            (sections[sectionIndex]?.mapping_files?.[mappingItemIndex]?.[fieldName] || 
             filePreviews[`${sectionIndex}_mapping_${mappingItemIndex}_${fieldName}`]) :
            (sections[sectionIndex]?.files?.[fieldName] || 
             filePreviews[`${sectionIndex}_${fieldName}`]);
        
        const fileValue = isMapping ? 
            sections[sectionIndex]?.mapping_files?.[mappingItemIndex]?.[fieldName] :
            sections[sectionIndex]?.files?.[fieldName];
        
        switch (field.type) {
            case 'code':
                return (
                    <div className="code-editor-container">
                        <CodeEditor
                            value={value || ''}
                            onChange={onChange}
                            language={field.language || 'html'}
                            height="400px"
                        />
                        {placeholder && !value && (
                            <div className="text-muted small mt-1">{placeholder}</div>
                        )}
                    </div>
                );
            case 'textarea':
                return (
                    <textarea
                        className="form-control"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        rows="4"
                        required={required}
                        placeholder={placeholder}
                        style={{ minHeight: '38px', resize: 'vertical' }}
                    />
                );
            case 'select':
                return (
                    <select
                        className="form-control"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        style={{ height: '38px' }}
                    >
                        <option value="">Select an option</option>
                        {field.options?.map((option, idx) => (
                            <option key={idx} value={option.value || option}>
                                {option.label || option}
                            </option>
                        ))}
                    </select>
                );
            case 'checkbox':
                return (
                    <div className="form-check d-flex align-items-center" style={{ minHeight: '38px' }}>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={value || false}
                            onChange={(e) => onChange(e.target.checked)}
                            required={required}
                        />
                        <label className="form-check-label ms-2">
                            {field.label}
                        </label>
                    </div>
                );
            case 'radio':
                return (
                    <div className="radio-group" style={{ minHeight: '38px' }}>
                        {field.options?.map((option, idx) => (
                            <div key={idx} className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name={`${sectionIndex}_${fieldName}${isMapping ? `_mapping_${mappingItemIndex}` : ''}`}
                                    value={option.value || option}
                                    checked={value === (option.value || option)}
                                    onChange={(e) => onChange(e.target.value)}
                                    required={required}
                                />
                                <label className="form-check-label ms-2">
                                    {option.label || option}
                                </label>
                            </div>
                        ))}
                    </div>
                );
            case 'color':
                return (
                    <div className="d-flex align-items-center gap-2">
                        <input
                            type="color"
                            className="form-control form-control-color p-1"
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            required={required}
                            style={{ height: '38px', width: '60px', minWidth: '60px' }}
                        />
                        <input
                            type="text"
                            className="form-control"
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            required={required}
                            placeholder={placeholder}
                            style={{ height: '38px' }}
                        />
                    </div>
                );
            case 'file':
            case 'image':
                return (
                    <div>
                        {/* File Preview */}
                        {hasFile && (
                            <div className="mb-2 p-2 border rounded bg-light">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                                        {fileValue ? getFileIcon(fileValue.type) : <ImageIcon size={16} />}
                                        <span className="small text-truncate">
                                            {fileValue ? fileValue.name : 'Existing File'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger flex-shrink-0 ms-2"
                                        onClick={() => removeFile(sectionIndex, fieldName, isMapping, mappingItemIndex)}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                {/* Image Preview */}
                                {filePreviews[isMapping ? 
                                    `${sectionIndex}_mapping_${mappingItemIndex}_${fieldName}` : 
                                    `${sectionIndex}_${fieldName}`
                                ] && (
                                    <div className="mt-2 text-center">
                                        <img 
                                            src={filePreviews[isMapping ? 
                                                `${sectionIndex}_mapping_${mappingItemIndex}_${fieldName}` : 
                                                `${sectionIndex}_${fieldName}`
                                            ]} 
                                            alt="Preview" 
                                            className="img-fluid rounded border"
                                            style={{ maxHeight: '100px', maxWidth: '100%' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* File Input */}
                        <div className="input-group">
                            <input
                                type="file"
                                className="form-control"
                                accept={field.accept || (field.type === 'image' ? "image/*" : "*")}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFileUpload(sectionIndex, fieldName, file, isMapping, mappingItemIndex);
                                    }
                                }}
                                id={`file-${sectionIndex}-${fieldName}${isMapping ? `-mapping-${mappingItemIndex}` : ''}`}
                                style={{ height: '38px' }}
                            />
                            <label 
                                className="input-group-text btn btn-outline-secondary border" 
                                htmlFor={`file-${sectionIndex}-${fieldName}${isMapping ? `-mapping-${mappingItemIndex}` : ''}`}
                                style={{ height: '38px' }}
                            >
                                <Upload size={16} />
                            </label>
                        </div>
                        <div className="form-text small mt-1">
                            {field.type === 'image' ? 
                                'Images (Max: 3MB)' : 
                                'All files (Max: 3MB)'}
                        </div>
                    </div>
                );
            default:
                return (
                    <input
                        type={field.type}
                        className="form-control"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        placeholder={placeholder}
                        style={{ height: '38px' }}
                    />
                );
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!page?.id) {
            toast.error("Page not found");
            return;
        }

        setIsSaving(true);

        const formData = new FormData();
        formData.append('page_id', page.id);

        // Prepare sections data
        sections.forEach((section, index) => {
            if (!section.section_id) {
                console.error('Section missing section_id:', section);
                return;
            }

            formData.append(`sections[${index}][section_id]`, section.section_id);
            formData.append(`sections[${index}][order]`, section.order);
            
            // Prepare section data structure
            const sectionData = {
                data: section.data,
                mapping_items: section.mapping_items || []
            };
            
            formData.append(`sections[${index}][section_data]`, JSON.stringify(sectionData));
            
            // Append regular files
            if (section.files) {
                Object.entries(section.files).forEach(([fieldName, file]) => {
                    if (isFileObject(file)) {
                        formData.append(`sections[${index}][files][${fieldName}]`, file);
                    }
                });
            }
            
            // Append mapping files
            if (section.mapping_files) {
                Object.entries(section.mapping_files).forEach(([itemIndex, itemFiles]) => {
                    Object.entries(itemFiles).forEach(([fieldName, file]) => {
                        if (isFileObject(file)) {
                            formData.append(`sections[${index}][mapping_files][${itemIndex}][${fieldName}]`, file);
                        }
                    });
                });
            }
        });
        
        router.post(route('pages.sections.store', { page: page.id }), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                toast.success("Sections saved successfully!");
                // Reload to get updated data
                setTimeout(() => {
                    router.reload({ only: ['activeSections', 'flash'] });
                }, 1000);
            },
            onError: (errors) => {
                setIsSaving(false);
                console.error('Save errors:', errors);
                toast.error("Error saving sections: " + (errors.message || 'Unknown error'));
            }
        });
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            Object.values(filePreviews).forEach(previewUrl => {
                if (previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                }
            });
        };
    }, [filePreviews]);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {/* Delete Confirmation Modal */}
            <div className="modal fade" ref={modalRef} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Deletion</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-0">
                                Are you sure you want to delete this section? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                                Delete Section
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-builder">
                {/* Page Builder Header */}
                <div className="mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-1">
                        <div>
                            <h1 className="text-muted mb-1">Section Builder</h1>
                            <p className="text-muted mb-0">Page: {page?.title}</p>
                        </div>
                        <div className="d-flex align-items-center gap-2 bg-white border rounded p-2">
                            <div className="form-check form-switch m-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="draggableToggle"
                                    checked={isDraggable}
                                    onChange={() => setIsDraggable(!isDraggable)}
                                />
                                <label className="form-check-label ms-2" htmlFor="draggableToggle">
                                    Drag & Drop
                                </label>
                            </div>
                            <span className={`badge ${isDraggable ? "bg-primary" : "bg-secondary"}`}>
                                {isDraggable ? "ON" : "OFF"}
                            </span>
                        </div>
                    </div>
                    <div className="pt-3">
                        <div className="d-flex align-items-center gap-2 text-muted">
                            <GripVertical size={16} />
                            <span className="small">
                                Dynamic Zone • {sections.length} {sections.length === 1 ? "section" : "sections"}
                            </span>
                        </div>
                    </div>
                </div>

                <form id="section-builder-form" onSubmit={handleSubmit}>
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-0">
                            <div className="d-flex flex-column gap-3 p-3 p-md-4">
                                {sections.map((section, sIndex) => {
                                    const selectedSection = getSelectedSection(section.section_id);
                                    const fields = selectedSection?.fields_config || [];
                                    const hasMapping = selectedSection?.mapping_enabled && selectedSection?.mapping_config;
                                    
                                    return (
                                        <div
                                            key={sIndex}
                                            className={`section-card border rounded ${draggedSection === sIndex ? 'dragging' : ''}`}
                                            draggable={isDraggable}
                                            onDragStart={(e) => handleSectionDragStart(e, sIndex)}
                                            onDragOver={handleSectionDragOver}
                                            onDrop={(e) => handleSectionDrop(e, sIndex)}
                                        >
                                            <div className="section-header px-3 py-3 bg-light rounded-top">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                                                        {isDraggable && (
                                                            <GripVertical size={16} className="drag-handle text-muted cursor-grab" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-link p-0 text-decoration-none"
                                                            onClick={() => toggleSectionCollapse(sIndex)}
                                                        >
                                                            {section.isCollapsed ? (
                                                                <ChevronDown size={16} />
                                                            ) : (
                                                                <ChevronUp size={16} />
                                                            )}
                                                        </button>
                                                        <div className="d-flex align-items-center gap-2 ms-2 flex-grow-1 min-w-0">
                                                            <Boxes size={16} className="flex-shrink-0" />
                                                            <span className="fw-medium text-truncate">
                                                                {selectedSection?.name || 'Unknown Section'}
                                                            </span>
                                                            <span className="badge bg-secondary flex-shrink-0">#{sIndex + 1}</span>
                                                            {hasMapping && (
                                                                <span className="badge bg-warning text-dark flex-shrink-0">Repeatable</span>
                                                            )}
                                                            {section.pivot_id && (
                                                                <span className="badge bg-primary flex-shrink-0">Saved</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger ms-2 flex-shrink-0"
                                                        onClick={() => showDeleteModal(sIndex)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {!section.isCollapsed && selectedSection && (
                                                <div className="p-3">
                                                    <div className="row g-3">
                                                        {fields.length > 0 ? (
                                                            fields.map((field, fIndex) => {
                                                                const fieldName = field.name;
                                                                const currentValue = section.data[fieldName] || '';
                                                                
                                                                return (
                                                                    <div key={fIndex} className={`col-12  ${field.type === 'code' ? "col-md-12" : "col-md-6"}`}>
                                                                        <label className="form-label fw-medium mb-2 d-flex align-items-center gap-2">
                                                                            {fieldTypeIcons[field.type] || <Type size={14} />}
                                                                            {field.label}
                                                                            {field.required && <span className="text-danger">*</span>}
                                                                        </label>
                                                                        
                                                                        <div className="field-input-container">
                                                                            {renderFieldInput(
                                                                                field,
                                                                                currentValue,
                                                                                (value) => updateSectionData(sIndex, fieldName, value),
                                                                                field.placeholder || `Enter In ${field.label.toLowerCase()}`,
                                                                                field.required,
                                                                                sIndex,
                                                                                fieldName
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="col-12">
                                                                <div className="alert alert-light border text-center py-4">
                                                                    <Boxes size={24} className="text-muted mb-2" />
                                                                    <p className="mb-0 text-muted">
                                                                        This is a static section with no configurable fields.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Repeatable Items Section */}
                                                        {hasMapping && selectedSection.mapping_config && (
                                                            <div className="col-12 mt-3 pt-3 border-top">
                                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                                    <div>
                                                                        <h6 className="mb-1 d-flex align-items-center gap-2">
                                                                            <Boxes size={16} />
                                                                            Repeatable Items
                                                                            <span className="badge bg-dark">
                                                                                {section.mapping_items?.length || 0}
                                                                            </span>
                                                                        </h6>
                                                                        <p className="small text-muted mb-0">
                                                                            Use {'{item.field_name}'} in template
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => addMappingItem(sIndex)}
                                                                    >
                                                                        <Plus size={14} className="me-1" />
                                                                        Add Item
                                                                    </button>
                                                                </div>
                                                                
                                                                {(!section.mapping_items || section.mapping_items.length === 0) ? (
                                                                    <div className="alert alert-light border text-center py-3">
                                                                        <p className="mb-0 text-muted">
                                                                            No repeatable items added yet. Click "Add Item" to create one.
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="mapping-items">
                                                                        {section.mapping_items.map((item, itemIndex) => {
                                                                            const mappingFields = selectedSection.mapping_config;
                                                                            return (
                                                                                <div key={itemIndex} className="card border mb-3">
                                                                                    <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            <span className="fw-medium">Item {itemIndex + 1}</span>
                                                                                            <span className="badge bg-secondary">#{itemIndex + 1}</span>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-sm btn-outline-danger"
                                                                                            onClick={() => removeMappingItem(sIndex, itemIndex)}
                                                                                        >
                                                                                            <Trash2 size={12} />
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="card-body">
                                                                                        <div className="row g-3">
                                                                                            {mappingFields.map((field, fieldIndex) => {
                                                                                                const fieldName = field.name;
                                                                                                const currentValue = item[fieldName] || '';
                                                                                                
                                                                                                return (
                                                                                                    <div key={fieldIndex} className="col-12 col-md-6">
                                                                                                        <label className="form-label fw-medium mb-2 d-flex align-items-center gap-2">
                                                                                                            {fieldTypeIcons[field.type] || <Type size={14} />}
                                                                                                            {field.label}
                                                                                                            {field.required && <span className="text-danger">*</span>}
                                                                                                        </label>
                                                                                                        
                                                                                                        <div className="field-input-container">
                                                                                                            {renderFieldInput(
                                                                                                                field,
                                                                                                                currentValue,
                                                                                                                (value) => updateMappingItem(sIndex, itemIndex, fieldName, value),
                                                                                                                field.placeholder || `Enter ${field.label.toLowerCase()}`,
                                                                                                                field.required,
                                                                                                                sIndex,
                                                                                                                fieldName,
                                                                                                                true,
                                                                                                                itemIndex
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {!section.isCollapsed && !selectedSection && (
                                                <div className="p-3">
                                                    <div className="alert alert-warning border m-0">
                                                        Section template not found. Please select a valid section.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Component Picker */}
                                {(showComponentPicker || sections.length === 0) && (
                                    <div className="component-picker border rounded">
                                        <div className="component-picker-header px-3 py-3 bg-light rounded-top">
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Blocks size={18} className="text-dark" />
                                                    <span className="fw-medium text-dark mt-1">
                                                        Section Library
                                                    </span>
                                                    <span className="badge bg-secondary">
                                                        {availableSections.length} total
                                                    </span>
                                                </div>
                                                {sections.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link text-muted p-0"
                                                        onClick={() => setShowComponentPicker(false)}
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Search Control */}
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0">
                                                    <Search size={16} />
                                                </span>
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    className="form-control border-start-0"
                                                    placeholder="Search sections by name or identifier..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                                {searchTerm && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary border-start-0"
                                                        onClick={clearSearch}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-end text-muted small mt-2">
                                                Showing {filteredSections.length} of {availableSections.length} sections
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            {filteredSections.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <Blocks size={40} className="text-muted mb-3" />
                                                    <h6>No sections found</h6>
                                                    <p className="text-muted mb-3">
                                                        {searchTerm ? 
                                                            `No sections match "${searchTerm}"` : 
                                                            'No sections available'}
                                                    </p>
                                                    {searchTerm && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={clearSearch}
                                                        >
                                                            Clear Search
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-center text-muted mb-3 small">
                                                        {sections.length === 0 ? 
                                                            "Start by picking your first section" : 
                                                            "Pick a section to add"}
                                                    </p>
                                                    <div className="row g-2">
                                                        {paginatedSections.map((section) => (
                                                            <div key={section.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                                                <button
                                                                    type="button"
                                                                    className="component-btn btn btn-outline-light border w-100 p-2 d-flex flex-column align-items-center"
                                                                    onClick={() => addSection(section.id)}
                                                                    title={`${section.name} (${section.identifier})`}
                                                                >
                                                                    <div className="mb-1 text-secondary">
                                                                        <LayoutTemplate size={25} />
                                                                    </div>
                                                                    <div className="small fw-medium text-center mb-1 text-dark w-100">
                                                                        {section.name}
                                                                    </div>
                                                                    <div className="text-muted text-center d-none d-sm-block" style={{ fontSize: '0.7rem' }}>
                                                                        {section.identifier}
                                                                    </div>
                                                                        <div className="mt-1">
                                                                        {section.mapping_enabled ? (
                                                                            <span className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>
                                                                                Repeatable
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-secondary text-white" style={{ fontSize: '0.6rem' }}>
                                                                                Regular
                                                                            </span>
                                                                        )}
                                                                        </div>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Pagination */}
                                                    {totalPages > 1 && (
                                                        <div className="mt-3">
                                                            <nav aria-label="Section pagination">
                                                                <ul className="pagination pagination-sm justify-content-center mb-2">
                                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                                            disabled={currentPage === 1}
                                                                        >
                                                                            Previous
                                                                        </button>
                                                                    </li>
                                                                    
                                                                    {/* Page numbers */}
                                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                        let pageNum;
                                                                        if (totalPages <= 5) {
                                                                            pageNum = i + 1;
                                                                        } else if (currentPage <= 3) {
                                                                            pageNum = i + 1;
                                                                        } else if (currentPage >= totalPages - 2) {
                                                                            pageNum = totalPages - 4 + i;
                                                                        } else {
                                                                            pageNum = currentPage - 2 + i;
                                                                        }
                                                                        
                                                                        return (
                                                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                                                <button
                                                                                    className="page-link"
                                                                                    onClick={() => handlePageChange(pageNum)}
                                                                                >
                                                                                    {pageNum}
                                                                                </button>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                    
                                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                                            disabled={currentPage === totalPages}
                                                                        >
                                                                            Next
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </nav>
                                                            <div className="text-center text-muted small">
                                                                Page {currentPage} of {totalPages} • 
                                                                Showing {startIndex + 1}-{Math.min(endIndex, filteredSections.length)} of {filteredSections.length} sections
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {sections.length > 0 && !showComponentPicker && (
                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark"
                                            onClick={() => setShowComponentPicker(true)}
                                        >
                                            <Plus size={16} className="me-2" />
                                            Add More Sections
                                        </button>
                                    </div>
                                )}
                                
                                {sections.length > 0 && (
                                    <div className="border-top pt-3 mt-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} className="me-2" />
                                                    Save All Sections
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <style jsx>{`
                .section-card {
                    background: #fff;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .section-card:hover {
                    border-color: #adb5bd;
                }
                .section-card.dragging {
                    opacity: 0.5;
                    border: 2px dashed #0d6efd !important;
                }
                .drag-handle {
                    cursor: grab;
                }
                .drag-handle:active {
                    cursor: grabbing;
                }
                .component-btn {
                    transition: all 0.2s ease;
                    min-height: 90px;
                }
                .component-btn:hover {
                    background-color: #f8f9fa;
                    border-color: #0d6efd;
                    transform: translateY(-2px);
                }
                .field-input-container {
                    min-height: 40px;
                    display: flex;
                    flex-direction: column;
                }
                .mapping-items .card {
                    border-left: 3px solid #ffc107;
                }
                .code-editor-container {
                    border-radius: 4px;
                    overflow: hidden;
                }
                .cursor-grab {
                    cursor: grab;
                }
                .cursor-grab:active {
                    cursor: grabbing;
                }
                .min-w-0 {
                    min-width: 0;
                }
                .text-truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
        </>
    );
};

export default SectionBuilder;