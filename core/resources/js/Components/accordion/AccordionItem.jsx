import { router } from '@inertiajs/react';
import React from 'react';


const deleteFaq = (e, id) => {
  e.preventDefault(); 
  router.post(route("app-setting.faqs-delete", id));
}

const AccordionItem = ({ id, title, content, isActive, onToggle }) => (
  <div className={`card accordion-item ${isActive ? 'active' : ''}`}>
    <h2 className="accordion-header" id={`heading${id}`}>
      <div className="d-flex justify-content-between align-items-center px-3 py-2">
        <h5 className="fw-small">{title}</h5>
        <div className="d-flex align-items-center gap-2">
          <button 
            aria-label="Delete"
            type="button" 
            className="btn btn-danger btn-sm"
            onClick={(e) => deleteFaq(e, id)}
          >
            <i className="bx bx-trash"></i>
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            data-bs-toggle="collapse"
            data-bs-target={`#accordion${id}`}
            aria-expanded={isActive ? 'true' : 'false'}
            aria-controls={`accordion${id}`}
            onClick={() => onToggle(id)}
          >
            <i className={`bx ${isActive ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
          </button>
        </div>
      </div>
    </h2>

    <div
      id={`accordion${id}`}
      className={`accordion-collapse collapse ${isActive ? 'show' : ''}`}
    >
      <div className="accordion-body">{content}</div>
    </div>
  </div>
);


export default AccordionItem;
