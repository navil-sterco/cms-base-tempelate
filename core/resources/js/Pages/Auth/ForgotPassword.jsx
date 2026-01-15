import { AuthWrapper } from '@/Components/AuthWrapper';
import { Link, useForm } from '@inertiajs/react';

function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <h4 className="mb-2">Forgot Password? 🔒</h4>
            <p className="mb-4">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </p>
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
            <form id="formAuthentication" className="mb-3" onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <div className="form-text text-danger">{errors.email}</div>
                </div>
                <button disabled={processing} type='submit' aria-label='Click me' className="btn btn-primary d-grid w-100">Send Reset Link</button>
            </form>
            <div className="text-center">
                <Link aria-label="Go to Login Page" href="/login" className="d-flex align-items-center justify-content-center">
                    <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                    Back to login
                </Link>
            </div>
        </>
    );
}

ForgotPassword.layout = (page) => <AuthWrapper>{page}</AuthWrapper>;

export default ForgotPassword;
