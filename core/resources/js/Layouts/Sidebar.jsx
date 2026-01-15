import React from 'react';
import menuData from '../data/menuData.json'
import { Link, usePage } from '@inertiajs/react';
import NavLink from '@/Components/NavLink';

const Sidebar = () => {
    const { appLogo } = usePage().props;

    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo" style={{zIndex:10}}>
                <Link aria-label='Navigate to sneat homepage' href={route('dashboard')} className="app-brand-link">
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
                            style={{ width: '190px', height: 'auto' }}
                        />
                    </span>
                </Link>

                <a href="#" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
                    <i className="bx bx-chevron-left bx-sm align-middle"></i>
                </a>
            </div>

            <div className="menu-inner-shadow mb-1"></div>

            <ul className="menu-inner py-1 pb-4">
                {menuData.map((section, index) => (
                    <React.Fragment key={index}>
                        {section.header && (
                            <li className="menu-header small text-uppercase">
                                <span className="menu-header-text">{section.header}</span>
                            </li>
                        )}
                        {section.items.map((item, index) => (
                            <MenuItem key={index} {...item} />
                        ))}
                    </React.Fragment>
                    
                    
                ))}
            </ul>
        </aside>
    );
};

const MenuItem = (item) => {
    const { url: currentUrl } = usePage(); 
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    const isActive = item.link && currentUrl.includes(route(item.link, {}, false));
    
    const isSubmenuActive = hasSubmenu && item.submenu.some(subitem =>
        currentUrl.includes(route(subitem.link, {}, false))
    );

    return (
        <li className={`menu-item ${isActive || isSubmenuActive ? 'active' : ''} ${hasSubmenu && isSubmenuActive ? 'open' : ''}`}>
            {item.link == 'scribe' ? (
                <a
                    href={route(item.link)}
                    target="_blank"
                    className={`menu-link ${item.submenu ? 'menu-toggle' : ''}`}
                >
                    <i className={`menu-icon tf-icons ${item.icon}`}></i>
                    <div>{item.text}</div>
                </a>
            ) : (
                <NavLink
                    aria-label={`Navigate to ${item.text} ${!item.available ? 'Pro' : ''}`}
                    href={item.link ? route(item.link) : ''}
                    className={`menu-link ${item.submenu ? 'menu-toggle' : ''}`}
                    target={item.link.includes('http') ? '_blank' : undefined}
                >
                    <i className={`menu-icon tf-icons ${item.icon}`}></i>
                    <div>{item.text}</div>
                </NavLink>
            )}
            {item.submenu && (
                <ul className="menu-sub">
                    {item.submenu.map((subItem, index) => (
                        <MenuItem key={index} {...subItem} />
                       ))}
                </ul>
            )}
        </li>
    );
};

export default Sidebar;
