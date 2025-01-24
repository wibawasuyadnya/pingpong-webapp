import React from "react";

export default function Header() {
    return (
        <nav className="navbar bg-base-100 border-b-[1px] border-solid w-full">
            <div className="flex flex-1 items-center">
                <a className="link text-base-content link-neutral text-xl font-semibold no-underline" href="/">
                    PingPong Studio
                </a>
            </div>
            <div className="navbar-end flex items-center gap-4">
                <div className="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
                    <button id="dropdown-scrollable" type="button" className="dropdown-toggle btn btn-text btn-circle dropdown-open:bg-base-content/10 size-10" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                        <div className="indicator">
                            <span className="indicator-item bg-error size-2 rounded-full"></span>
                            <span className="icon-[tabler--bell] text-base-content size-[1.375rem]"></span>
                        </div>
                    </button>
                    <div className="dropdown-menu dropdown-open:opacity-100 hidden" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-scrollable">
                        <div className="dropdown-header justify-center">
                            <h6 className="text-base-content text-base">Notifications</h6>
                        </div>
                        <div className="vertical-scrollbar horizontal-scrollbar rounded-scrollbar text-base-content/80 max-h-56 overflow-auto max-md:max-w-60">
                            <div className="dropdown-item">
                                <div className="avatar away-bottom">
                                    <div className="w-10 rounded-full">
                                        <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" alt="avatar 1" />
                                    </div>
                                </div>
                                <div className="w-60">
                                    <h6 className="truncate text-base">Charles Franklin</h6>
                                    <small className="text-base-content/50 truncate">Accepted your connection</small>
                                </div>
                            </div>
                            <div className="dropdown-item">
                                <div className="avatar">
                                    <div className="w-10 rounded-full">
                                        <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-2.png" alt="avatar 2" />
                                    </div>
                                </div>
                                <div className="w-60">
                                    <h6 className="truncate text-base">Martian added moved Charts & Maps task to the done board.</h6>
                                    <small className="text-base-content/50 truncate">Today 10:00 AM</small>
                                </div>
                            </div>
                            <div className="dropdown-item">
                                <div className="avatar online-bottom">
                                    <div className="w-10 rounded-full">
                                        <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-8.png" alt="avatar 8" />
                                    </div>
                                </div>
                                <div className="w-60">
                                    <h6 className="truncate text-base">New Message</h6>
                                    <small className="text-base-content/50 truncate">You have new message from Natalie</small>
                                </div>
                            </div>
                            <div className="dropdown-item">
                                <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content w-10 rounded-full p-2">
                                        <span className="icon-[tabler--user] size-full"></span>
                                    </div>
                                </div>
                                <div className="w-60">
                                    <h6 className="truncate text-base">Application has been approved 🚀</h6>
                                    <small className="text-base-content/50 text-wrap">Your ABC project application has been approved.</small>
                                </div>
                            </div>
                            <div className="dropdown-item">
                                <div className="avatar">
                                    <div className="w-10 rounded-full">
                                        <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-10.png" alt="avatar 10" />
                                    </div>
                                </div>
                                <div className="w-60">
                                    <h6 className="truncate text-base">New message from Jane</h6>
                                    <small className="text-base-content/50 text-wrap">Your have new message from Jane</small>
                                </div>
                            </div>
                            <div className="dropdown-item">
                                <div className="avatar">
                                    <div className="w-10 rounded-full">
                                        <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-3.png" alt="avatar 3" />
                                    </div>
                                </div>
                                <div className="w-60">
                                    <h6 className="truncate text-base">Barry Commented on App review task.</h6>
                                    <small className="text-base-content/50 truncate">Today 8:32 AM</small>
                                </div>
                            </div>
                        </div>
                        <a href="#" className="dropdown-footer justify-center gap-1">
                            <span className="icon-[tabler--eye] size-4"></span>
                            View all
                        </a>
                    </div>
                </div>
                <div className="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
                    <button id="dropdown-scrollable" type="button" className="dropdown-toggle flex items-center" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                        <div className="avatar">
                            <div className="size-9.5 rounded-full">
                                <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" alt="avatar 1" />
                            </div>
                        </div>
                    </button>
                    <ul className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-avatar">
                        <li className="dropdown-header gap-2">
                            <div className="avatar">
                                <div className="w-10 rounded-full">
                                    <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" alt="avatar" />
                                </div>
                            </div>
                            <div>
                                <h6 className="text-base-content text-base font-semibold">John Doe</h6>
                                <small className="text-base-content/50">Admin</small>
                            </div>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                <span className="icon-[tabler--user]"></span>
                                My Profile
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                <span className="icon-[tabler--settings]"></span>
                                Settings
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                <span className="icon-[tabler--receipt-rupee]"></span>
                                Billing
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                <span className="icon-[tabler--help-triangle]"></span>
                                FAQs
                            </a>
                        </li>
                        <li className="dropdown-footer gap-2">
                            <a className="btn btn-error btn-soft btn-block" href="#">
                                <span className="icon-[tabler--logout]"></span>
                                Sign out
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}