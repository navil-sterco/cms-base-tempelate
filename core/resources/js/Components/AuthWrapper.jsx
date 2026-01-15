import React from 'react'
import '../../../../page-auth.css'
import { Link, usePage } from '@inertiajs/react'
export const AuthWrapper = ({ children }) => {
    const {appLogo} = usePage().props;
    return (
        <div className="container-xxl">
            <div className="authentication-wrapper authentication-basic container-p-y">
                <div className="authentication-inner">
                    <div className="card">
                        <div className="card-body">
                            <div className="app-brand justify-content-center">
                                <Link aria-label='Go to Home Page' to="/" className="app-brand-link gap-2">
                                    <span
                                        className="app-brand-logo demo"
                                        style={{
                                            backgroundColor: '#cccccc', // light grey
                                            padding: '8px',
                                            borderRadius: '6px'
                                        }}
                                        >
                                        <img
                                            src={appLogo}
                                            alt="sneat-logo"
                                            style={{ width: 'auto', height: '60px', borderRadius: '8px' }}
                                        />
                                    </span>
                                    {/* <span 
                                        className="app-brand-text demo menu-text fw-bold ms-2"  
                                        style={{ fontSize: "45px", fontFamily: "'Nasalization', sans-serif", color: "#384551" }}
                                        >
                                        NAVIL
                                    </span> */}
                                </Link>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
