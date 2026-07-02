import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function Exercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterSport, setFilterSport] = useState("");
  const [form, setForm] = useState({
    name: "",
    sport: user?.sport || "",
    description: "",
    difficulty: "intermediate",
    sets: "",
    reps: "",
    duration: "",
    musclesTargeted: "",
    tips: "",
  });

  const isPrivileged = ["captain", "coach", "admin"].includes(user?.role);

  const fetchExercises = async () => {
    try {
      const query = filterSport ? `?sport=${filterSport}` : "";
      const res = await axiosInstance.get(`/exercises${query}`);
      setExercises(res.data.exercises);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [filterSport]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        musclesTargeted: form.musclesTargeted
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
      };
      await axiosInstance.post("/exercises", payload);
      setShowForm(false);
      setForm({
        name: "",
        sport: user?.sport || "",
        description: "",
        difficulty: "intermediate",
        sets: "",
        reps: "",
        duration: "",
        musclesTargeted: "",
        tips: "",
      });
      fetchExercises();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exercise?")) return;
    try {
      await axiosInstance.delete(`/exercises/${id}`);
      setExercises((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const difficultyColor = {
    beginner: "#22c55e",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>💪 Exercise Recommendations</h2>
        {isPrivileged && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? "Cancel" : "+ Add Exercise"}
          </button>
        )}
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        <input
          type="text"
          placeholder="Filter by sport (e.g. Athletics)"
          value={filterSport}
          onChange={(e) => setFilterSport(e.target.value)}
          style={styles.filterInput}
        />
      </div>

      {/* Add Form */}
      {showForm && isPrivileged && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Add Exercise</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              name="name"
              placeholder="Exercise name (e.g. Box Jumps)"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="sport"
              placeholder="Sport (e.g. Athletics)"
              value={form.sport}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <textarea
              name="description"
              placeholder="Description — why this exercise helps, theory behind it"
              value={form.description}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: "80px" }}
              required
            />
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div style={styles.row}>
              <input
                name="sets"
                type="number"
                placeholder="Sets"
                value={form.sets}
                onChange={handleChange}
                style={{ ...styles.input, flex: 1 }}
              />
              <input
                name="reps"
                type="number"
                placeholder="Reps"
                value={form.reps}
                onChange={handleChange}
                style={{ ...styles.input, flex: 1 }}
              />
              <input
                name="duration"
                type="number"
                placeholder="Duration (mins)"
                value={form.duration}
                onChange={handleChange}
                style={{ ...styles.input, flex: 1 }}
              />
            </div>
            <input
              name="musclesTargeted"
              placeholder="Muscles targeted (comma separated: hamstrings, core)"
              value={form.musclesTargeted}
              onChange={handleChange}
              style={styles.input}
            />
            <textarea
              name="tips"
              placeholder="Coaching tips / form notes"
              value={form.tips}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: "60px" }}
            />
            <button type="submit" style={styles.submitBtn}>
              Add Exercise 💪
            </button>
          </form>
        </div>
      )}

      {/* Exercise List */}
      <div style={styles.exerciseList}>
        {exercises.length === 0 ? (
          <p style={styles.empty}>
            No exercises yet —{" "}
            {isPrivileged ? "add some for your team!" : "check back later!"}
          </p>
        ) : (
          exercises.map((ex) => (
            <div key={ex._id} style={styles.exerciseCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.exerciseName}>{ex.name}</h3>
                  <div style={styles.tags}>
                    <span style={styles.sportTag}>🏃 {ex.sport}</span>
                    <span
                      style={{
                        ...styles.difficultyTag,
                        backgroundColor: difficultyColor[ex.difficulty] + "20",
                        color: difficultyColor[ex.difficulty],
                      }}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                </div>
                {isPrivileged && (
                  <button
                    onClick={() => handleDelete(ex._id)}
                    style={styles.deleteBtn}
                  >
                    🗑️
                  </button>
                )}
              </div>

              <p style={styles.description}>{ex.description}</p>

              {(ex.sets || ex.reps || ex.duration) && (
                <div style={styles.statsRow}>
                  {ex.sets && (
                    <span style={styles.stat}>📊 {ex.sets} sets</span>
                  )}
                  {ex.reps && (
                    <span style={styles.stat}>🔁 {ex.reps} reps</span>
                  )}
                  {ex.duration && (
                    <span style={styles.stat}>⏱ {ex.duration} mins</span>
                  )}
                </div>
              )}

              {ex.musclesTargeted?.length > 0 && (
                <div style={styles.muscles}>
                  💪 <strong>Targets:</strong> {ex.musclesTargeted.join(", ")}
                </div>
              )}

              {ex.tips && (
                <div style={styles.tips}>
                  💡 <strong>Coach tip:</strong> {ex.tips}
                </div>
              )}

              <p style={styles.addedBy}>
                Added by {ex.addedBy?.name} ({ex.addedBy?.role})
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1.5rem 1rem",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  heading: {
    fontSize: "1.5rem",
  },
  addBtn: {
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
  filterRow: {
    marginBottom: "1.5rem",
  },
  filterInput: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    width: "100%",
    fontSize: "0.95rem",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
  },
  formTitle: {
    marginBottom: "1rem",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "0.65rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    width: "100%",
    fontFamily: "inherit",
  },
  row: {
    display: "flex",
    gap: "0.75rem",
  },
  submitBtn: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  exerciseList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  exerciseCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
  },
  exerciseName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "0.4rem",
  },
  tags: {
    display: "flex",
    gap: "0.5rem",
  },
  sportTag: {
    fontSize: "0.8rem",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
  },
  difficultyTag: {
    fontSize: "0.8rem",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    textTransform: "capitalize",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  description: {
    color: "#444",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    marginBottom: "0.75rem",
  },
  statsRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  stat: {
    fontSize: "0.9rem",
    color: "#555",
  },
  muscles: {
    fontSize: "0.9rem",
    color: "#555",
    marginBottom: "0.5rem",
  },
  tips: {
    fontSize: "0.9rem",
    color: "#555",
    backgroundColor: "#fffbeb",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
  },
  addedBy: {
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "0.5rem",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "2rem",
  },
};

export default Exercises;
