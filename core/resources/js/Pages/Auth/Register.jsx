import { AuthWrapper } from '@/Components/AuthWrapper';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState('password');
    const [showConfirmPassword, setShowConfirmPassword] = useState('password');

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <h4 className="mb-2">Register Now</h4>
            <p className="mb-4">Make your app management easy and fun!</p>

            <form id="formAuthentication" className="mb-3" onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your username"
                        autoFocus
                        id="name"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        onChange={(e) => setData('name', e.target.value)}
                        required 
                    />
                    <div className="form-text text-danger">{errors.name}</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        className="form-control"
                        id="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        type="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <div className="form-text text-danger">{errors.email}</div>
                </div>

                <div className="mb-3 form-password-toggle">
                    <label className="form-label" htmlFor="password">Password</label>
                    <div className="input-group input-group-merge">
                        <input
                            id="password"
                            type={showPassword}
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            className="form-control"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password" 
                        />
                        <div className="form-text text-danger">{errors.password}</div>
                        <span className="input-group-text cursor-pointer" onClick={() => setShowPassword(showPassword === 'password' ? 'text' : 'password')}>{showPassword === 'password' ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}</span>
                    </div>
                </div>

                <div className="mb-3 form-password-toggle">
                    <label className="form-label" htmlFor="password_confirmation">Confirm Password</label>
                    <div className="input-group input-group-merge">
                        <input
                            id="password_confirmation"
                            type={showConfirmPassword}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            className="form-control"
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password" 
                        />
                        <div className="form-text text-danger">{errors.password_confirmation}</div>
                        <span className="input-group-text cursor-pointer" onClick={() => setShowConfirmPassword(showConfirmPassword === 'password' ? 'text' : 'password')}>{showConfirmPassword === 'password' ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}</span>
                    </div>
                </div>
                <button type='submit' aria-label='Click me' className="btn btn-primary d-grid w-100">Sign up</button>
            </form>

            <p className="text-center">
                <span>Already have an account?</span>
                <Link aria-label="Go to Login Page" href="/login" className="d-flex align-items-center justify-content-center text-primary">
                    <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                    Back to login
                </Link>
            </p>
        </>
    );
}

Register.layout = (page) => <AuthWrapper>{page}</AuthWrapper>;

export default Register;
