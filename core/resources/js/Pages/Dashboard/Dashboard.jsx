import { usePage } from '@inertiajs/react';
import React, { useEffect } from 'react'

const Dashboard = () => {
     const { appUrl } = usePage().props;
    useEffect(() => {
        dashboardAnalitics();
    }, [])
    
    return (
        <>
            <div className="row">
                <div className="col-lg-8 mb-4 order-0">
                    <div className="card">
                        <div className="d-flex align-items-end row">
                            <div className="col-sm-7">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">
                                        Welcome to La Petite CMS 🎉
                                    </h5>
                                    <p className="mb-4">
                                        Manage your university's digital presence efficiently with this comprehensive content management system.
                                    </p>

                                    <a aria-label="view badges"
                                        href="#"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        View Website
                                    </a>
                                </div>
                            </div>
                            <div className="col-sm-5 text-center text-sm-left">
                                <div className="card-body pb-0 px-0 px-md-4">
                                    <img aria-label='dashboard icon image'
                                        src={`${appUrl}assets/img/illustrations/man-with-laptop-light.png`}
                                        height="140"
                                        alt="View Badge User"
                                        data-app-dark-img="illustrations/man-with-laptop-dark.png"
                                        data-app-light-img="illustrations/man-with-laptop-light.png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard