import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

import { getSubjects } from "../services/subjectService";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] =
    useState("Medium");
  const [dueDate, setDueDate] = useState("");

  // ==========================================
  // Load tasks + subjects
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tasksResponse, subjectsResponse] =
        await Promise.all([
          getTasks(),
          getSubjects(),
        ]);

      if (!tasksResponse.success) {
        throw new Error(
          tasksResponse.message ||
            "Failed to load tasks"
        );
      }

      if (!subjectsResponse.success) {
        throw new Error(
          subjectsResponse.message ||
            "Failed to load subjects"
        );
      }

      setTasks(tasksResponse.tasks || []);
      setSubjects(subjectsResponse.subjects || []);
    } catch (err) {
      console.error("Load tasks error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // Statistics
  // ==========================================

  const statistics = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.completed
    ).length;

    const pending = tasks.filter(
      (task) => !task.completed
    ).length;

    const now = new Date();

    const overdue = tasks.filter((task) => {
      if (task.completed || !task.dueDate) {
        return false;
      }

      return new Date(task.dueDate) < now;
    }).length;

    return {
      total,
      completed,
      pending,
      overdue,
    };
  }, [tasks]);

  // ==========================================
  // Filter tasks
  // ==========================================

  const filteredTasks = useMemo(() => {
    if (filter === "pending") {
      return tasks.filter(
        (task) => !task.completed
      );
    }

    if (filter === "completed") {
      return tasks.filter(
        (task) => task.completed
      );
    }

    return tasks;
  }, [tasks, filter]);

  // ==========================================
  // Open Add Modal
  // ==========================================

  const openAddModal = () => {
    setEditingTask(null);

    setTitle("");
    setDescription("");
    setSubject(
      subjects.length > 0
        ? subjects[0]._id
        : ""
    );
    setPriority("Medium");
    setDueDate("");

    setError("");
    setShowModal(true);
  };

  // ==========================================
  // Open Edit Modal
  // ==========================================

  const openEditModal = (task) => {
    setEditingTask(task);

    setTitle(task.title || "");
    setDescription(
      task.description || ""
    );

    setSubject(
      task.subject?._id ||
        task.subject ||
        ""
    );

    setPriority(
      task.priority || "Medium"
    );

    if (task.dueDate) {
      const date = new Date(task.dueDate);

      const localDate = new Date(
        date.getTime() -
          date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setDueDate(localDate);
    } else {
      setDueDate("");
    }

    setError("");
    setShowModal(true);
  };

  // ==========================================
  // Close Modal
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTask(null);
  };

  // ==========================================
  // Create / Update
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!subject) {
      setError("Please select a subject.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        subject,
        priority,
      };

      if (dueDate) {
        taskData.dueDate = new Date(
          dueDate
        ).toISOString();
      }

      if (editingTask) {
        const response = await updateTask(
          editingTask._id,
          taskData
        );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to update task"
          );
        }
      } else {
        const response = await createTask(
          taskData
        );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to create task"
          );
        }
      }

      closeModal();

      await loadData();
    } catch (err) {
      console.error("Save task error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Toggle completion
  // ==========================================

  const toggleTask = async (task) => {
    try {
      setError("");

      const response = await updateTask(
        task._id,
        {
          completed: !task.completed,
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to update task"
        );
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id
            ? {
                ...item,
                completed:
                  !item.completed,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Toggle task error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update task"
      );
    }
  };

  // ==========================================
  // Delete
  // ==========================================

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await deleteTask(
        task._id
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to delete task"
        );
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (item) =>
            item._id !== task._id
        )
      );
    } catch (err) {
      console.error(
        "Delete task error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete task"
      );
    }
  };

  // ==========================================
  // Helpers
  // ==========================================

  const getSubjectName = (task) => {
    if (
      task.subject &&
      typeof task.subject === "object"
    ) {
      return task.subject.name;
    }

    const foundSubject = subjects.find(
      (item) =>
        item._id === task.subject
    );

    return (
      foundSubject?.name ||
      "Unknown subject"
    );
  };

  const formatDueDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getPriorityClass = (priority) => {
  return `priority-${
    (priority || "Medium").toLowerCase()
  }`;
};

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="page-loading">
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <p className="page-eyebrow">
            STAY ON TRACK
          </p>

          <h1>Tasks</h1>

          <p className="page-description">
            Manage your assignments and study
            tasks.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Task
        </button>

      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="task-stats">

        <div className="task-stat-card">
          <span>Total Tasks</span>
          <strong>
            {statistics.total}
          </strong>
        </div>

        <div className="task-stat-card">
          <span>Pending</span>
          <strong>
            {statistics.pending}
          </strong>
        </div>

        <div className="task-stat-card">
          <span>Completed</span>
          <strong>
            {statistics.completed}
          </strong>
        </div>

        <div className="task-stat-card">
          <span>Overdue</span>
          <strong>
            {statistics.overdue}
          </strong>
        </div>

      </div>

      {/* =====================================
          FILTERS
      ===================================== */}

      <div className="task-toolbar">

        <div className="task-filters">

          <button
            className={
              filter === "all"
                ? "task-filter active"
                : "task-filter"
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              filter === "pending"
                ? "task-filter active"
                : "task-filter"
            }
            onClick={() =>
              setFilter("pending")
            }
          >
            Pending
          </button>

          <button
            className={
              filter === "completed"
                ? "task-filter active"
                : "task-filter"
            }
            onClick={() =>
              setFilter("completed")
            }
          >
            Completed
          </button>

        </div>

        <span className="task-count">
          {filteredTasks.length} tasks
        </span>

      </div>

      {/* =====================================
          TASK LIST
      ===================================== */}

      {filteredTasks.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            ✓
          </div>

          <h2>
            {filter === "completed"
              ? "No completed tasks"
              : filter === "pending"
              ? "No pending tasks"
              : "No tasks yet"}
          </h2>

          <p>
            {filter === "all"
              ? "Create your first task to start organizing your work."
              : "There are no tasks in this category."}
          </p>

          {filter === "all" && (
            <button
              className="primary-button"
              onClick={openAddModal}
            >
              <span>+</span>
              Add Your First Task
            </button>
          )}

        </div>

      ) : (

        <div className="tasks-list">

          {filteredTasks.map((task) => (

            <div
              className={`task-row ${
                task.completed
                  ? "completed"
                  : ""
              }`}
              key={task._id}
            >

              {/* Checkbox */}

              <button
                className={`task-check ${
                  task.completed
                    ? "checked"
                    : ""
                }`}
                onClick={() =>
                  toggleTask(task)
                }
              >
                {task.completed
                  ? "✓"
                  : ""}
              </button>

              {/* Main content */}

              <div className="task-row-content">

                <div className="task-row-top">

                  <h2>
                    {task.title}
                  </h2>

                  <span
                    className={`priority-badge ${getPriorityClass(
                      task.priority
                    )}`}
                  >
                    {task.priority ||
                      "Medium"}
                  </span>

                </div>

                {task.description && (
                  <p>
                    {task.description}
                  </p>
                )}

                <div className="task-meta">

                  <span>
                    📚{" "}
                    {getSubjectName(task)}
                  </span>

                  <span>
                    🕐{" "}
                    {formatDueDate(
                      task.dueDate
                    )}
                  </span>

                </div>

              </div>

              {/* Actions */}

              <div className="task-actions">

                <button
                  onClick={() =>
                    openEditModal(task)
                  }
                  title="Edit task"
                >
                  ✎
                </button>

                <button
                  onClick={() =>
                    handleDelete(task)
                  }
                  title="Delete task"
                >
                  ×
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* =====================================
          MODAL
      ===================================== */}

      {showModal && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="task-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Add Task"}
                </h2>

                <p>
                  {editingTask
                    ? "Update your task details."
                    : "Create a new task to stay organized."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="task-form"
              onSubmit={handleSubmit}
            >

              {/* Title */}

              <div className="form-group">

                <label htmlFor="task-title">
                  Task Title
                </label>

                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Complete Graph Algorithms"
                  autoFocus
                />

              </div>

              {/* Description */}

              <div className="form-group">

                <label htmlFor="task-description">
                  Description
                </label>

                <textarea
                  id="task-description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Add some details..."
                  rows="3"
                />

              </div>

              {/* Subject */}

              <div className="form-group">

                <label htmlFor="task-subject">
                  Subject
                </label>

                <select
                  id="task-subject"
                  value={subject}
                  onChange={(e) =>
                    setSubject(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select a subject
                  </option>

                  {subjects.map(
                    (item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Priority */}

              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="task-priority">
                    Priority
                  </label>

                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value
                      )
                    }
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>
                  </select>

                </div>

                {/* Due date */}

                <div className="form-group">

                  <label htmlFor="task-due-date">
                    Due Date
                  </label>

                  <input
                    id="task-due-date"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Tasks;