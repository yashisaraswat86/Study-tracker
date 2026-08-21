import { useEffect, useState } from "react";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../services/subjectService";

const SUBJECT_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingSubject, setEditingSubject] =
    useState(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState(
    SUBJECT_COLORS[0]
  );

  const [saving, setSaving] = useState(false);

  // ==========================================
  // Fetch subjects
  // ==========================================

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSubjects();

      if (data.success) {
        setSubjects(data.subjects || []);
      } else {
        throw new Error(
          data.message || "Failed to load subjects"
        );
      }
    } catch (err) {
      console.error("Load subjects error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load subjects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // ==========================================
  // Open Add Modal
  // ==========================================

  const openAddModal = () => {
    setEditingSubject(null);
    setName("");
    setColor(SUBJECT_COLORS[0]);
    setShowModal(true);
    setError("");
  };

  // ==========================================
  // Open Edit Modal
  // ==========================================

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setColor(subject.color);
    setShowModal(true);
    setError("");
  };

  // ==========================================
  // Close Modal
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSubject(null);
    setName("");
    setColor(SUBJECT_COLORS[0]);
  };

  // ==========================================
  // Save Subject
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Subject name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingSubject) {
        const data = await updateSubject(
          editingSubject._id,
          {
            name: trimmedName,
            color,
          }
        );

        if (!data.success) {
          throw new Error(
            data.message || "Failed to update subject"
          );
        }
      } else {
        const data = await createSubject({
          name: trimmedName,
          color,
        });

        if (!data.success) {
          throw new Error(
            data.message || "Failed to create subject"
          );
        }
      }

      closeModal();

      await loadSubjects();
    } catch (err) {
      console.error("Save subject error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save subject"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Delete Subject
  // ==========================================

  const handleDelete = async (subject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const data = await deleteSubject(
        subject._id
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to delete subject"
        );
      }

      setSubjects((currentSubjects) =>
        currentSubjects.filter(
          (item) => item._id !== subject._id
        )
      );
    } catch (err) {
      console.error("Delete subject error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete subject"
      );
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="subjects-page">
        <div className="page-loading">
          Loading subjects...
        </div>
      </div>
    );
  }

  return (
    <div className="subjects-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <p className="page-eyebrow">
            ORGANIZE YOUR LEARNING
          </p>

          <h1>Subjects</h1>

          <p className="page-description">
            Manage the subjects you're studying.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Subject
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
          SUBJECT COUNT
      ===================================== */}

      <div className="subjects-summary">
        <span>
          {subjects.length}{" "}
          {subjects.length === 1
            ? "subject"
            : "subjects"}
        </span>
      </div>

      {/* =====================================
          SUBJECTS
      ===================================== */}

      {subjects.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            📚
          </div>

          <h2>
            No subjects yet
          </h2>

          <p>
            Create your first subject to start
            organizing your studies.
          </p>

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            <span>+</span>
            Add Your First Subject
          </button>

        </div>

      ) : (

        <div className="subjects-grid">

          {subjects.map((subject) => (

            <div
              className="subject-card"
              key={subject._id}
            >

              {/* Color indicator */}

              <div
                className="subject-color"
                style={{
                  backgroundColor:
                    subject.color,
                }}
              />

              <div className="subject-card-content">

                <div className="subject-card-header">

                  <div
                    className="subject-icon"
                    style={{
                      backgroundColor:
                        `${subject.color}18`,
                      color: subject.color,
                    }}
                  >
                    {subject.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="subject-menu">
                    <button
                      onClick={() =>
                        openEditModal(subject)
                      }
                      title="Edit subject"
                    >
                      ✎
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(subject)
                      }
                      title="Delete subject"
                    >
                      ×
                    </button>
                  </div>

                </div>

                <h2>
                  {subject.name}
                </h2>

                <p className="subject-created">
                  Created{" "}
                  {new Date(
                    subject.createdAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>

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

          <div className="subject-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingSubject
                    ? "Edit Subject"
                    : "Add Subject"}
                </h2>

                <p>
                  {editingSubject
                    ? "Update your subject details."
                    : "Create a new subject for your studies."}
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
              onSubmit={handleSubmit}
              className="subject-form"
            >

              {/* Name */}

              <div className="form-group">

                <label htmlFor="subject-name">
                  Subject Name
                </label>

                <input
                  id="subject-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Data Structures"
                  autoFocus
                />

              </div>

              {/* Color */}

              <div className="form-group">

                <label>
                  Subject Color
                </label>

                <div className="color-options">

                  {SUBJECT_COLORS.map(
                    (subjectColor) => (

                      <button
                        key={subjectColor}
                        type="button"
                        className={`color-option ${
                          color === subjectColor
                            ? "selected"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            subjectColor,
                        }}
                        onClick={() =>
                          setColor(
                            subjectColor
                          )
                        }
                      />

                    )
                  )}

                </div>

              </div>

              {/* Buttons */}

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
                    : editingSubject
                    ? "Save Changes"
                    : "Create Subject"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Subjects;