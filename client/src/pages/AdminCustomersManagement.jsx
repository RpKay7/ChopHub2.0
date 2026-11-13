
import { useEffect, useMemo, useState } from "react";
import "./AdminCustomersManagement.css";

const API_URL = "http://localhost:5000/api";
const SESSION_KEY = "chophub-auth-session";

function getAccessToken() {
  try {
    const session = JSON.parse(
      localStorage.getItem(SESSION_KEY)
    );

    return session?.access_token || null;
  } catch {
    return null;
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "No orders yet";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CustomerIcon({ type }) {
  const paths = {
    customers: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function AdminCustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);

  // FETCH LIVE CUSTOMERS
  useEffect(() => {
    let isMounted = true;

    async function fetchCustomers() {
      try {
        setLoading(true);
        setError("");

        const token = getAccessToken();

        if (!token) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        const response = await fetch(
          `${API_URL}/admin/customers`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load customers."
          );
        }

        if (isMounted) {
          setCustomers(result.customers || []);
        }
      } catch (err) {
        console.error("Fetch customers error:", err);

        if (isMounted) {
          setError(
            err.message || "Unable to load customer records."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const suspendedCustomers = customers.filter(
    (customer) => customer.status === "Suspended"
  ).length;

  const totalRevenue = customers.reduce(
    (total, customer) =>
      total + Number(customer.totalSpent || 0),
    0
  );

  // SEARCH AND FILTER
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.id.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // SUSPEND OR ACTIVATE CUSTOMER
  const handleStatusChange = async (customerId) => {
    const customer = customers.find(
      (item) => item.id === customerId
    );

    if (!customer || updatingCustomerId) return;

    const newStatus =
      customer.status === "Active" ? "Suspended" : "Active";

    try {
      setUpdatingCustomerId(customerId);
      setFeedback("");

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/admin/customers/${customer.databaseId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update customer status."
        );
      }

      const updatedCustomer = {
        ...customer,
        status: newStatus,
      };

      setCustomers((previousCustomers) =>
        previousCustomers.map((item) =>
          item.id === customerId
            ? updatedCustomer
            : item
        )
      );

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(updatedCustomer);
      }

      setFeedback(
        `${customer.name}'s account is now ${newStatus.toLowerCase()}.`
      );

      window.setTimeout(() => {
        setFeedback("");
      }, 3000);
    } catch (err) {
      console.error("Update customer status error:", err);

      setFeedback(
        err.message || "Unable to update customer status."
      );
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  return (
    <div className="admin-customers">
      <div className="customers-heading">
        <div>
          <span className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h2>Customers</h2>

          <p>
            View customer accounts, monitor activity and manage
            account access.
          </p>
        </div>
      </div>

      <div className="customers-demo-notice">
        <span className="demo-notice-dot" />
        Live data — customer records are retrieved from your database.
      </div>

      {feedback && (
        <div className="customers-feedback">
          {feedback}
        </div>
      )}

      {error && (
        <div className="customers-feedback">
          {error}
        </div>
      )}

      <div className="customers-stats">
        <div className="customer-stat-card">
          <div className="customer-stat-top">
            <span>Total customers</span>
            <span className="customer-stat-icon">
              <CustomerIcon type="customers" />
            </span>
          </div>

          <strong>{loading ? "—" : totalCustomers}</strong>

          <small>Registered accounts</small>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-top">
            <span>Active customers</span>
            <span className="customer-stat-icon">
              <span className="stat-status-dot active" />
            </span>
          </div>

          <strong>{loading ? "—" : activeCustomers}</strong>

          <small>Accounts with active access</small>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-top">
            <span>Suspended accounts</span>
            <span className="customer-stat-icon">
              <span className="stat-status-dot suspended" />
            </span>
          </div>

          <strong>{loading ? "—" : suspendedCustomers}</strong>

          <small>Accounts with restricted access</small>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-top">
            <span>Customer spending</span>
            <span className="customer-stat-icon spending-icon">
              ₦
            </span>
          </div>

          <strong>
            {loading ? "—" : formatCurrency(totalRevenue)}
          </strong>

          <small>Combined paid order value</small>
        </div>
      </div>

      <div className="customers-table-section">
        <div className="customers-table-header">
          <div>
            <h3>All customers</h3>

            <p>
              {loading
                ? "Loading customer records..."
                : `${filteredCustomers.length} customer${
                    filteredCustomers.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          <div className="customers-controls">
            <div className="customers-search">
              <CustomerIcon type="search" />

              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter customers by status"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="customers-empty-state">
                      <CustomerIcon type="customers" />
                      <strong>Loading customers...</strong>
                      <span>
                        Retrieving live customer records.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7">
                    <div className="customers-empty-state">
                      <strong>Unable to load customers</strong>
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-identity">
                        <div className="customer-avatar">
                          {customer.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="customer-id">
                      {customer.id}
                    </td>

                    <td>{customer.orders}</td>

                    <td className="customer-spent">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td>{formatDate(customer.joined)}</td>

                    <td>
                      <span
                        className={`customer-status ${customer.status.toLowerCase()}`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <div className="customer-actions">
                        <button
                          className="customer-view-button"
                          onClick={() =>
                            setSelectedCustomer(customer)
                          }
                          aria-label={`View ${customer.name}`}
                          title="View customer"
                        >
                          <CustomerIcon type="eye" />
                        </button>

                        <button
                          className={`customer-manage-button ${
                            customer.status === "Active"
                              ? "suspend"
                              : "activate"
                          }`}
                          onClick={() =>
                            handleStatusChange(customer.id)
                          }
                          disabled={updatingCustomerId !== null}
                        >
                          {updatingCustomerId === customer.id
                            ? "Updating..."
                            : customer.status === "Active"
                              ? "Suspend"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="customers-empty-state">
                      <CustomerIcon type="customers" />
                      <strong>No customers found</strong>
                      <span>
                        Try changing your search or filter.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="customer-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customer-modal-header">
              <div>
                <span>CUSTOMER PROFILE</span>
                <h3>Customer details</h3>
              </div>

              <button
                className="customer-modal-close"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close customer details"
              >
                <CustomerIcon type="close" />
              </button>
            </div>

            <div className="customer-profile-summary">
              <div className="customer-profile-avatar">
                {selectedCustomer.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div>
                <h3>{selectedCustomer.name}</h3>
                <span>{selectedCustomer.id}</span>
              </div>

              <span
                className={`customer-status ${selectedCustomer.status.toLowerCase()}`}
              >
                {selectedCustomer.status}
              </span>
            </div>

            <div className="customer-detail-list">
              <div>
                <span>Email address</span>
                <strong>{selectedCustomer.email}</strong>
              </div>

              <div>
                <span>Phone number</span>
                <strong>{selectedCustomer.phone}</strong>
              </div>

              <div>
                <span>Date joined</span>
                <strong>{formatDate(selectedCustomer.joined)}</strong>
              </div>

              <div>
                <span>Last order</span>
                <strong>{formatDate(selectedCustomer.lastOrder)}</strong>
              </div>

              <div>
                <span>Total orders</span>
                <strong>{selectedCustomer.orders}</strong>
              </div>

              <div>
                <span>Total spent</span>
                <strong>
                  {formatCurrency(selectedCustomer.totalSpent)}
                </strong>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button
                className={`customer-manage-button modal-manage-button ${
                  selectedCustomer.status === "Active"
                    ? "suspend"
                    : "activate"
                }`}
                onClick={() =>
                  handleStatusChange(selectedCustomer.id)
                }
                disabled={updatingCustomerId !== null}
              >
                {updatingCustomerId === selectedCustomer.id
                  ? "Updating..."
                  : selectedCustomer.status === "Active"
                    ? "Suspend account"
                    : "Activate account"}
              </button>

              <button
                className="customer-modal-done"
                onClick={() => setSelectedCustomer(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomersManagement;
