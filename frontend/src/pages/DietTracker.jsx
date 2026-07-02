import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function DietTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState([
    { name: "", calories: "", protein: "", carbs: "", fats: "" },
  ]);
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [activeMealIndex, setActiveMealIndex] = useState(null);

  const [notes, setNotes] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await axiosInstance.get("/diet/my");
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const searchFood = async (query, index) => {
    if (!query || query.length < 2) {
      setFoodSuggestions([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/foods/search?query=${query}`);
      setFoodSuggestions(res.data.foods);
      setActiveMealIndex(index);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMealChange = (index, field, value) => {
    const updated = [...meals];
    updated[index][field] = value;
    setMeals(updated);

    if (field === "name") {
      {
        searchFood(value, index);
      }
    }
  };

  const selectFood = (food, index) => {
    const updated = [...meals];
    updated[index] = {
      ...updated[index],
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
    };
    setMeals(updated);
    setFoodSuggestions([]);
    setActiveMealIndex(null);
  };

  const addMealRow = () => {
    setMeals([
      ...meals,
      { name: "", calories: "", protein: "", carbs: "", fats: "" },
    ]);
  };

  const removeMealRow = (index) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/diet", { date, meals, notes });
      setShowForm(false);
      setMeals([{ name: "", calories: "", protein: "", carbs: "", fats: "" }]);
      setNotes("");
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log?")) return;
    try {
      await axiosInstance.delete(`/diet/${id}`);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>🥗 Diet Tracker</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? "Cancel" : "+ Log Today's Diet"}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <label style={styles.label}>Meals</label>
            {meals.map((meal, index) => (
              <div key={index} style={styles.mealRow}>
                <div style={{ flex: 2, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Meal name"
                    value={meal.name}
                    onChange={(e) =>
                      handleMealChange(index, "name", e.target.value)
                    }
                    style={{ ...styles.input, width: "100%" }}
                    required
                  />
                  {/* Food suggestions dropdown */}
                  {activeMealIndex === index && foodSuggestions.length > 0 && (
                    <div style={styles.suggestions}>
                      {foodSuggestions.map((food) => (
                        <div
                          key={food._id}
                          onClick={() => selectFood(food, index)}
                          style={styles.suggestionItem}
                        >
                          <span>{food.name}</span>
                          <span style={styles.suggestionMeta}>
                            {food.calories} kcal | P:{food.protein}g C:
                            {food.carbs}g F:{food.fats}g
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="Calories"
                  value={meal.calories}
                  onChange={(e) =>
                    handleMealChange(index, "calories", e.target.value)
                  }
                  style={{ ...styles.input, flex: 1 }}
                  required
                />
                <input
                  type="number"
                  placeholder="Protein(g)"
                  value={meal.protein}
                  onChange={(e) =>
                    handleMealChange(index, "protein", e.target.value)
                  }
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Carbs(g)"
                  value={meal.carbs}
                  onChange={(e) =>
                    handleMealChange(index, "carbs", e.target.value)
                  }
                  style={{ ...styles.input, flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Fats(g)"
                  value={meal.fats}
                  onChange={(e) =>
                    handleMealChange(index, "fats", e.target.value)
                  }
                  style={{ ...styles.input, flex: 1 }}
                />
                {meals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMealRow(index)}
                    style={styles.removeBtn}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMealRow}
              style={styles.addMealBtn}
            >
              + Add Meal
            </button>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                placeholder="How did you feel today? Any dietary goals?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...styles.input, minHeight: "80px" }}
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              Save Diet Log 🥗
            </button>
          </form>
        </div>
      )}

      {/* Logs List */}
      <div style={styles.logsList}>
        {logs.length === 0 ? (
          <p style={styles.empty}>No diet logs yet — start tracking! 🥦</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} style={styles.logCard}>
              <div style={styles.logHeader}>
                <div>
                  <p style={styles.logDate}>
                    📅 {new Date(log.date).toLocaleDateString()}
                  </p>
                  <p style={styles.totalCalories}>
                    🔥 Total: {log.totalCalories} kcal
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(log._id)}
                  style={styles.deleteBtn}
                >
                  🗑️
                </button>
              </div>

              <div style={styles.mealsTable}>
                <div style={styles.tableHeader}>
                  <span>Meal</span>
                  <span>Cal</span>
                  <span>Protein</span>
                  <span>Carbs</span>
                  <span>Fats</span>
                </div>
                {log.meals.map((meal, i) => (
                  <div key={i} style={styles.tableRow}>
                    <span>{meal.name}</span>
                    <span>{meal.calories}</span>
                    <span>{meal.protein}g</span>
                    <span>{meal.carbs}g</span>
                    <span>{meal.fats}g</span>
                  </div>
                ))}
              </div>

              {log.notes && <p style={styles.logNotes}>📝 {log.notes}</p>}
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
    marginBottom: "1.5rem",
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
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  input: {
    padding: "0.6rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    width: "100%",
  },
  mealRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    alignItems: "center",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "1rem",
    flexShrink: 0,
  },
  addMealBtn: {
    background: "none",
    border: "1px dashed #2563eb",
    color: "#2563eb",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "1rem",
    width: "100%",
  },
  submitBtn: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  logsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  logCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.25rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  logDate: {
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  totalCalories: {
    color: "#2563eb",
    fontWeight: "600",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  mealsTable: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "#666",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #eee",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
    fontSize: "0.9rem",
    padding: "0.35rem 0",
    borderBottom: "1px solid #f5f5f5",
  },
  logNotes: {
    marginTop: "0.75rem",
    color: "#666",
    fontSize: "0.9rem",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    padding: "2rem",
  },
  suggestions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 10,
    maxHeight: "200px",
    overflowY: "auto",
  },
  suggestionItem: {
    padding: "0.6rem 0.75rem",
    cursor: "pointer",
    borderBottom: "1px solid #f5f5f5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionMeta: {
    fontSize: "0.75rem",
    color: "#999",
  },
};

export default DietTracker;
