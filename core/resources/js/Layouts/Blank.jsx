import { Link } from '@inertiajs/react'
import React from 'react'

export const Blank = ({ children }) => {
    return (
        <>
            <Link aria-label='Go to Home Page' to="/">
                {children}
            </Link>
        </>
    )
}
