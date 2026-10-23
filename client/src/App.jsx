
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  LayoutDashboard
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const emptyForm = {
  title: "",
  description: "",
  category: "Personal",
  priority: "Medium",
  dueDate: ""
};

  const [form, setForm] = useState(emptyForm);

  async function loadTasks() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
      setError("");
    } catch {
      setError("Cannot connect to the backend. Check that your server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const completed = tasks.filter((task) => task.status === "Done").length;
  const pending = tasks.length - completed;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" && task.status === "Pending") ||
        (filter === "Done" && task.status === "Done");

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(task) {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
      category: task.category || "Personal",
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
    setShowForm(true);
  }

  async function saveTask(event) {
    event.preventDefault();

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save task");

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Could not save task.");
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API}/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: task.status === "Done" ? "Pending" : "Done"
        })
      });

      if (!response.ok) throw new Error("Could not update task");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete task");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ClipboardList size={23} /></div>
          <span>TaskFlow</span>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <div className="nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </div>

        <div className="sidebar-note">
          <div className="note-icon"><CheckCircle2 size={22} /></div>
          <h3>Small steps, big results.</h3>
          <p>Stay organized and make progress every day.</p>
        </div>

        <div className="sidebar-footer">Your personal productivity space</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Dashboard</h1>
          </div>
          <button className="primary-button" onClick={openAddForm}>
            <Plus size={18} /> Add task
          </button>
        </header>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}

        <section className="welcome">
          <div>
            <p className="eyebrow light">YOUR DAY, YOUR WAY</p>
            <h2>Make today count.</h2>
            <p>Plan your work, focus on what matters, and track your progress.</p>
          </div>
          <div className="welcome-icon"><ClipboardList size={60} /></div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-heading"><span>Total tasks</span><ClipboardList size={20} /></div>
            <div className="stat-number">{tasks.length}</div>
            <p>Tasks in your workspace</p>
          </div>
          <div className="stat-card">
            <div className="stat-heading"><span>Pending</span><Clock3 size={20} /></div>
            <div className="stat-number">{pending}</div>
            <p>Still on your list</p>
          </div>
          <div className="stat-card">
            <div className="stat-heading"><span>Completed</span><CheckCircle2 size={20} /></div>
            <div className="stat-number">{completed}</div>
            <p>Tasks finished</p>
          </div>
        </section>

        <section className="progress-card">
          <div className="progress-top">
            <div>
              <h3>Today's progress</h3>
              <p>Every completed task moves you forward.</p>
            </div>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="tasks-section">
          <div className="tasks-heading">
            <div>
              <h2>My tasks</h2>
              <p>Keep everything in one place.</p>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
              />
            </div>
          </div>

          <div className="filter-row">
            {["All", "Pending", "Done"].map((item) => (
              <button
                key={item}
                className={`filter-button ${filter === item ? "selected" : ""}`}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === "All" && <span>{tasks.length}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">Loading your tasks...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><ClipboardList size={30} /></div>
              <h3>{search || filter !== "All" ? "No matching tasks" : "Your list starts here"}</h3>
              <p>
                {search || filter !== "All"
                  ? "Try another search or filter."
                  : "Add your first task and start making progress."}
              </p>
              {!search && filter === "All" && (
                <button className="primary-button" onClick={openAddForm}>
                  <Plus size={17} /> Create your first task
                </button>
              )}
            </div>
          ) : (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article className={`task-card ${task.status === "Done" ? "task-done" : ""}`} key={task._id}>
                  <button
                    className="status-button"
                    onClick={() => toggleTask(task)}
                    title={task.status === "Done" ? "Mark pending" : "Mark done"}
                  >
                    {task.status === "Done"
                      ? <CheckCircle2 size={23} />
                      : <Circle size={23} />}
                  </button>
                  <div className="task-details">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-meta">
                      <span className={`priority priority-${(task.priority || "Medium").toLowerCase()}`}>
                        {task.priority || "Medium"} priority
                      </span>
                      {task.dueDate && (
                        <span className="due-date">
                          <Clock3 size={14} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => openEditForm(task)} title="Edit task" aria-label="Edit task">
                      <Pencil size={17} />
                    </button>
                    <button onClick={() => deleteTask(task._id)} title="Delete task" aria-label="Delete task">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="page-footer">TaskFlow · Plan clearly. Progress daily.</footer>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setShowForm(false);
        }}>
          <form className="task-form" onSubmit={saveTask}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">TASK DETAILS</p>
                <h2>{editingId ? "Edit task" : "Create a task"}</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <label>
              Task title *
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Complete DSA assignment"
              />
            </label>

            <label>
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add a few details..."
              />
            </label>

            <div className="form-row">
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button">
                <Plus size={17} /> {editingId ? "Save changes" : "Create task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
