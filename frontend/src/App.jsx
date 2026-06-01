import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    setResult(null); // Clear previous score before dynamic reloading

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setResult(response.data.score);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.response?.data?.message || "Error uploading file! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Resume Analyzer</h1>
        <p>Upload your resume to check your ATS compatibility score.</p>
      </header>

      <main className="analyzer-container">
        <div className="upload-section">
          <input 
            type="file" 
            id="fileInput" 
            accept=".pdf,.doc,.docx" 
            onChange={handleFileChange} 
          />
          <button 
            onClick={handleUpload} 
            disabled={isLoading || !file}
          >
            {isLoading ? "Analyzing..." : "Check Score"}
          </button>
        </div>

        {isLoading && (
          <div className="loading-spinner">
            <p>Processing your resume with AI...</p>
          </div>
        )}

        {!isLoading && result !== null && (
          <div className="result-section">
            <h2>Analysis Complete</h2>
            <div className="score-badge">
              <span className="score-number">{result}</span> / 100
            </div>
            <p className="score-text">ATS SCORE</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;