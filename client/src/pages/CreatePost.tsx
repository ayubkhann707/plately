import { useState } from "react";
import api from "../api/client";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [servings, setServings] = useState(1);
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: 0, unit: "" },
  ]);
  const [steps, setSteps] = useState([""]);

  async function handleSubmit() {
    try {
      await api.post("/posts", {
        title,
        videoUrl,
        servings,
        timeMinutes,
        ingredients,
        steps,
      });

      alert("Post created!");

      setTitle("");
      setVideoUrl("");
      setServings(1);
      setTimeMinutes(10);
      setIngredients([{ name: "", quantity: 0, unit: "" }]);
      setSteps([""]);
    } catch {
      alert("Error creating post");
    }
  }

  return (
    <div>
      <h1>Create Post</h1>

      <div>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>

      <div>
        <input
          type="number"
          placeholder="Servings"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
        />
      </div>

      <div>
        <input
          type="number"
          placeholder="Time (minutes)"
          value={timeMinutes}
          onChange={(e) => setTimeMinutes(Number(e.target.value))}
        />
      </div>

      <h3>Ingredients</h3>

      {ingredients.map((ing, index) => (
        <div key={index}>
          <input
            placeholder="Name"
            value={ing.name}
            onChange={(e) => {
              const newIngredients = [...ingredients];
              newIngredients[index].name = e.target.value;
              setIngredients(newIngredients);
            }}
          />

          <input
            type="number"
            placeholder="Quantity"
            value={ing.quantity}
            onChange={(e) => {
              const newIngredients = [...ingredients];
              newIngredients[index].quantity = Number(e.target.value);
              setIngredients(newIngredients);
            }}
          />

          <input
            placeholder="Unit"
            value={ing.unit}
            onChange={(e) => {
              const newIngredients = [...ingredients];
              newIngredients[index].unit = e.target.value;
              setIngredients(newIngredients);
            }}
          />

          <button
            onClick={() => {
              const newIngredients = ingredients.filter(
                (_, i) => i !== index
              );
              setIngredients(newIngredients);
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={() =>
          setIngredients([
            ...ingredients,
            { name: "", quantity: 0, unit: "" },
          ])
        }
      >
        Add Ingredient
      </button>

      <h3>Steps</h3>

      {steps.map((step, index) => (
        <div key={index}>
          <input
            placeholder={`Step ${index + 1}`}
            value={step}
            onChange={(e) => {
              const newSteps = [...steps];
              newSteps[index] = e.target.value;
              setSteps(newSteps);
            }}
          />

          <button
            onClick={() => {
              const newSteps = steps.filter((_, i) => i !== index);
              setSteps(newSteps);
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={() => setSteps([...steps, ""])}
      >
        Add Step
      </button>

      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}
