const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse-fork');

const app = express();
const PORT = 5000;

// Enable CORS for React frontend cross-origin requests
app.use(cors());
app.use(express.json());

// Configure Multer to hold files in memory buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Mock AI scoring engine (Keyword & Length Matching)
const analyzeResumeText = (text) => {
  const lowercaseText = text.toLowerCase();
  
  const targetKeywords = [
    'react', 'javascript', 'node', 'express', 'python', 
    'git', 'ci/cd', 'aws', 'docker', 'sql', 'nosql',
    'agile', 'typescript', 'rest api', 'developer'
  ];

  let matchedKeywords = 0;
  targetKeywords.forEach(keyword => {
    if (lowercaseText.includes(keyword)) {
      matchedKeywords++;
    }
  });

  const keywordScore = Math.round((matchedKeywords / targetKeywords.length) * 100);
  let finalScore = Math.min(Math.max(keywordScore, 40), 98); // Bounds between 40 and 98

  if (text.trim().length < 200) {
    finalScore = 25; // Penalty for empty/unreadable resumes
  }

  return finalScore;
};

// Route handler
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else {
      // Fallback fallback string reading for docx buffers
      extractedText = req.file.buffer.toString('utf-8');
    }

    const aiScore = analyzeResumeText(extractedText);

    // Artificial 2-second delay to show off your nice frontend loading spinner
    setTimeout(() => {
      res.json({ 
        success: true,
        score: aiScore,
        message: "Resume analyzed successfully."
      });
    }, 2000);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Internal server error processing the file.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Resume Analyzer backend running on http://localhost:${PORT}`);
});