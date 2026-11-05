
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5001";

function AdminDashboard() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [reports, setReports] = useState([]);
  const [applications, setApplications] = useState([]);
const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  async function handleLogin(event) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      setToken(data.token);
      setPassword("");
    } catch (err) {
      setLoginError(err.message || "Could not connect to the server.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadReports(authToken = token) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/rescue-reports`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load reports.");
      }

      setReports(data.reports);
    } catch (err) {
      setError(err.message || "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }
  async function loadApplications(authToken = token) {
  setApplicationsLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5001/api/adoption-applications",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load applications.");
    }

    setApplications(data.applications || []);
  } catch (error) {
    console.error("Applications error:", error.message);
  } finally {
    setApplicationsLoading(false);
  }
}
async function updateApplicationStatus(id, status) {
  try {
    const response = await fetch(
      `http://localhost:5001/api/adoption-applications/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update status.");
    }

    setApplications((previousApplications) =>
      previousApplications.map((application) =>
        application.id === id
          ? { ...application, status }
          : application
      )
    );

    alert("Application status updated successfully!");
  } catch (error) {
    alert(error.message);
  }
}

  useEffect(() => {
  if (token) {
    loadReports(token);
    loadApplications(token);
  }
}, [token]);

  async function updateStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/api/rescue-reports/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update status.");
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      );
    } catch (err) {
      alert(err.message || "Could not update report status.");
    }
  }

  function handleLogout() {
    setToken("");
    setPassword("");
    setReports([]);
    setError("");
    setFilter("All");
  }

  if (!token) {
    return (
      <main className="admin-dashboard">
        <section className="admin-report-section">
          <h1>🐾 PawConnect Admin Login</h1>
          <p>Log in to manage animal rescue reports.</p>

          <form onSubmit={handleLogin}>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {loginError && (
              <p className="admin-error">{loginError}</p>
            )}

            <button
              type="submit"
              className="refresh-button"
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const pendingCount = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  const inProgressCount = reports.filter(
    (report) => report.status === "In Progress"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "Resolved"
  ).length;
  const filteredReports = reports
  .filter((report) => {
    const matchesStatus =
      filter === "All" || report.status === filter;

    const searchText = searchTerm.toLowerCase().trim();

    const matchesSearch = [
      report.animal_type,
      report.location,
      report.reporter_name,
      report.description,
      report.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    return matchesStatus && matchesSearch;
  })
  .sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();

    return sortOrder === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">PAWCONNECT • ADMIN</p>
          <h1>Rescue Dashboard</h1>
          <p>Review reports and track animals that need help.</p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => loadReports()}
            className="refresh-button"
          >
            Refresh reports
          </button>{" "}
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article className="admin-stat">
          <span>Total reports</span>
          <strong>{reports.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className="admin-stat">
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
        </article>
        <article className="admin-stat">
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </article>
      </section>

      <section className="admin-report-section">
        <div className="admin-report-heading">
          <div>
            <h2>Rescue reports</h2>
            <p>Manage submitted animal rescue cases.</p>
          </div>
          <input
           type="text"
           placeholder="Search by animal, location, reporter..."
           value={searchTerm}
           onChange={(event) => setSearchTerm(event.target.value)}
           className="admin-search"
           />
           <label className="admin-filter">
           Sort by:
           <select
           value={sortOrder}
           onChange={(event) => setSortOrder(event.target.value)}
           >
           <option value="newest">Newest first</option>
           <option value="oldest">Oldest first</option>
           </select>
           </label>

          <label className="admin-filter">
            Filter:
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All reports</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>
        </div>

        {loading && <p>Loading rescue reports...</p>}
        {error && <p className="admin-error">{error}</p>}

        {!loading && !error && filteredReports.length === 0 && (
          <p className="admin-empty">No reports found for this filter.</p>
        )}

        <div className="admin-report-list">
          {filteredReports.map((report) => (
            <article className="admin-report-card" key={report.id}>
              <div className="admin-report-top">
                <div>
                  <span className="admin-report-id">
                    REPORT #{report.id}
                  </span>
                  <h3>{report.animal_type} rescue</h3>
                </div>

                <span
                  className={`admin-status status-${report.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {report.status}
                </span>
              </div>

              <p className="admin-description">{report.description}</p>

              <div className="admin-report-details">
                <p><strong>Location:</strong> {report.location}</p>
                <p><strong>Reported by:</strong> {report.reporter_name}</p>
                <p><strong>Contact:</strong> {report.contact}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(report.created_at).toLocaleString()}
                </p>
              </div>

              <label className="admin-status-control">
                Update status
                <select
                  value={report.status}
                  onChange={(event) =>
                    updateStatus(report.id, event.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </label>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-report-section">
        <div className="admin-report-heading">
          <div>
            <h2>Adoption Applications 🐾</h2>
            <p>Review people interested in adopting animals.</p>
          </div>
        </div>

        {applicationsLoading ? (
          <p>Loading adoption applications...</p>
        ) : applications.length === 0 ? (
          <p>No adoption applications received yet.</p>
        ) : (
          <div className="admin-reports-list">
            {applications.map((application) => (
              <article className="admin-report-card" key={application.id}>
                <h3>{application.animal_name}</h3>
                <p><strong>Applicant:</strong> {application.applicant_name}</p>
                <p><strong>Email:</strong> {application.email}</p>
                <p><strong>Phone:</strong> {application.phone}</p>
                <p><strong>Reason:</strong> {application.reason}</p>
                <label>
  Application Status:
  <select
    value={application.status}
    onChange={(event) =>
      updateApplicationStatus(application.id, event.target.value)
    }
  >
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Rejected">Rejected</option>
  </select>
</label>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
