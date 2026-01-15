import { Link, usePage } from '@inertiajs/react';
import getGreetingMessage from '../utils/greetingHandler';
const Navbar = () => {
  const user = usePage().props.auth.user;
  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar">
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a aria-label='toggle for sidebar' className="nav-item nav-link px-0 me-xl-4" href="#">
          <i className="bx bx-menu bx-sm"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center text-base " id="navbar-collapse">
        {getGreetingMessage(user.name)}
        <ul className="navbar-nav flex-row align-items-center ms-auto">
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <a aria-label='dropdown profile avatar' className="nav-link dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
              <div className="d-flex bg-primary avatar avatar-online rounded-circle z-0 align-items-center justify-content-center">
                <span className="text-white text-lg">{user.name[0]}</span>
              </div>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a aria-label='go to profile' className="dropdown-item" href="#">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="d-flex bg-primary avatar avatar-online rounded-circle z-0 align-items-center justify-content-center">
                        <span className="text-white text-lg">{user.name[0]}</span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <span className="fw-medium d-block">{user.name}</span>
                      <small className="text-muted">Admin</small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <Link aria-label='go to profile' className="dropdown-item" href={route('profile.edit')}>
                  <i className="bx bx-user me-2"></i>
                  <span className="align-middle">My Profile</span>
                </Link>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <Link aria-label='click to log out' className="dropdown-item" href={route('logout')} method="post" as="button">
                  <i className="bx bx-power-off me-2"></i>
                  <span className="align-middle">Log Out</span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
export default Navbar;