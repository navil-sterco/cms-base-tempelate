import React from "react";
import MappingPage from "@/Components/MappingPage";

const Mapping = ({ degree, pages }) => {
    return (
        <MappingPage
            entity={degree}
            entityName={degree.name}
            title="Map Degree"
            icon="bxs-graduation"
            backRoute={route('degree.index')}
            submitRoute="degree.mapping.attach"
            lists={[
                {
                    field: "page_ids",
                    label: "Pages",
                    icon: "📄",
                    items: pages,
                    displayField: "title",
                    relationshipKey: "pages",
                    colClass: "col-lg-4 col-md-6 mb-3"
                }
            ]}
        />
    );
};

export default Mapping;