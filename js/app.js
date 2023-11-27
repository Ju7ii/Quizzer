// Selecting DOM elements
const LogoContainer = document.querySelector('.page-logo');
const LogoSVG = LogoContainer.querySelector('svg');
const QuizSelection = document.getElementById('quiz-selection');
const LoadingQuestions = document.getElementById('loading-questions');
const QuestionGame = document.getElementById('question-game');
const gameResultHTML = document.getElementById('game-result');
const result = [];

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    initializeLogoFadeIn();
});

// Function to initialize logo fade-in animation
function initializeLogoFadeIn() {
    // Show the logo container
    LogoContainer.classList.remove('d-none');

    // Logo fade-in animation
    setTimeout(() => {
        console.log('FADE IN');
        LogoSVG.classList.add('active');
    }, 500);

    // Logo fade-out animation
    setTimeout(() => {
        console.log('FADE OUT');
        LogoSVG.classList.remove('active');
    }, 4000);

    // Hide the logo container after fade-out and proceed to quiz selection
    setTimeout(() => {
        console.log('REMOVE WRAPPER');
        LogoContainer.classList.add('d-none');
        initializeQuizSelectionFadeIn();
    }, 7000);
}

// Function to initialize quiz selection fade-in animation
function initializeQuizSelectionFadeIn() {
    QuizSelection.classList.remove('d-none');
}

// Async function to initialize quiz with a specified category
async function initializeQuiz(category) {
    // Hide quiz selection and show loading indicator
    QuizSelection.classList.add('d-none');
    LoadingQuestions.classList.remove('d-none');

    // Record start time before making a server request
    const startTime = new Date().getTime();

    try {
        // Fetch questions from the server
        const questions = await getQuestions(category);

        // Record end time after the server request
        const endTime = new Date().getTime();

        // Ensure a minimum display time of 500ms, accounting for server request time
        const remainingTime = Math.max(500 - (endTime - startTime), 0);

        // Show quiz questions after loading and processing
        setTimeout(() => {
            LoadingQuestions.classList.add('d-none');
            QuestionGame.classList.remove('d-none');
            startQuiz(questions);
        }, remainingTime);
    } catch (error) {
        console.error(error);
    }
}

// Function to make an asynchronous request to get quiz questions
function getQuestions(category) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var url = `https://quiz-ofe1.onrender.com/api/${category}`;

        // Set up the XMLHttpRequest
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

        // Handle the XMLHttpRequest state changes
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Request was successful, parse and resolve questions
                    var questions = JSON.parse(xhr.responseText);
                    resolve(questions);
                } else {
                    // Handle errors by rejecting with the status
                    reject(`Request failed with status: ${xhr.status}`);
                }
            }
        };

        // Send the XMLHttpRequest
        xhr.send();
    });
}

// Function to start the quiz with provided questions
function startQuiz(questions) {
    // Selecting quiz-related DOM elements
    const answerElementsHTML = document.querySelectorAll('[for*="answer"]');
    const questionHTML = document.getElementById('question');
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    const submitButton = document.getElementById('submit');
    const quizQuestions = questions.data;
    const questionCount = document.getElementById('question-count');
    let questionCounter = 1;

    let selectedAnswerIndex;

    console.table(quizQuestions);

    // Event listeners for radio button changes
    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            // Enable submit button when an answer is selected
            if (submitButton.disabled === true) {
                submitButton.disabled = false;
            }
            // Record the selected answer index
            selectedAnswerIndex = index + 1;
            console.log(selectedAnswerIndex);
        });
    });

    // Async function to display and process quiz questions
    async function displayQuestions() {
        for (const element of quizQuestions) {
            // Update question count display
            questionCount.textContent = `Question ${questionCounter}/10`;

            // Reset radio buttons and disable submit button
            radioButtons.forEach((element) => {
                element.checked = false;
            });
            submitButton.disabled = true;

            // Fill HTML with question and answers
            questionHTML.textContent = element.question;
            const answers = [element.answer1, element.answer2, element.answer3, element.answer4];
            answers.forEach((answer, index) => {
                answerElementsHTML[index].textContent = answer;
            });

            // Wait for user to submit an answer
            await waitForSubmit(submitButton);
            // Check the answer and update the display
            await checkAnswer(selectedAnswerIndex, element.correct_answer, answerElementsHTML, submitButton);

            // Increment the question counter
            questionCounter++;
        }

        // Hide the question game and show the quiz result
        QuestionGame.classList.add('d-none');
        showResult();
    }

    // Start displaying quiz questions
    displayQuestions();
}

// Async function to wait for the user to submit an answer
async function waitForSubmit(button) {
    return new Promise((resolve) => {
        button.addEventListener('click', () => {
            // Remove the event listener and resolve the promise
            button.removeEventListener('click', () => { });
            resolve();
        });
    });
}

// Function to check the selected answer against the correct answer
function checkAnswer(selectedAnswerIndex, correctAnswer, answerElementsHTML, button) {
    return new Promise((resolve) => {
        // Disable all answer buttons during processing
        const inputs = document.getElementsByClassName('btn-check');
        Array.from(inputs).forEach(input => {
            input.disabled = true;
        });

        console.log(selectedAnswerIndex);
        console.log(correctAnswer);

        if (selectedAnswerIndex == correctAnswer) {
            // Display correct answer and update result array
            answerElementsHTML[selectedAnswerIndex - 1].classList.remove('btn-outline-primary');
            answerElementsHTML[selectedAnswerIndex - 1].classList.add('btn-success');
            result.push(true);
        } else {
            // Display incorrect answer and correct answer, and update result array
            answerElementsHTML[selectedAnswerIndex - 1].classList.remove('btn-outline-primary');
            answerElementsHTML[selectedAnswerIndex - 1].classList.add('btn-danger');
            answerElementsHTML[correctAnswer - 1].classList.remove('btn-outline-primary');
            answerElementsHTML[correctAnswer - 1].classList.add('btn-success');
            result.push(false);
        }

        // Update button text and add event listener for next question
        button.textContent = 'Continue questions';
        button.addEventListener('click', () => {
            button.textContent = 'Check answer';
            // Reset answer button styles and enable all answer buttons
            answerElementsHTML.forEach(element => {
                element.classList.remove('btn-success', 'btn-danger');
                element.classList.add('btn-outline-primary');
            });
            Array.from(inputs).forEach(input => {
                input.disabled = false;
            });
            // Remove the event listener and resolve the promise
            button.removeEventListener('click', () => { });
            resolve();
        });
    });
}

// Function to display the quiz result
function showResult() {
    const resultTextHTML = document.getElementById('result-text');
    const trueCount = result.filter(value => value === true).length;
    let resultText;
    // Display result text based on the number of correct answers
    gameResultHTML.classList.remove('d-none');

    if (trueCount == 10) {
        resultText = `Excellent, you answered all ${trueCount} questions correctly`;
    } else if (trueCount <= 9 && trueCount >= 5) {
        resultText = `Very good, you answered ${trueCount} correct questions`;
    } else if (trueCount <= 5 && trueCount >= 1) {
        resultText = `You answered ${trueCount} correct questions`
    } else {
        resultText = 'You might want to try another quiz';
    }
    resultTextHTML.textContent = resultText;
}

// Function to reset and start a new quiz
function newQuiz() {
    gameResultHTML.classList.add('d-none');
    QuizSelection.classList.remove('d-none');
}
