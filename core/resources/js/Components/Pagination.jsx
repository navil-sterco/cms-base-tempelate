import { Link, usePage } from "@inertiajs/react";

export default function Pagination({ links = [] }) {
    const { searchTerm } = usePage().props;

    if (links.length === 3) return null;

    return (
        <ul className="pagination">
            {links.map(({ active, label, url }) => {
                let modifiedUrl = url ? `${url}&search=${encodeURIComponent(searchTerm || "")}` : null;

                return url === null ? (
                    <li key={label} className="page-item disabled">
                        <span className="page-link text-black" dangerouslySetInnerHTML={{ __html: label }}></span>
                    </li>
                ) : (
                    <li key={label} className={`page-item ${active ? "active" : ""}`}>
                        <Link className="page-link" href={modifiedUrl} preserveState={true} replace={true}>
                            <span dangerouslySetInnerHTML={{ __html: label }}></span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
