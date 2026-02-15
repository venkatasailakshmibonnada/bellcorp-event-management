import { useState } from "react";
import API from "../services/api";

function Login() {

  const [form, setForm] = useState({
    email:"",
    password:""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      alert("Login Success");
    } catch {
      alert("Login Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        onChange={(e)=>setForm({...form,email:e.target.value})}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setForm({...form,password:e.target.value})}
      />

      <button>Login</button>
    </form>
  );
}

export default Login;
