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

    // 🔥 ACTIVE LOGIC (THIS FIXES IT)
    const isActive = item.link
        ? route().current(item.link, item.params ?? [])
        : false;

    const isSubmenuActive = hasSubmenu
        ? item.submenu.some((sub) =>
              sub.link
                  ? route().current(sub.link, sub.params ?? [])
                  : false
          )
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
