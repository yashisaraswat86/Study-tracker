import { useEffect, useState } from "react";
import api from "../services/api";

import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/scheduleService";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
  });

  // =========================
  // Load ALL schedules
  // =========================
  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSchedules();

      if (data.success) {
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Schedule API Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load schedules"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Load subjects
  // =========================
  const loadSubjects = async () => {
    try {
      const response = await api.get("/subjects");

      const data = response.data;

      setSubjects(
        data.subjects ||
          data.data?.subjects ||
          data.data ||
          []
      );
    } catch (err) {
      console.error("Subject API Error:", err);
    }
  };

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    loadSchedules();
    loadSubjects();
  }, []);

  // =========================
  // Form change
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Open Add Modal
  // =========================
  const openAddModal = () => {
    setEditingSchedule(null);

    setForm({
      title: "",
      description: "",
      subject: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // Open Edit Modal
  // =========================
  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);

    setForm({
      title: schedule.title || "",
      description: schedule.description || "",
      subject:
        schedule.subject?._id ||
        schedule.subject ||
        "",
      date: schedule.date
        ? schedule.date.substring(0, 10)
        : new Date().toISOString().split("T")[0],
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.subject ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      setError(
        "Title, subject, date, start time and end time are required."
      );

      return;
    }

    if (form.startTime >= form.endTime) {
      setError(
        "End time must be after start time."
      );

      return;
    }

    try {
      setError("");

      if (editingSchedule) {
        await updateSchedule(
          editingSchedule._id,
          form
        );
      } else {
        await createSchedule(form);
      }

      setShowModal(false);
      setEditingSchedule(null);

      await loadSchedules();
    } catch (err) {
      console.error("Save Schedule Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save schedule"
      );
    }
  };

  // =========================
  // Delete
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSchedule(id);

      await loadSchedules();
    } catch (err) {
      console.error("Delete Schedule Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete schedule"
      );
    }
  };

  // =========================
  // Date formatting
  // =========================
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // =========================
  // Format time
  // =========================
  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes)
    );

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================
  // Sort schedules
  // Date first, then time
  // =========================
  const sortedSchedules = [...schedules].sort(
    (a, b) => {
      const dateTimeA = new Date(
        `${a.date.substring(0, 10)}T${a.startTime}`
      );

      const dateTimeB = new Date(
        `${b.date.substring(0, 10)}T${b.startTime}`
      );

      return dateTimeA - dateTimeB;
    }
  );

  // =========================
  // Return
  // =========================
  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            PLAN YOUR DAY
          </p>

          <h1
            style={{
              margin: "8px 0",
              fontSize: "42px",
              color: "#0f172a",
            }}
          >
            Schedule
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "17px",
            }}
          >
            Plan your study sessions and stay
            organized.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "15px 22px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          + Add Schedule
        </button>
      </div>

      {/* ================= DATE / INFO ================= */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "20px 25px",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            color: "#0f172a",
          }}
        >
          All Schedules
        </h2>

        <p
          style={{
            margin: "6px 0 0",
            color: "#64748b",
          }}
        >
          View and manage all your study sessions.
        </p>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#dc2626",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "80px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Loading schedules...
        </div>
      ) : sortedSchedules.length === 0 ? (
        /* ================= EMPTY ================= */
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "16px",
              background: "#f1f5f9",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "30px",
              marginBottom: "20px",
            }}
          >
            ◷
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#0f172a",
            }}
          >
            No schedules yet
          </h2>

          <p
            style={{
              color: "#94a3b8",
              marginBottom: "25px",
            }}
          >
            Create your first study session.
          </p>

          <button
            onClick={openAddModal}
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "9px",
              padding: "13px 20px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Add Your First Schedule
          </button>
        </div>
      ) : (
        /* ================= SCHEDULE LIST ================= */
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "30px",
          }}
        >
          {sortedSchedules.map((schedule, index) => {
            const currentDate =
              schedule.date.substring(0, 10);

            const previousDate =
              index > 0
                ? sortedSchedules[
                    index - 1
                  ].date.substring(0, 10)
                : null;

            const showDate =
              currentDate !== previousDate;

            return (
              <div key={schedule._id}>
                {/* DATE SEPARATOR */}
                {showDate && (
                  <div
                    style={{
                      padding: "15px 10px",
                      marginTop:
                        index === 0 ? "0" : "15px",
                      marginBottom: "5px",
                      color: "#64748b",
                      fontSize: "15px",
                      fontWeight: "700",
                      borderBottom:
                        "1px solid #e2e8f0",
                    }}
                  >
                    {formatDate(schedule.date)}
                  </div>
                )}

                {/* SCHEDULE ITEM */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    padding: "22px 10px",
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  {/* TIME */}
                  <div
                    style={{
                      width: "130px",
                      textAlign: "right",
                      paddingRight: "25px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: "17px",
                        color: "#0f172a",
                      }}
                    >
                      {formatTime(
                        schedule.startTime
                      )}
                    </strong>

                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      {formatTime(
                        schedule.endTime
                      )}
                    </span>
                  </div>

                  {/* LINE */}
                  <div
                    style={{
                      width: "4px",
                      background: "#3b82f6",
                      borderRadius: "4px",
                      marginRight: "25px",
                    }}
                  />

                  {/* CONTENT */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 7px",
                        fontSize: "19px",
                        color: "#0f172a",
                      }}
                    >
                      {schedule.title}
                    </h3>

                    {schedule.description && (
                      <p
                        style={{
                          margin: "0 0 10px",
                          color: "#64748b",
                        }}
                      >
                        {schedule.description}
                      </p>
                    )}

                    <span
                      style={{
                        display: "inline-block",
                        background: "#f1f5f9",
                        color: "#475569",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    >
                      📚{" "}
                      {schedule.subject?.name ||
                        "Subject"}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() =>
                        openEditModal(schedule)
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                      title="Edit"
                    >
                      ✎
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(schedule._id)
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "#94a3b8",
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "700px",
              borderRadius: "18px",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: "25px 30px",
                borderBottom:
                  "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                  }}
                >
                  {editingSchedule
                    ? "Edit Schedule"
                    : "Add Schedule"}
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#94a3b8",
                  }}
                >
                  Plan a study session.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "25px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: "30px",
              }}
            >
              {/* TITLE */}
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Data Structures & Algorithms"
                style={inputStyle}
              />

              {/* DESCRIPTION */}
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What are you planning to study?"
                rows="3"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />

              {/* SUBJECT */}
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                Subject
              </label>

              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">
                  Select Subject
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject._id}
                    value={subject._id}
                  >
                    {subject.name}
                  </option>
                ))}
              </select>

              {/* DATE */}
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={inputStyle}
              />

              {/* TIMES */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                    }}
                  >
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontWeight: "600",
                    }}
                  >
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "30px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  style={{
                    padding: "12px 20px",
                    borderRadius: "9px",
                    border:
                      "1px solid #e2e8f0",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "12px 22px",
                    borderRadius: "9px",
                    border: "none",
                    background: "#111827",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {editingSchedule
                    ? "Save Changes"
                    : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================
// Input style
// =========================
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  marginBottom: "20px",
  border: "1px solid #dbe2ea",
  borderRadius: "9px",
  fontSize: "15px",
  outline: "none",
};

export default Schedule;