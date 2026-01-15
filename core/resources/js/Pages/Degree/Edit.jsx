import { useForm } from "@inertiajs/react";
import FormLayout from '@/Components/FormLayout';
import FormActions from '@/Components/FormActions';
import DegreeForm from "./partials/DegreeForm";

const Edit = ({ degree }) => {
    const { data, setData, post, errors, processing } = useForm({
        _method: "PUT",
        name: degree.name || "",
        short_name: degree.short_name || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("degree.update", degree.id));
    };

    const handleDataChange = (field, value) => {
        setData(field, value);
    };

    return (
        <FormLayout
            title="Create Degree"
            subtitle="Add a new degree to the system"
            onSubmit={handleSubmit}
            processing={processing}
        >
            <DegreeForm
                data={data}
                errors={errors}
                processing={processing}
                onDataChange={handleDataChange}
            >
                <FormActions
                    processing={processing}
                    submitText="Update Degree"
                    cancelText="Cancel"
                />
            </DegreeForm>
        </FormLayout>
    );
};

export default Edit;