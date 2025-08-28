const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock AI scenario generation
app.post('/api/generate-scenario', (req, res) => {
  const { scenarioType, questionCount } = req.body;
  
  // Simulate API delay
  setTimeout(() => {
    const questions = [];
    
    for (let i = 0; i < questionCount; i++) {
      questions.push(generateMockQuestion(scenarioType, i));
    }
    
    res.json({
      title: getTitleFromType(scenarioType),
      questions,
      generatedAt: new Date().toISOString()
    });
  }, 1500);
});

function getTitleFromType(type) {
  const titles = {
    'hiring': 'Hiring Bias Scenario',
    'microaggressions': 'Microaggressions Scenario',
    'psychological-safety': 'Psychological Safety Scenario',
    'cultural-stereotypes': 'Cultural Stereotypes Scenario',
    'accessibility': 'Accessibility Scenario',
    'gender-bias': 'Gender Bias Scenario',
    'leadership': 'Inclusive Leadership Scenario'
  };
  
  return titles[type] || 'Workplace Scenario';
}

function generateMockQuestion(type, index) {
  // This would be replaced with actual AI integration in production
  const questionTemplates = {
    hiring: [
      {
        question: "You're reviewing resumes and notice a pattern of rejecting candidates from certain schools. What do you do?",
        options: [
          { text: "Evaluate if school bias is affecting decisions and adjust criteria.", feedback: "✅ Correct! Examining selection criteria helps reduce bias.", type: "correct" },
          { text: "Assume the pattern reflects candidate quality.", feedback: "❌ Wrong. This ignores potential bias in evaluation.", type: "incorrect" },
          { text: "Continue with current process but note the pattern.", feedback: "⚠️ Not sufficient — awareness without action maintains bias.", type: "warning" }
        ]
      }
    ],
    microaggressions: [
      {
        question: "A colleague says to an Asian coworker, 'Where are you really from?' How do you respond?",
        options: [
          { text: "Politely explain why the question can be othering and suggest alternatives.", feedback: "✅ Correct! Educational responses promote understanding.", type: "correct" },
          { text: "Ignore it as harmless curiosity.", feedback: "❌ Wrong. Microaggressions cause harm even when unintentional.", type: "incorrect" },
          { text: "Answer for your colleague to deflect the question.", feedback: "⚠️ Not ideal — doesn't address the underlying issue.", type: "warning" }
        ]
      }
    ]
    // Add more templates for other types
  };

  const questionsForType = questionTemplates[type] || questionTemplates.hiring;
  return questionsForType[index % questionsForType.length];
}

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});