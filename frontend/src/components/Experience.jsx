import { useState } from "react";

function Experience() {
  const [skills, setSkills] = useState(
    JSON.parse(localStorage.getItem("skills")) || []
  );

  const [input, setInput] = useState("");

  const addSkill = () => {
    const updated = [...skills, input];
    setSkills(updated);
    localStorage.setItem("skills", JSON.stringify(updated));
    setInput("");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-4">

      <h2 className="font-semibold mb-2">Skills</h2>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add skill"
          className="border p-2 rounded w-full"
        />

        <button
          onClick={addSkill}
          className="bg-[#0a66c2] text-white px-3 rounded"
        >
          Add
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="bg-gray-200 px-3 py-1 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

    </div>
  );
}

export default Experience;