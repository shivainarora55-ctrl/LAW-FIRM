export const PORTAL_ITEMS = [
  { label: "Dashboard", href: "/portal" },
  { label: "My Profile", href: "/portal/profile" },
  { label: "Submit Matter", href: "/portal/submit-matter" },
  { label: "Documents", href: "/portal/documents" },
  { label: "Requests", href: "/portal/requests" },
];

export const MATTER_STATUSES = ["submitted", "in progress", "resolved"];
export const REQUEST_STATUSES = ["open", "in progress", "resolved"];
export const URGENCY_OPTIONS = ["normal", "urgent"];
export const PREFERRED_CONTACT_OPTIONS = ["phone", "email"];
export const REQUEST_TYPES = ["callback", "consultation", "status update", "document request"];
export const ALLOWED_UPLOAD_TYPES = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_DOCUMENTS_PER_USER = 50;
