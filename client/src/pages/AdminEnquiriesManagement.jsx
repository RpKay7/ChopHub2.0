import API_BASE_URL from "../config/api.js";
import { useEffect, useMemo, useState } from "react";
import "./AdminEnquiriesManagement.css";

const API_URL = API_BASE_URL;
const SESSION_KEY = "chophub-auth-session";

const enquiryTypes = [
  "All Types",
  "Food & Delivery",
  "Catering",
  "Events & Reservations",
  "General",
  "Feedback",
];

const statusOptions = ["All Statuses", "New", "In Progress", "Resolved"];

function getAccessToken() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session?.access_token || "";
  } catch {
    return "";
  }
}

function EnquiryIcon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    inbox: (
      <>
        <path d="M4 4h16l2 11v4H2v-4L4 4Z" />
        <path d="M2 15h6l2 3h4l2-3h6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-4.5A9 9 0 0 1 4 12a8.5 8.5 0 0 1 17-.5Z" />
        <path d="M8 12h8M8 8.5h5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    phone: (
      <path d="M7 3h3l2 5-2 1.5a14 14 0 0 0 4.5 4.5L16 12l5 2v3c0 2-1.5 4-4 4C9 20 4 15 3 7c0-2.5 2-4 4-4Z" />
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function formatDateLabel(date, time) {
  if (!date && !time) return "Not available";
  if (!time) return date;
  if (!date) return time;

  return `${date} · ${time}`;
}

function EnquiryStatus({ status }) {
  return (
    <span
      className={`enquiry-status enquiry-status-${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="enquiry-status-dot" />
      {status}
    </span>
  );
}

function AdminEnquiriesManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Load real enquiries from the backend.
  useEffect(() => {
    let isMounted = true;

    async function loadEnquiries() {
      try {
        setIsLoading(true);
        setLoadError("");

        const token = getAccessToken();

        if (!token) {
          throw new Error(
            "Your admin session could not be found. Please sign in again."
          );
        }

        const response = await fetch(`${API_URL}/enquiries`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load enquiries."
          );
        }

        if (isMounted) {
          setEnquiries(result.enquiries || []);
        }
      } catch (error) {
        console.error("LOAD ENQUIRIES ERROR:", error);

        if (isMounted) {
          setLoadError(
            error.message || "Unable to connect to the ChopHub server."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEnquiries();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: enquiries.length,
      new: enquiries.filter((item) => item.status === "New").length,
      inProgress: enquiries.filter(
        (item) => item.status === "In Progress"
      ).length,
      resolved: enquiries.filter((item) => item.status === "Resolved").length,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return enquiries.filter((item) => {
      const matchesSearch =
        !query ||
        (item.name || "").toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query) ||
        String(item.id || "").toLowerCase().includes(query) ||
        (item.subject || "").toLowerCase().includes(query) ||
        (item.message || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      const matchesType =
        typeFilter === "All Types" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [enquiries, searchTerm, statusFilter, typeFilter]);

  function showFeedback(message) {
    setFeedback(message);

    window.setTimeout(() => {
      setFeedback("");
    }, 2800);
  }

  // Save enquiry status to the database.
  async function updateStatus(id, nextStatus) {
    try {
      setIsUpdating(true);

      const token = getAccessToken();

      if (!token) {
        throw new Error("Your admin session has expired. Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/enquiries/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update enquiry status."
        );
      }

      const updatedEnquiry = result.enquiry;

      setEnquiries((current) =>
        current.map((item) =>
          item.id === id ? updatedEnquiry : item
        )
      );

      setSelectedEnquiry((current) =>
        current?.id === id ? updatedEnquiry : current
      );

      showFeedback(
        nextStatus === "Resolved"
          ? "Enquiry marked as resolved."
          : nextStatus === "In Progress"
            ? "Enquiry moved to In Progress."
            : "Enquiry reopened."
      );
    } catch (error) {
      console.error("UPDATE ENQUIRY ERROR:", error);
      showFeedback(error.message || "Unable to update enquiry.");
    } finally {
      setIsUpdating(false);
    }
  }

  // Delete an enquiry from the database.
  async function deleteEnquiry(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = getAccessToken();

      if (!token) {
        throw new Error("Your admin session has expired. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/enquiries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete enquiry.");
      }

      setEnquiries((current) =>
        current.filter((item) => item.id !== id)
      );

      setSelectedEnquiry((current) =>
        current?.id === id ? null : current
      );

      showFeedback("Enquiry deleted successfully.");
    } catch (error) {
      console.error("DELETE ENQUIRY ERROR:", error);
      showFeedback(error.message || "Unable to delete enquiry.");
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setTypeFilter("All Types");
  }

  function replyToCustomer(enquiry) {
    const subject = `Re: ${enquiry.subject} [${enquiry.id}]`;

    const body = `Hello ${enquiry.name.split(" ")[0]},

Thank you for contacting ChopHub.

Regarding your enquiry: "${enquiry.subject}"

Best regards,
ChopHub Customer Support`;

    const mailtoLink = `mailto:${enquiry.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  }

  return (
    <section className="admin-enquiries">
      <div className="enquiries-heading">
        <div>
          <span className="admin-section-eyebrow">
            CUSTOMER COMMUNICATION
          </span>
          <h1>Enquiries</h1>
          <p>
            Review customer messages, follow up on requests and keep
            conversations organised.
          </p>
        </div>

        <div className="enquiries-heading-icon">
          <EnquiryIcon name="message" size={23} />
        </div>
      </div>

      {feedback && (
        <div className="enquiries-feedback" role="status">
          <EnquiryIcon name="check" size={17} />
          {feedback}
        </div>
      )}

      {loadError && (
        <div className="enquiries-feedback" role="alert">
          {loadError}
        </div>
      )}

      <div className="enquiries-stats">
        <article className="enquiry-stat-card">
          <div className="enquiry-stat-icon total">
            <EnquiryIcon name="inbox" size={20} />
          </div>
          <div>
            <span>Total enquiries</span>
            <strong>{stats.total}</strong>
            <small>All received messages</small>
          </div>
        </article>

        <article className="enquiry-stat-card">
          <div className="enquiry-stat-icon new">
            <EnquiryIcon name="message" size={20} />
          </div>
          <div>
            <span>New enquiries</span>
            <strong>{stats.new}</strong>
            <small>Awaiting attention</small>
          </div>
        </article>

        <article className="enquiry-stat-card">
          <div className="enquiry-stat-icon progress">
            <EnquiryIcon name="clock" size={20} />
          </div>
          <div>
            <span>In progress</span>
            <strong>{stats.inProgress}</strong>
            <small>Currently being handled</small>
          </div>
        </article>

        <article className="enquiry-stat-card">
          <div className="enquiry-stat-icon resolved">
            <EnquiryIcon name="check" size={20} />
          </div>
          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
            <small>Successfully handled</small>
          </div>
        </article>
      </div>

      <div className="enquiries-panel">
        <div className="enquiries-panel-heading">
          <div>
            <h2>All enquiries</h2>
            <p>Manage and respond to messages from your customers.</p>
          </div>

          <span className="enquiries-count">
            {filteredEnquiries.length}{" "}
            {filteredEnquiries.length === 1 ? "result" : "results"}
          </span>
        </div>

        <div className="enquiries-toolbar">
          <label className="enquiries-search">
            <EnquiryIcon name="search" size={18} />
            <input
              type="search"
              placeholder="Search name, email, subject or ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter by enquiry type"
          >
            {enquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by enquiry status"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="enquiries-reset-button"
            onClick={resetFilters}
            title="Reset filters"
          >
            <EnquiryIcon name="refresh" size={17} />
            <span>Reset</span>
          </button>
        </div>

        <div className="enquiries-table-wrap">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Enquiry</th>
                <th>Type</th>
                <th>Date received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6">
                    <div className="enquiries-empty">
                      <strong>Loading enquiries...</strong>
                      <span>Please wait while we retrieve your records.</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="enquiry-customer-cell">
                        <div className="enquiry-avatar">
                          {(item.name || "C")
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.email}</span>
                          <small>{item.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="enquiry-subject-cell">
                        <strong>{item.subject}</strong>
                        <span>{item.message || "No message provided."}</span>
                      </div>
                    </td>

                    <td>
                      <span className="enquiry-type">{item.type}</span>
                    </td>

                    <td>
                      <span className="enquiry-date">
                        {formatDateLabel(item.date, item.time)}
                      </span>
                    </td>

                    <td>
                      <EnquiryStatus status={item.status} />
                    </td>

                    <td>
                      <div className="enquiry-row-actions">
                        <button
                          type="button"
                          className="enquiry-view-button"
                          onClick={() => setSelectedEnquiry(item)}
                          aria-label={`View enquiry from ${item.name}`}
                          title="View enquiry"
                        >
                          <EnquiryIcon name="eye" size={17} />
                        </button>

                        <button
                          type="button"
                          className="enquiry-delete-button"
                          onClick={() => deleteEnquiry(item.id)}
                          disabled={deletingId === item.id}
                          aria-label={`Delete enquiry from ${item.name}`}
                          title="Delete enquiry"
                        >
                          <EnquiryIcon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="enquiries-empty">
                      <div className="enquiries-empty-icon">
                        <EnquiryIcon name="inbox" size={25} />
                      </div>

                      <strong>
                        {enquiries.length === 0
                          ? "No enquiries yet"
                          : "No enquiries found"}
                      </strong>

                      <span>
                        {enquiries.length === 0
                          ? "Customer enquiries will appear here when submitted."
                          : "Try another search term or adjust your filters."}
                      </span>

                      {enquiries.length > 0 && (
                        <button type="button" onClick={resetFilters}>
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEnquiry && (
        <div
          className="enquiry-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEnquiry(null);
            }
          }}
        >
          <section
            className="enquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-modal-title"
          >
            <div className="enquiry-modal-header">
              <div>
                <span className="admin-section-eyebrow">
                  ENQUIRY DETAILS · {selectedEnquiry.id}
                </span>
                <h2 id="enquiry-modal-title">Customer enquiry</h2>
              </div>

              <button
                type="button"
                className="enquiry-modal-close"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close enquiry details"
              >
                <EnquiryIcon name="close" size={19} />
              </button>
            </div>

            <div className="enquiry-modal-body">
              <div className="enquiry-modal-customer">
                <div className="enquiry-modal-avatar">
                  {(selectedEnquiry.name || "C")
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div>
                  <strong>{selectedEnquiry.name}</strong>
                  <span>Customer</span>
                </div>

                <EnquiryStatus status={selectedEnquiry.status} />
              </div>

              <div className="enquiry-detail-grid">
                <div className="enquiry-detail-item">
                  <span>
                    <EnquiryIcon name="mail" size={15} /> Email address
                  </span>
                  <strong>{selectedEnquiry.email}</strong>
                </div>

                <div className="enquiry-detail-item">
                  <span>
                    <EnquiryIcon name="phone" size={15} /> Phone number
                  </span>
                  <strong>{selectedEnquiry.phone || "Not provided"}</strong>
                </div>

                <div className="enquiry-detail-item">
                  <span>
                    <EnquiryIcon name="calendar" size={15} /> Date received
                  </span>
                  <strong>
                    {formatDateLabel(
                      selectedEnquiry.date,
                      selectedEnquiry.time
                    )}
                  </strong>
                </div>

                <div className="enquiry-detail-item">
                  <span>
                    <EnquiryIcon name="inbox" size={15} /> Enquiry type
                  </span>
                  <strong>{selectedEnquiry.type}</strong>
                </div>

                {selectedEnquiry.preferredDate && (
                  <div className="enquiry-detail-item">
                    <span>
                      <EnquiryIcon name="calendar" size={15} /> Preferred date
                    </span>
                    <strong>{selectedEnquiry.preferredDate}</strong>
                  </div>
                )}

                {selectedEnquiry.preferredTime && (
                  <div className="enquiry-detail-item">
                    <span>
                      <EnquiryIcon name="clock" size={15} /> Preferred time
                    </span>
                    <strong>{selectedEnquiry.preferredTime}</strong>
                  </div>
                )}

                {selectedEnquiry.guestCount && (
                  <div className="enquiry-detail-item">
                    <span>
                      <EnquiryIcon name="inbox" size={15} /> Number of guests
                    </span>
                    <strong>{selectedEnquiry.guestCount}</strong>
                  </div>
                )}
              </div>

              <div className="enquiry-message-content">
                <span>SUBJECT</span>
                <h3>{selectedEnquiry.subject}</h3>

                <span className="enquiry-message-label">MESSAGE</span>
                <p>
                  {selectedEnquiry.message || "No message provided."}
                </p>
              </div>
            </div>

            <div className="enquiry-modal-footer">
              <button
                type="button"
                className="enquiry-reply-button"
                onClick={() => replyToCustomer(selectedEnquiry)}
              >
                <EnquiryIcon name="mail" size={16} />
                Reply to Customer
              </button>

              <button
                type="button"
                className="enquiry-modal-delete"
                onClick={() => deleteEnquiry(selectedEnquiry.id)}
                disabled={deletingId === selectedEnquiry.id}
              >
                <EnquiryIcon name="trash" size={16} />
                Delete
              </button>

              <div className="enquiry-modal-status-actions">
                {selectedEnquiry.status === "Resolved" ? (
                  <button
                    type="button"
                    className="enquiry-reopen-button"
                    onClick={() =>
                      updateStatus(selectedEnquiry.id, "New")
                    }
                    disabled={isUpdating}
                  >
                    Reopen enquiry
                  </button>
                ) : (
                  <>
                    {selectedEnquiry.status === "New" && (
                      <button
                        type="button"
                        className="enquiry-progress-button"
                        onClick={() =>
                          updateStatus(
                            selectedEnquiry.id,
                            "In Progress"
                          )
                        }
                        disabled={isUpdating}
                      >
                        Start handling
                      </button>
                    )}

                    <button
                      type="button"
                      className="enquiry-resolve-button"
                      onClick={() =>
                        updateStatus(selectedEnquiry.id, "Resolved")
                      }
                      disabled={isUpdating}
                    >
                      <EnquiryIcon name="check" size={16} />
                      Mark resolved
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminEnquiriesManagement;