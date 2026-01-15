import { AuthWrapper } from '@/Components/AuthWrapper';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState('password');

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <h4 className="mb-2">Welcome to La Petite Admin Panel</h4>
            <p className="mb-4">Please sign-in to your account and start the adventure</p>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form id="formAuthentication" className="mb-3" onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="text"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
			            value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        autoFocus
                    />
                    <div className="form-text text-danger">{errors.email}</div>
                </div>
                <div className="mb-3 form-password-toggle">
                    {canResetPassword && (
                        <div className="d-flex justify-content-between mb-1">
                            <label className="form-label" htmlFor="password">Password</label>
                            <Link aria-label="Go to Forgot Password Page" href={route('password.request')}>
                                <small className='text-primary'>Forgot Password?</small>
                            </Link>
                        </div>
                    )}
                    <div className="input-group input-group-merge">
                        <input
                            type={showPassword}
                            id="password"
                            className="form-control"
                            name="password"
			                value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                            aria-describedby="password" 
                        />
                        <span className="input-group-text cursor-pointer" onClick={() => setShowPassword(showPassword === 'password' ? 'text' : 'password')}>{showPassword === 'password' ? <i className="bx bx-hide"></i> : <i className="bx bx-show"></i>}</span>
                    </div>
                    <div className="form-text text-danger">{errors.password}</div>
                </div>
                <div className="mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember-me"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <label className="form-check-label" htmlFor="remember-me"> Remember Me </label>
                    </div>
                </div>
                <div className="mb-3">
                    <button disabled={processing} aria-label='Click me' className="btn btn-primary d-grid w-100" type="submit">Sign in</button>
                </div>
            </form>

            {/* <p className="text-center">
                <span>New on our platform? </span>
                <Link aria-label="Go to Register Page" href='/register' className="registration-link text-primary">
                    <span>Create an account</span>
                </Link>
            </p> */}

        </>
    );
}

Login.layout = (page) => <AuthWrapper>{page}</AuthWrapper>;

export default Login;