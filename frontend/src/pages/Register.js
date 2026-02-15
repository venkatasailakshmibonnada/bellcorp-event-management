import { useState } from "react";
import API from "../services/api";

function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form data being sent:", form);

    try {
      const response = await API.post("/auth/register", form);
      console.log("Success response:", response.data);
      alert("Registered Successfully");
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Status code:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Error Registering";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({...form, name: e.target.value})}
      />

      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
      />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({...form, password: e.target.value})}
      />

      <button type="submit">Register</button>
    </form>
  );
}

export default Register;