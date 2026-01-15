import React, { useState } from 'react'
import { Transition } from '@headlessui/react';
import {useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';

const UpdateProfile = () => {

    // Update Profile Information----------------------------------------------

    const user = usePage().props.auth.user;
    
    const { data, setData, patch, errors,put,reset, processing, recentlySuccessful,delete: destroy } =
        useForm({
            name: user.name,
            email: user.email,
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    // Password Update----------------------------------------------

    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

  return (
    <>
        <h4 className="py-3 mb-4"><span className="text-muted fw-light">Setting/</span> Profile-Information</h4>

        {/* Profile Information */}
        <div className="col-xl mb-4">
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Profile Information</h5>
                    <small className="text-muted float-end">Update your account's profile information and email address.</small>
                </div>
                
                <div className="card-body">
                    <form onSubmit={submit}>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="full_name">Full Name <span className="text-danger">*</span></label>
                            <div className="input-group input-group-merge">
                                <span id="basic-icon-default-fullname2" className="input-group-text">
                                    <i className="bx bx-user"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="full_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    aria-label="John Doe"
                                    aria-describedby="basic-icon-default-fullname2" />
                            </div>
                            <div className="form-text text-danger">{errors.name}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email">Email <span className="text-danger">*</span></label>
                            <div className="input-group input-group-merge">
                                <span className="input-group-text"><i className="bx bx-envelope"></i></span>
                                <input
                                    id="email"
                                    type="text"
                                    className="form-control"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            <div className="form-text text-danger">{errors.email}</div>
                        </div>
                        <div className="d-flex align-items-center">
                            <button disabled={processing} aria-label='Click me' type="submit" className="btn btn-primary mr-2">Save</button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-gray-600">
                                    Saved.
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* Password Update */}
        <div className="col-xl">
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Update Password</h5>
                    <small className="text-muted float-end">Ensure your account is using a long, random password to stay
                    secure.</small>
                </div>
                <div className="card-body">
                    <form onSubmit={updatePassword}>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="current_password">Current Password <span className="text-danger">*</span></label>
                            <div className="input-group input-group-merge">
                                <span id="basic-icon-default-fullname2" className="input-group-text">
                                    <i className="bx bx-dots-horizontal"></i>
                                </span>
                                <input
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData('current_password', e.target.value)
                                    }
                                    type="password"
                                    autoComplete="current-password"
                                    className="form-control"
                                    id="current_password"
                                />
                            </div>
                            <div className="form-text text-danger">{errors.current_password}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password">New Password <span className="text-danger">*</span></label>
                            <div className="input-group input-group-merge">
                                <span className="input-group-text"><i className="bx bx-dots-horizontal"></i></span>
                                <input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    autoComplete="new-password"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-text text-danger">{errors.password}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password_confirmation">Confirm Password <span className="text-danger">*</span></label>
                            <div className="input-group input-group-merge">
                                <span className="input-group-text"><i className="bx bx-dots-horizontal"></i></span>
                                <input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    type="password"
                                    autoComplete="new-password"
                                    className="form-control"
                                />
                            </div>
                            <div className="form-text text-danger">{errors.password_confirmation}</div>
                        </div>
                        <div className="d-flex align-items-center">
                            <button disabled={processing} aria-label='Click me' type="submit" className="btn btn-primary mr-2">Save</button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-gray-600">
                                    Saved.
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>
  )
}

export default UpdateProfile
