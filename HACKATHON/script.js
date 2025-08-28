// API Service for AI-generated content
class AIScenarioService {
  constructor() {
    this.apiBaseUrl = 'https://your-api-endpoint.com/api'; // Replace with your actual API
  }

  async generateScenario(scenarioType, questionCount) {
    try {
      // In a real implementation, this would call your backend API
      // which would then call OpenAI's API with proper authentication
      const response = await fetch(`${this.apiBaseUrl}/generate-scenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioType,
          questionCount,
          // Additional parameters for AI generation
          complexity: 'medium',
          context: 'workplace'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating AI scenario:', error);
      // Fallback to local scenario generation
      return this.generateFallbackScenario(scenarioType, questionCount);
    }
  }

  generateFallbackScenario(scenarioType, questionCount) {
    // Local fallback scenario generation
    // This would be similar to the generateQuestionByType function in index.html
    const questions = [];
    const scenarioTitles = {
      'hiring': 'Hiring Bias',
      'microaggressions': 'Microaggressions',
      'psychological-safety': 'Psychological Safety',
      'cultural-stereotypes': 'Cultural Stereotypes',
      'accessibility': 'Accessibility',
      'gender-bias': 'Gender Bias',
      'leadership': 'Inclusive Leadership'
    };

    for (let i = 0; i < questionCount; i++) {
      questions.push(this.generateFallbackQuestion(scenarioType, i));
    }

    return {
      title: scenarioTitles[scenarioType] || 'Workplace Scenario',
      questions
    };
  }

  generateFallbackQuestion(scenarioType, index) {
    // Sample question templates for fallback
    const templates = {
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
      // Additional templates would be added for other scenario types
    };

    const questionsForType = templates[scenarioType] || templates.hiring;
    return questionsForType[index % questionsForType.length];
  }
}

// Scenario Manager
class ScenarioManager {
  constructor() {
    this.aiService = new AIScenarioService();
    this.savedScenarios = JSON.parse(localStorage.getItem('aiScenarios')) || {};
    this.currentScenario = null;
    this.currentQuestionIndex = 0;
    this.completedScenarios = new Set();
  }

  async generateNewScenario(type, questionCount) {
    const scenarioData = await this.aiService.generateScenario(type, questionCount);
    const scenarioId = `scenario-${Date.now()}`;
    
    this.savedScenarios[scenarioId] = {
      id: scenarioId,
      title: scenarioData.title,
      questions: scenarioData.questions,
      type: type,
      generatedAt: new Date().toISOString(),
      completed: false
    };

    this.saveScenarios();
    return scenarioId;
  }

  getScenario(id) {
    return this.savedScenarios[id];
  }

  getAllScenarios() {
    return this.savedScenarios;
  }

  markScenarioCompleted(id) {
    if (this.savedScenarios[id]) {
      this.savedScenarios[id].completed = true;
      this.completedScenarios.add(id);
      this.saveScenarios();
    }
  }

  saveScenarios() {
    localStorage.setItem('aiScenarios', JSON.stringify(this.savedScenarios));
  }

  clearScenarios() {
    this.savedScenarios = {};
    this.saveScenarios();
  }
}

// UI Manager
class UIManager {
  constructor(scenarioManager) {
    this.scenarioManager = scenarioManager;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Setup all UI event listeners
    document.getElementById('start-btn').addEventListener('click', () => this.showScenarioMenu());
    document.getElementById('generate-scenario').addEventListener('click', () => this.generateNewScenario());
    document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
    // Additional event listeners...
  }

  async generateNewScenario() {
    const type = document.getElementById('scenario-type').value;
    const questionCount = parseInt(document.getElementById('question-count').value) || 3;
    
    this.showLoadingScreen();
    
    try {
      const scenarioId = await this.scenarioManager.generateNewScenario(type, questionCount);
      this.loadScenario(scenarioId);
      this.hideLoadingScreen();
      this.showScenarioScreen();
    } catch (error) {
      console.error('Error generating scenario:', error);
      this.hideLoadingScreen();
      this.showError('Failed to generate scenario. Please try again.');
    }
  }

  loadScenario(scenarioId) {
    this.scenarioManager.currentScenario = scenarioId;
    this.scenarioManager.currentQuestionIndex = 0;
    this.renderQuestion();
  }

  renderQuestion() {
    const scenario = this.scenarioManager.getScenario(this.scenarioManager.currentScenario);
    const question = scenario.questions[this.scenarioManager.currentQuestionIndex];
    
    // Update UI with question data
    document.getElementById('scenario-title').textContent = scenario.title;
    document.getElementById('scenario-question').textContent = question.question;
    
    // Render options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = option.text;
      button.addEventListener('click', () => this.showFeedback(option));
      optionsContainer.appendChild(button);
    });
    
    // Update progress
    document.getElementById('progress').textContent = 
      `Question ${this.scenarioManager.currentQuestionIndex + 1} of ${scenario.questions.length}`;
  }

  showFeedback(option) {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.innerHTML = `<p class="${option.type}">${option.feedback}</p>`;
    document.getElementById('next-btn').classList.remove('hidden');
  }

  nextQuestion() {
    this.scenarioManager.currentQuestionIndex++;
    const scenario = this.scenarioManager.getScenario(this.scenarioManager.currentScenario);
    
    if (this.scenarioManager.currentQuestionIndex < scenario.questions.length) {
      this.renderQuestion();
      document.getElementById('next-btn').classList.add('hidden');
      document.getElementById('feedback').innerHTML = '';
    } else {
      this.completeScenario();
    }
  }

  completeScenario() {
    this.scenarioManager.markScenarioCompleted(this.scenarioManager.currentScenario);
    this.showCompletionScreen();
  }

  showLoadingScreen() {
    document.getElementById('loading-screen').classList.add('active');
  }

  hideLoadingScreen() {
    document.getElementById('loading-screen').classList.remove('active');
  }

  showScenarioMenu() {
    this.renderScenarioList();
    document.getElementById('scenario-menu').classList.add('active');
  }

  renderScenarioList() {
    const scenarios = this.scenarioManager.getAllScenarios();
    const container = document.getElementById('scenario-list');
    container.innerHTML = '';
    
    Object.keys(scenarios).forEach(id => {
      const scenario = scenarios[id];
      const button = document.createElement('button');
      button.textContent = `${scenario.title} (${new Date(scenario.generatedAt).toLocaleDateString()})`;
      button.addEventListener('click', () => this.loadScenario(id));
      if (scenario.completed) {
        button.innerHTML += ' ✅';
      }
      container.appendChild(button);
    });
  }

  // Additional UI methods...
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const scenarioManager = new ScenarioManager();
  const uiManager = new UIManager(scenarioManager);
  
  // Make available globally for debugging
  window.scenarioManager = scenarioManager;
  window.uiManager = uiManager;
});