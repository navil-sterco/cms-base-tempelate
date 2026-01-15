import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function DeleteUserForm() {
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            onSuccess: () => {
                // Get the modal element and close it
                const modalElement = document.getElementById('deleteaccount');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                // Reset the form
                reset();
            },
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    }; 

    return (
        <div className="card">
            <h5 className="card-header">Delete Account</h5>
            <div className="card-body">
                <div className="mb-3 col-12">
                    <div className="alert alert-warning">
                        <h6 className="alert-heading mb-1">Are you sure you want to delete your account?</h6>
                        <p className="mb-0">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                </div>
                <button aria-label='Click me' disabled type="button" data-bs-toggle="modal" data-bs-target="#deleteaccount" className="btn btn-danger deactivate-account">Deactivate Account</button>
                {/* <!-- Modal --> */}
                <div className="modal fade" id="deleteaccount" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <form onSubmit={deleteUser} className="p-6">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="modalCenterTitle">Are you sure you want to delete your account?</h5>
                                    <button aria-label='Click me'
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                    >
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-4">
                                        Once your account is deleted, all of its resources and
                                        data will be permanently deleted. Please enter your
                                        password to confirm you would like to permanently delete
                                        your account.
                                    </div>
                                    <div className="row">
                                        <div className="col mb-3">
                                            <label htmlFor="deleteaccountpassword" className="form-label">Password</label>
                                            <input
                                                id="deleteaccountpassword"
                                                type="password"
                                                name="password"
                                                ref={passwordInput}
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData('password', e.target.value)
                                                }
                                                placeholder="Password"
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-text text-danger">{errors.password}</div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button aria-label='Click me' type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                                        Close
                                    </button>
                                    <button aria-label='Click me' disabled={processing} type="submit" className="btn btn-primary">Delete Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
