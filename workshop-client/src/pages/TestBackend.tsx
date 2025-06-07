import React, { useEffect, useState } from "react";

const TestBackend = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/test") // Ensure this matches your backend port
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessage(data.message);
        else setMessage("Connected but failed to fetch message");
      })
      .catch((err) => {
        console.error(err);
        setMessage("Failed to connect to backend ❌");
      });
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Backend Test</h1>
      <p className="mt-4 text-lg">{message}</p>
    </div>
  );
};

export default TestBackend;
