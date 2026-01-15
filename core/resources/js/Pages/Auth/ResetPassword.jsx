import React from "react";
import { useForm } from '@inertiajs/react';
import { AuthWrapper } from "@/Components/AuthWrapper";

function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <h4 className="mb-2">Welcome to la Petite Admin Panel</h4>
            <p className="mb-4">Please sign-in to your account and start the adventure</p>
            <form id="formAuthentication" className="mb-3" onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="form-control"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <div className="form-text text-danger">{errors.email}</div>
                </div>
                <div className="mb-3 form-password-toggle">
                    <label htmlFor="email" className="form-label">Password</label>
                    <div className="input-group input-group-merge">
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="*********"
                            value={data.password}
                            className="form-control"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </div>
                    <div className="form-text text-danger">{errors.password}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Confirm Password</label>
                    <div className="input-group input-group-merge">
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            placeholder="*********"
                            value={data.password_confirmation}
                            className="form-control"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                        />
                    </div>
                    <div className="form-text text-danger">{errors.password_confirmation}</div>
                </div>
                <div className="mb-3">
                    <button disabled={processing} aria-label='Click me' className="btn btn-primary d-grid w-100" type="submit">Sign in</button>
                </div>
            </form>
        </>
    );
};

ResetPassword.layout = (page) => <AuthWrapper>{page}</AuthWrapper>;
export default ResetPassword;
