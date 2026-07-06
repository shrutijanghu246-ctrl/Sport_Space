import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, Plus, Trash2, Search, X } from "lucide-react";
import styles from "./Exercises.module.css";

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    beginner: { bg: "#f0fdf4", color: "#16a34a" },
    intermediate: { bg: "#fef3c7", color: "#d97706" },
    advanced: { bg: "#fef2f2", color: "#ef4444" },
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>
          <Dumbbell size={24} color="#f59e0b" />
          Exercise Recommendations
        </h2>
        {isPrivileged && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${styles.addBtn} ${showForm ? styles.cancelBtn : ""}`}
          >
            {showForm ? (
              <>
                <X size={16} /> Cancel
              </>
            ) : (
              <>
                <Plus size={16} /> Add Exercise
              </>
            )}
          </button>
        )}
      </div>

      <div className={styles.filterRow}>
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Filter by sport..."
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className={styles.filterInput}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {showForm && isPrivileged && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>
            <Plus size={18} color="#f59e0b" /> Add Exercise
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              name="name"
              placeholder="Exercise name (e.g. Box Jumps)"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <select
              name="sport"
              value={form.sport}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Sport</option>
              <option value="Athletics">Athletics</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Basketball">Basketball</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Badminton">Badminton</option>
              <option value="Table Tennis">Table Tennis</option>
              <option value="Chess">Chess</option>
              <option value="Swimming">Swimming</option>
              <option value="Kabaddi">Kabaddi</option>
              <option value="Kho Kho">Kho Kho</option>
              <option value="Tennis">Tennis</option>
              <option value="Hockey">Hockey</option>
              <option value="Wrestling">Wrestling</option>
              <option value="Weightlifting">Weightlifting</option>
            </select>
            <textarea
              name="description"
              placeholder="Description — why this exercise helps"
              value={form.description}
              onChange={handleChange}
              className={styles.input}
              style={{ minHeight: "80px" }}
              required
            />
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className={styles.row}>
              <input
                name="sets"
                type="number"
                placeholder="Sets"
                value={form.sets}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="reps"
                type="number"
                placeholder="Reps"
                value={form.reps}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="duration"
                type="number"
                placeholder="Duration (mins)"
                value={form.duration}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <input
              name="musclesTargeted"
              placeholder="Muscles targeted (comma separated)"
              value={form.musclesTargeted}
              onChange={handleChange}
              className={styles.input}
            />
            <textarea
              name="tips"
              placeholder="Coaching tips / form notes"
              value={form.tips}
              onChange={handleChange}
              className={styles.input}
              style={{ minHeight: "60px" }}
            />
            <button type="submit" className={styles.submitBtn}>
              <Plus size={16} /> Add Exercise
            </button>
          </form>
        </div>
      )}

      <div className={styles.exerciseList}>
        {exercises.length === 0 ? (
          <p className={styles.empty}>
            {isPrivileged
              ? "No exercises yet — add some for your team!"
              : "No exercises yet — check back later!"}
          </p>
        ) : (
          exercises.map((ex) => (
            <div key={ex._id} className={styles.exerciseCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.exerciseName}>{ex.name}</h3>
                  <div className={styles.tags}>
                    <span className={styles.sportTag}>{ex.sport}</span>
                    <span
                      className={styles.difficultyTag}
                      style={{
                        backgroundColor: difficultyColor[ex.difficulty]?.bg,
                        color: difficultyColor[ex.difficulty]?.color,
                      }}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                </div>
                {isPrivileged && (
                  <button
                    onClick={() => handleDelete(ex._id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <p className={styles.description}>{ex.description}</p>

              {(ex.sets || ex.reps || ex.duration) && (
                <div className={styles.statsRow}>
                  {ex.sets && (
                    <span className={styles.stat}>{ex.sets} sets</span>
                  )}
                  {ex.reps && (
                    <span className={styles.stat}>{ex.reps} reps</span>
                  )}
                  {ex.duration && (
                    <span className={styles.stat}>{ex.duration} mins</span>
                  )}
                </div>
              )}

              {ex.musclesTargeted?.length > 0 && (
                <p className={styles.muscles}>
                  <strong>Targets:</strong> {ex.musclesTargeted.join(", ")}
                </p>
              )}

              {ex.tips && (
                <p className={styles.tips}>
                  <strong>Coach tip:</strong> {ex.tips}
                </p>
              )}

              <p className={styles.addedBy}>
                Added by {ex.addedBy?.name} ({ex.addedBy?.role})
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Exercises;
