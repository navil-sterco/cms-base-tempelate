import { useForm } from '@inertiajs/react';
import FormLayout from '@/Components/FormLayout';
import FormActions from '@/Components/FormActions';
import DegreeForm from './partials/DegreeForm';

const Create = () => {
    const { data, setData, post, errors, processing } = useForm({
        name: "",
        short_name: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault(); 
        post(route("degree.store"), {
            preserveScroll: true,
            onSuccess: () => {
                // Reset form or show success message
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            }
        });
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
                    submitText="Create Degree"
                    cancelText="Cancel"
                    submitButtonProps={{
                        variant: 'primary',
                    }}
                />
            </DegreeForm>
        </FormLayout>
    );
};

export default Create;