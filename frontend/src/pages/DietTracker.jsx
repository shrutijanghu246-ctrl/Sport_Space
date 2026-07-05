import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { Salad, Plus, Trash2, Flame, Calendar, X } from "lucide-react";
import styles from "./DietTracker.module.css";

function DietTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState([
    { name: "", calories: "", protein: "", carbs: "", fats: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [activeMealIndex, setActiveMealIndex] = useState(null);

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

  const handleMealChange = (index, field, value) => {
    const updated = [...meals];
    updated[index][field] = value;
    setMeals(updated);
    if (field === "name") searchFood(value, index);
  };

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

  const addMealRow = () =>
    setMeals([
      ...meals,
      { name: "", calories: "", protein: "", carbs: "", fats: "" },
    ]);
  const removeMealRow = (index) =>
    setMeals(meals.filter((_, i) => i !== index));

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
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>
          <Salad size={24} color="#f59e0b" />
          Diet Tracker
        </h2>
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
              <Plus size={16} /> Log Today's Diet
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <label className={styles.label}>Meals</label>
            {meals.map((meal, index) => (
              <div key={index} className={styles.mealRow}>
                <div style={{ flex: 2, position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Meal name"
                    value={meal.name}
                    onChange={(e) =>
                      handleMealChange(index, "name", e.target.value)
                    }
                    className={styles.input}
                    required
                  />
                  {activeMealIndex === index && foodSuggestions.length > 0 && (
                    <div className={styles.suggestions}>
                      {foodSuggestions.map((food) => (
                        <div
                          key={food._id}
                          onClick={() => selectFood(food, index)}
                          className={styles.suggestionItem}
                        >
                          <span>{food.name}</span>
                          <span className={styles.suggestionMeta}>
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
                  className={styles.input}
                  style={{ flex: 1 }}
                  required
                />
                <input
                  type="number"
                  placeholder="Protein(g)"
                  value={meal.protein}
                  onChange={(e) =>
                    handleMealChange(index, "protein", e.target.value)
                  }
                  className={styles.input}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Carbs(g)"
                  value={meal.carbs}
                  onChange={(e) =>
                    handleMealChange(index, "carbs", e.target.value)
                  }
                  className={styles.input}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Fats(g)"
                  value={meal.fats}
                  onChange={(e) =>
                    handleMealChange(index, "fats", e.target.value)
                  }
                  className={styles.input}
                  style={{ flex: 1 }}
                />
                {meals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMealRow(index)}
                    className={styles.removeBtn}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMealRow}
              className={styles.addMealBtn}
            >
              <Plus size={16} /> Add another meal
            </button>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <textarea
                placeholder="How did you feel today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.input}
                style={{ minHeight: "80px" }}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Salad size={16} /> Save Diet Log
            </button>
          </form>
        </div>
      )}

      <div className={styles.logsList}>
        {logs.length === 0 ? (
          <p className={styles.empty}>No diet logs yet — start tracking!</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className={styles.logCard}>
              <div className={styles.logHeader}>
                <div>
                  <p className={styles.logDate}>
                    <Calendar size={15} color="#6b7280" />
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                  <p className={styles.totalCalories}>
                    <Flame size={15} />
                    {log.totalCalories} kcal total
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(log._id)}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.mealsTable}>
                <div className={styles.tableHeader}>
                  <span>Meal</span>
                  <span>Cal</span>
                  <span>Protein</span>
                  <span>Carbs</span>
                  <span>Fats</span>
                </div>
                {log.meals.map((meal, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span>{meal.name}</span>
                    <span>{meal.calories}</span>
                    <span>{meal.protein}g</span>
                    <span>{meal.carbs}g</span>
                    <span>{meal.fats}g</span>
                  </div>
                ))}
              </div>

              {log.notes && <p className={styles.logNotes}>{log.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DietTracker;
