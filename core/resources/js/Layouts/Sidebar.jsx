import React from 'react';
import menuData from '../data/menuData.json';
import { Link, usePage } from '@inertiajs/react';
import NavLink from '@/Components/NavLink';

const Sidebar = () => {
    const { appLogo, modulesForSidebar = [] } = usePage().props;

    // Inject dynamic CMS modules
    const enhancedMenuData = menuData.map((section) => {
        if (section.header !== 'CMS & Elements') return section;

        if(modulesForSidebar.length > 0) {
            return {
                ...section,
                items: [
                    ...section.items,
                    {
                        text: 'Elements',
                        icon: 'bx bx-grid-alt',
                        available: true,
                        submenu: modulesForSidebar.map((m) => ({
                            text: m.name,
                            available: true,
                            link: 'modules.entries.index',
                            params: [m.id],
                        })),
                    },
                ],
            };
        }

        return section;
    });

    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo" style={{ zIndex: 10 }}>
                <Link href={route('dashboard')} className="app-brand-link">
                    <img src={appLogo} alt="logo" style={{ width: 190 }} />
                </Link>
            </div>

            <div className="menu-inner-shadow mb-1"></div>

            <ul className="menu-inner py-1 pb-4">
                {enhancedMenuData.map((section, idx) => (
                    <React.Fragment key={idx}>
                        {section.header && (
                            <li className="menu-header small text-uppercase">
                                <span className="menu-header-text">{section.header}</span>
                            </li>
                        )}

                        {section.items.map((item, i) => (
                            <MenuItem key={i} item={item} />
                        ))}
                    </React.Fragment>
                ))}
            </ul>
        </aside>
    );
};

/* ===============================
   MENU ITEM
================================ */
const MenuItem = ({ item }) => {
    const { url } = usePage();
    const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;

    // Helper function to check if URL matches a menu path
    const isUrlMatch = (link, params = []) => {
        if (!link) return false;
        
        const linkBase = link.split('.')[0];
        
        // Handle module entries (e.g., modules.entries.index)
        if (link === 'modules.entries.index' && params[0]) {
            const moduleId = params[0];
            return url.includes(`/modules/${moduleId}/entries`);
        }
        
        // Handle by link base
        switch (linkBase) {
            case 'degree':
                return url.includes('/degree');
            case 'pages':
                return url.includes('/pages');
            case 'page-sections':
                return url.includes('/page-sections');
            case 'modules':
                // Only match /modules (not /modules/{id}/entries)
                return url.includes('/modules') && !url.includes('/entries');
            case 'images':
                return url.includes('/images');
            case 'profile':
                return url.includes('/profile');
            default:
                // Fallback to exact route match
                return route().current(link, params);
        }
    };

    // Check if this menu item itself is active
    const isActive = isUrlMatch(item.link, item.params);

    // Check if any submenu item is active
    const isSubmenuActive = hasSubmenu
        ? item.submenu.some((sub) => isUrlMatch(sub.link, sub.params))
        : false;

    const href = item.link
        ? route(item.link, item.params ?? [])
        : item.href ?? '#';

    return (
        <li
            className={`menu-item ${
                isActive || isSubmenuActive ? 'active' : ''
            } ${hasSubmenu && isSubmenuActive ? 'open' : ''}`}
        >
            <NavLink
                href={href}
                className={`menu-link ${hasSubmenu ? 'menu-toggle' : ''}`}
            >
                {item.icon && <i className={`menu-icon tf-icons ${item.icon}`}></i>}
                <div>{item.text}</div>
            </NavLink>

            {hasSubmenu && (
                <ul className="menu-sub">
                    {item.submenu.map((sub, idx) => (
                        <MenuItem key={idx} item={sub} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default Sidebar;
