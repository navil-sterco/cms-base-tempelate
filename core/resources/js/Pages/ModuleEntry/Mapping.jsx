import React from "react";
import MappingPage from "@/Components/MappingPage";

const Mapping = ({ module, entry, entryLabel, lists }) => {
    return (
        <MappingPage
            entity={entry}
            entityName={entryLabel}
            title={`Map ${module?.name} Entry`}
            icon="bx-right-arrow-circle"
            backRoute={route('modules.entries.index', module?.id)}
            submitRoute="modules.entries.mapping.attach"
            submitRouteParams={{ module: module?.id, entry: entry?.id }}
            lists={lists}
        />
    );
};

export default Mapping;
