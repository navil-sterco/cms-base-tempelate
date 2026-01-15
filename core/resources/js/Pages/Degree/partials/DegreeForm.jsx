import React from 'react';
import TextInput from '@/Components/Form/TextInput';
import { Type } from 'lucide-react';

const DegreeForm = ({ data, errors, processing, onDataChange, children }) => {
    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    <TextInput
                        name="name"
                        label="Degree Name"
                        value={data.name}
                        onChange={(value) => onDataChange("name", value)}
                        error={errors.name}
                        placeholder="Bachelor of Technology"
                        required={true}
                        disabled={processing}
                        icon={<Type size={16} />}
                    />
                </div>
                
                <div className="col-md-6">
                    <TextInput
                        name="short_name"
                        label="Short Name"
                        value={data.short_name}
                        onChange={(value) => onDataChange("short_name", value)}
                        error={errors.short_name}
                        placeholder="B.Tech"
                        required={false}
                        disabled={processing}
                        icon={<Type size={16} />}
                    />
                </div>
            </div>
            {children}
        </>
    );
};

export default DegreeForm;