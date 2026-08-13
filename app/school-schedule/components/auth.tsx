import React, { useState } from "react";
import { LogIn } from "lucide-react";
import type { ParentProfile, StudentProfile } from "../types";
import { SEED_TEACHER_ACCOUNTS } from "../schedule-data";

export function TeacherLogin({ onLogin }: { onLogin: (value: string) => void }) {
  const [username, setUsername] = useState("alvarez");
  const [password, setPassword] = useState("teach2026");
  const [error, setError] = useState("");

  function submit() {
    const match = SEED_TEACHER_ACCOUNTS.find((t) => t.username === username.trim() && t.password === password);
    if (!match) return setError("Incorrect username or password.");
    setError("");
    onLogin(match.id);
  }

  return (
    <div className="sa-login">
      <div className="sa-login-card">
        <span className="sa-eyebrow">Teacher login</span>
        <h1>Staff sign-in</h1>
        <p>Sign in with your Harbor View staff username and password.</p>
        <label className="sa-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error && <p className="sa-error">{error}</p>}
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <LogIn size={16} /> Log in
        </button>
      </div>
    </div>
  );
}

export function StudentLogin({ students, onLogin }: { students: StudentProfile[]; onLogin: (id: string) => void }) {
  const [username, setUsername] = useState("leo.kim");
  const [password, setPassword] = useState("leo2026");
  const [error, setError] = useState("");

  function submit() {
    const match = students.find(
      (s: { username: string; password: string }) => s.username === username.trim() && s.password === password,
    );
    if (!match) return setError("Incorrect username or password.");
    setError("");
    onLogin(match.id);
  }

  return (
    <div className="sa-login">
      <div className="sa-login-card">
        <span className="sa-eyebrow">Student login</span>
        <h1>Welcome back</h1>
        <p>Sign in with the username and password your teacher gave you.</p>
        <label className="sa-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error && <p className="sa-error">{error}</p>}
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <LogIn size={16} /> Log in
        </button>
      </div>
    </div>
  );
}

export function ParentLogin({ parents, onLogin }: { parents: ParentProfile[]; onLogin: (id: string) => void }) {
  const [username, setUsername] = useState("dana.kim");
  const [password, setPassword] = useState("parent2026");
  const [error, setError] = useState("");

  function submit() {
    const match = parents.find((p: ParentProfile) => p.username === username.trim() && p.password === password);
    if (!match) return setError("Incorrect username or password.");
    setError("");
    onLogin(match.id);
  }

  return (
    <div className="sa-login">
      <div className="sa-login-card">
        <span className="sa-eyebrow">Parent login</span>
        <h1>Welcome back</h1>
        <p>Sign in with the username and password the school gave you.</p>
        <label className="sa-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        <label className="sa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error && <p className="sa-error">{error}</p>}
        <button className="sa-btn sa-btn--primary" type="button" onClick={submit}>
          <LogIn size={16} /> Log in
        </button>
      </div>
    </div>
  );
}
