import { useEffect, useMemo, useState } from "react";
import { apiRequest, getSessionUsers } from "./api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const emptyRecordForm = {
  amount: "",
  type: "expense",
  category: "",
  date: "",
  notes: "",
};

const emptyUserForm = {
  name: "",
  email: "",
  role: "viewer",
  status: "active",
};

function App() {
  const [sessionUsers, setSessionUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [recordForm, setRecordForm] = useState(emptyRecordForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingRecordId, setEditingRecordId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const canManageRecords = currentUser?.role === "admin";
  const canManageUsers = currentUser?.role === "admin";
  const canViewSummaries = ["viewer", "analyst", "admin"].includes(currentUser?.role);

  const filteredQuery = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const normalized = key.includes("Date") ? new Date(value).toISOString() : value;
        params.set(key, normalized);
      }
    });

    return params.toString();
  }, [filters]);

  const loadSessionUsers = async () => {
    const data = await getSessionUsers();
    setSessionUsers(data);
    if (!selectedUserId && data.length > 0) {
      setSelectedUserId(data[0]._id);
    }
  };

  const loadAppData = async (userId) => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [me, summaryData, recordData] = await Promise.all([
        apiRequest("/users/me", {}, userId),
        apiRequest("/dashboard/summary", {}, userId),
        apiRequest(`/records${filteredQuery ? `?${filteredQuery}` : ""}`, {}, userId),
      ]);

      setCurrentUser(me);
      setSummary(summaryData);
      setRecords(recordData.data);

      if (me.role === "admin") {
        const allUsers = await apiRequest("/users", {}, userId);
        setUsers(allUsers);
      } else {
        setUsers([]);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionUsers().catch((requestError) => {
      setError(requestError.message);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadAppData(selectedUserId);
    }
  }, [selectedUserId, filteredQuery]);

  const handleRecordSubmit = async (event) => {
    event.preventDefault();
    setError("");+
    setNotice("");

    try {
      const path = editingRecordId ? `/records/${editingRecordId}` : "/records";
      const method = editingRecordId ? "PATCH" : "POST";

      await apiRequest(
        path,
        {
          method,
          body: JSON.stringify(recordForm),
        },
        selectedUserId
      );

      setNotice(editingRecordId ? "Record updated successfully." : "Record created successfully.");
      setRecordForm(emptyRecordForm);
      setEditingRecordId("");
      await loadAppData(selectedUserId);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record._id);
    setRecordForm({
      amount: String(record.amount),
      type: record.type,
      category: record.category,
      date: record.date.slice(0, 10),
      notes: record.notes || "",
    });
  };

  const handleDeleteRecord = async (recordId) => {
    setError("");
    setNotice("");

    try {
      await apiRequest(
        `/records/${recordId}`,
        {
          method: "DELETE",
        },
        selectedUserId
      );

      setNotice("Record deleted successfully.");
      if (editingRecordId === recordId) {
        setEditingRecordId("");
        setRecordForm(emptyRecordForm);
      }
      await loadAppData(selectedUserId);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      const path = editingUserId ? `/users/${editingUserId}` : "/users";
      const method = editingUserId ? "PATCH" : "POST";

      await apiRequest(
        path,
        {
          method,
          body: JSON.stringify(userForm),
        },
        selectedUserId
      );

      setNotice(editingUserId ? "User updated successfully." : "User created successfully.");
      setUserForm(emptyUserForm);
      setEditingUserId("");
      await loadSessionUsers();
      await loadAppData(selectedUserId);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Finance  Dashboard</p>
          <h1>Role-aware reporting and record management.</h1>
          {/* <p className="hero-copy">
            This demo shows backend-driven role enforcement for viewers, analysts, and admins, with
            a React dashboard consuming the same APIs your production frontend could use.
          </p> */}
        </div>

        <div className="session-card">
          <label htmlFor="sessionUser">Acting user</label>
          <select
            id="sessionUser"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          >
            {sessionUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          {currentUser ? (
            <p className="session-meta">
              Signed in as <strong>{currentUser.name}</strong> with <strong>{currentUser.role}</strong>{" "}
              access.
            </p>
          ) : null}
        </div>
      </header>

      {error ? <div className="banner error">{error}</div> : null}
      {notice ? <div className="banner success">{notice}</div> : null}

      {loading ? (
        <div className="panel">Loading dashboard data...</div>
      ) : (
        <>
          {canViewSummaries && summary ? (
            <section className="grid stats-grid">
              <StatCard label="Total Income" value={currency.format(summary.totals.income)} tone="green" />
              <StatCard
                label="Total Expenses"
                value={currency.format(summary.totals.expenses)}
                tone="orange"
              />
              <StatCard
                label="Net Balance"
                value={currency.format(summary.totals.netBalance)}
                tone="blue"
              />
            </section>
          ) : null}

          <section className="grid main-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">Insights</p>
                  <h2>Dashboard summary</h2>
                </div>
              </div>

              {summary ? (
                <>
                  <h3>Category totals</h3>
                  <div className="category-list">
                    {summary.categoryTotals.map((item) => (
                      <div key={`${item.category}-${item.type}`} className="category-item">
                        <div>
                          <strong>{item.category}</strong>
                          <span>{item.type}</span>
                        </div>
                        <strong>{currency.format(item.total)}</strong>
                      </div>
                    ))}
                  </div>

                  <h3>Recent activity</h3>
                  <div className="activity-list">
                    {summary.recentActivity.map((item) => (
                      <div key={item._id} className="activity-item">
                        <div>
                          <strong>{item.category}</strong>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <div className={`pill ${item.type}`}>{currency.format(item.amount)}</div>
                      </div>
                    ))}
                  </div>

                  <h3>Monthly trends</h3>
                  <div className="trend-list">
                    {summary.monthlyTrends.map((item, index) => (
                      <div key={`${item.year}-${item.month}-${item.type}-${index}`} className="trend-item">
                        <span>
                          {item.month}/{item.year} {item.type}
                        </span>
                        <strong>{currency.format(item.total)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>No summary data available.</p>
              )}
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">Records</p>
                  <h2>Financial entries</h2>
                </div>
              </div>

              <div className="filters">
                <input
                  placeholder="Filter by category"
                  value={filters.category}
                  onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
                />
                <select
                  value={filters.type}
                  onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                >
                  <option value="">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Notes</th>
                      {canManageRecords ? <th>Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.category}</td>
                        <td>
                          <span className={`pill ${record.type}`}>{record.type}</span>
                        </td>
                        <td>{currency.format(record.amount)}</td>
                        <td>{record.notes || "-"}</td>
                        {canManageRecords ? (
                          <td className="actions">
                            <button type="button" onClick={() => handleEditRecord(record)}>
                              Edit
                            </button>
                            <button type="button" className="danger" onClick={() => handleDeleteRecord(record._id)}>
                              Delete
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {canManageRecords ? (
            <section className="grid forms-grid">
              <div className="panel">
                <p className="panel-kicker">Admin only</p>
                <h2>{editingRecordId ? "Edit record" : "Create record"}</h2>
                <form className="stack-form" onSubmit={handleRecordSubmit}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={recordForm.amount}
                    onChange={(event) =>
                      setRecordForm((current) => ({ ...current, amount: event.target.value }))
                    }
                    required
                  />
                  <select
                    value={recordForm.type}
                    onChange={(event) => setRecordForm((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <input
                    placeholder="Category"
                    value={recordForm.category}
                    onChange={(event) =>
                      setRecordForm((current) => ({ ...current, category: event.target.value }))
                    }
                    required
                  />
                  <input
                    type="date"
                    value={recordForm.date}
                    onChange={(event) => setRecordForm((current) => ({ ...current, date: event.target.value }))}
                    required
                  />
                  <textarea
                    placeholder="Notes"
                    value={recordForm.notes}
                    onChange={(event) => setRecordForm((current) => ({ ...current, notes: event.target.value }))}
                    rows="4"
                  />
                  <div className="form-actions">
                    <button type="submit">{editingRecordId ? "Update record" : "Create record"}</button>
                    {editingRecordId ? (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => {
                          setEditingRecordId("");
                          setRecordForm(emptyRecordForm);
                        }}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>

              {canManageUsers ? (
                <div className="panel">
                  <p className="panel-kicker">Admin only</p>
                  <h2>{editingUserId ? "Edit user" : "Create user"}</h2>
                  <form className="stack-form" onSubmit={handleUserSubmit}>
                    <input
                      placeholder="Name"
                      value={userForm.name}
                      onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={userForm.email}
                      onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                      required
                    />
                    <select
                      value={userForm.role}
                      onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select
                      value={userForm.status}
                      onChange={(event) => setUserForm((current) => ({ ...current, status: event.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="form-actions">
                      <button type="submit">{editingUserId ? "Update user" : "Create user"}</button>
                      {editingUserId ? (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => {
                            setEditingUserId("");
                            setUserForm(emptyUserForm);
                          }}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </form>

                  <div className="user-list">
                    {users.map((user) => (
                      <div key={user._id} className="user-row">
                        <div>
                          <strong>{user.name}</strong>
                          <span>
                            {user.email} • {user.role} • {user.status}
                          </span>
                        </div>
                        <button type="button" onClick={() => handleEditUser(user)}>
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
