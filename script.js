const QUESTIONS = [
  { id: "sleep", prompt: "How often do worries make it hard for you to sleep?" },
  { id: "focus", prompt: "How often is it hard to focus on simple tasks?" },
  { id: "tension", prompt: "How often do you feel physically tense or on edge?" },
  { id: "overwhelmed", prompt: "How often do everyday tasks feel overwhelming?" },
  { id: "irritable", prompt: "How often do you feel easily irritated lately?" },
  { id: "drained", prompt: "How often do you feel drained even after resting?" },
  { id: "disconnect", prompt: "How often do you feel disconnected from people around you?" },
  { id: "control", prompt: "How often do you feel things are out of your control?" },
];

const OPTIONS = [
  { value: 0, label: "Never", description: "Almost not at all" },
  { value: 1, label: "Sometimes", description: "A few times lately" },
  { value: 2, label: "Often", description: "Happens many days" },
  { value: 3, label: "Almost always", description: "Feels constant" },
];

const form = document.getElementById("quizForm");
const questionsRoot = document.getElementById("questionsRoot");
const questionCounter = document.getElementById("questionCounter");
const prevQuestionButton = document.getElementById("prevQuestion");
const nextQuestionButton = document.getElementById("nextQuestion");
const completionSection = document.getElementById("completionSection");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const emailInput = document.getElementById("emailInput");
const errorMessage = document.getElementById("errorMessage");
const resetButton = document.getElementById("resetButton");

const resultPlaceholder = document.getElementById("resultPlaceholder");
const resultContent = document.getElementById("resultContent");
const scoreText = document.getElementById("scoreText");
const levelBadge = document.getElementById("levelBadge");
const summaryText = document.getElementById("summaryText");
const nextStepText = document.getElementById("nextStepText");

const answers = {};
let currentQuestionIndex = 0;

function emailIsValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getAnsweredCount() {
  return QUESTIONS.reduce((count, question) => (answers[question.id] === undefined ? count : count + 1), 0);
}

function allQuestionsAnswered() {
  return getAnsweredCount() === QUESTIONS.length;
}

function levelClass(level) {
  return level.toLowerCase().replace(/\s+/g, "-");
}

function calculateResult() {
  const total = QUESTIONS.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
  const max = QUESTIONS.length * 3;
  const ratio = total / max;

  if (ratio <= 0.25) {
    return {
      score: total,
      max,
      level: "Low",
      summary: "Your answers suggest stress is currently manageable.",
      nextStep: "Keep supporting your routine with quality sleep, movement, and social connection.",
    };
  }

  if (ratio <= 0.5) {
    return {
      score: total,
      max,
      level: "Mild",
      summary: "You are carrying some stress that may need regular attention.",
      nextStep: "Try short daily resets like a walk, a breathing break, or a quiet pause.",
    };
  }

  if (ratio <= 0.75) {
    return {
      score: total,
      max,
      level: "High",
      summary: "Your stress level looks elevated and may be affecting your wellbeing.",
      nextStep: "Reduce non-urgent pressure and ask for support from someone you trust.",
    };
  }

  return {
    score: total,
    max,
    level: "Very high",
    summary: "Your answers suggest stress is very intense right now.",
    nextStep: "Please prioritize support soon, including a qualified mental health professional.",
  };
}

function hideError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function showError(text) {
  errorMessage.hidden = false;
  errorMessage.textContent = text;
}

function hideResult() {
  resultPlaceholder.hidden = false;
  resultContent.hidden = true;
}

function showResult(result) {
  resultPlaceholder.hidden = true;
  resultContent.hidden = false;

  scoreText.textContent = `${result.score}/${result.max}`;
  levelBadge.textContent = result.level;
  levelBadge.className = `level-badge ${levelClass(result.level)}`;
  summaryText.textContent = result.summary;
  nextStepText.textContent = result.nextStep;
}

function updateProgress() {
  const answered = getAnsweredCount();
  const percent = Math.round((answered / QUESTIONS.length) * 100);
  progressText.textContent = `${answered}/${QUESTIONS.length} answered`;
  progressFill.style.width = `${percent}%`;

  completionSection.hidden = !allQuestionsAnswered();
}

function currentQuestionIsAnswered() {
  const question = QUESTIONS[currentQuestionIndex];
  return answers[question.id] !== undefined;
}

function updateQuestionNavigation() {
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${QUESTIONS.length}`;
  prevQuestionButton.disabled = currentQuestionIndex === 0;

  const onLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  if (onLastQuestion) {
    nextQuestionButton.textContent = "Last question";
    nextQuestionButton.disabled = true;
    return;
  }

  nextQuestionButton.textContent = "Next";
  nextQuestionButton.disabled = !currentQuestionIsAnswered();
}

function renderCurrentQuestion() {
  const question = QUESTIONS[currentQuestionIndex];
  questionsRoot.innerHTML = "";

  const fieldset = document.createElement("fieldset");
  fieldset.className = "question-card";

  const legend = document.createElement("legend");
  legend.textContent = question.prompt;
  fieldset.appendChild(legend);

  const optionsGrid = document.createElement("div");
  optionsGrid.className = "options";

  OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.dataset.questionId = question.id;
    button.dataset.value = String(option.value);
    button.innerHTML = `<strong>${option.label}</strong><small>${option.description}</small>`;

    if (answers[question.id] === option.value) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      const wasComplete = allQuestionsAnswered();
      answers[question.id] = option.value;
      hideError();
      hideResult();
      updateProgress();
      renderCurrentQuestion();

      if (!wasComplete && allQuestionsAnswered()) {
        completionSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    optionsGrid.appendChild(button);
  });

  fieldset.appendChild(optionsGrid);
  questionsRoot.appendChild(fieldset);
  updateQuestionNavigation();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hideError();

  const answered = getAnsweredCount();
  if (answered !== QUESTIONS.length) {
    const firstMissingIndex = QUESTIONS.findIndex((question) => answers[question.id] === undefined);
    if (firstMissingIndex !== -1) {
      currentQuestionIndex = firstMissingIndex;
      renderCurrentQuestion();
    }
    showError("Please answer all questions before getting your result.");
    hideResult();
    return;
  }

  const email = emailInput.value.trim();
  if (!emailIsValid(email)) {
    emailInput.classList.add("invalid");
    showError("Please enter a valid email address.");
    hideResult();
    return;
  }

  emailInput.classList.remove("invalid");
  showResult(calculateResult());
});

prevQuestionButton.addEventListener("click", () => {
  if (currentQuestionIndex === 0) {
    return;
  }

  hideError();
  currentQuestionIndex -= 1;
  renderCurrentQuestion();
});

nextQuestionButton.addEventListener("click", () => {
  if (currentQuestionIndex >= QUESTIONS.length - 1) {
    return;
  }

  if (!currentQuestionIsAnswered()) {
    showError("Please choose an answer before going to the next question.");
    return;
  }

  hideError();
  currentQuestionIndex += 1;
  renderCurrentQuestion();
});

emailInput.addEventListener("input", () => {
  emailInput.classList.remove("invalid");
  hideError();
  hideResult();
});

resetButton.addEventListener("click", () => {
  Object.keys(answers).forEach((key) => delete answers[key]);
  currentQuestionIndex = 0;
  emailInput.value = "";
  emailInput.classList.remove("invalid");

  hideError();
  hideResult();
  updateProgress();
  renderCurrentQuestion();
});

renderCurrentQuestion();
updateProgress();
hideResult();
hideError();
