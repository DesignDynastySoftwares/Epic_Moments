import axios from "axios";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "./List.css";

const AdminUsers = ({ token: tokenProp }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = tokenProp || localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      } else if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        toast.error(res.data?.message || "Failed to load users");
      }
    } catch (error) {
      const sc = error.response?.status;
      if (sc === 401 || sc === 403) {
        toast.error("Admin session invalid. Please log in again.");
      } else {
        toast.error("Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase?.().includes(q)
    );
  });

  return (
    <div className="pl-wrap">
      <div className="pl-head">
        <div className="pl-head__left">
          <h1>Registered Users</h1>
          <span className="pl-head__count">{users.length} users</span>
        </div>
        <div className="pl-search">
          <FaSearch className="pl-search__icon" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="pl-table">
        <div className="pl-thead" style={{ gridTemplateColumns: "1.4fr 2fr 1.3fr 1fr 1.2fr" }}>
          <span>Name</span>
          <span>Email</span>
          <span>Contact</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Joined</span>
        </div>

        {loading && <div className="pl-empty">Loading users...</div>}
        {!loading && filtered.length === 0 && (
          <div className="pl-empty">No users found.</div>
        )}

        {filtered.map((u) => (
          <div
            key={u._id}
            className="pl-row"
            style={{ gridTemplateColumns: "1.4fr 2fr 1.3fr 1fr 1.2fr" }}
          >
            <p className="pl-name">{u.name || "—"}</p>
            <span className="pl-sizes" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {u.email || "—"}
            </span>
            <span className="pl-sizes">{u.phone || "—"}</span>
            <div className="pl-cell-meta">
              {u.isActive ? (
                <span className="pl-badge-yes">● Online</span>
              ) : (
                <span className="pl-badge-no">Offline</span>
              )}
            </div>
            <span className="pl-sizes" style={{ textAlign: "right" }}>
              {u.createdAt
                ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
