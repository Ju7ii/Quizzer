const LogoContainer = document.querySelector('.page-logo');
const LogoSVG = document.querySelector('.page-logo svg');
const QuizSelection = document.getElementById('quiz-selection');
const LoadingQuestions = document.getElementById('loading-questions');
const QuestionGame = document.getElementById('question-game');
const gameResultHTML = document.getElementById('game-result');
const result = [];

document.addEventListener("DOMContentLoaded", function () {
    initializeLogoFadeIn();
});

function initializeLogoFadeIn() {

    LogoContainer.classList.remove('d-none');

    setTimeout(() => {
        console.log('FADE IN');
        LogoSVG.classList.add('active');
    }, 500);

    setTimeout(() => {
        console.log('FADE OUT');
        LogoSVG.classList.remove('active');
    }, 4000);

    setTimeout(() => {
        console.log('REMOVE WRAPPER');
        LogoContainer.classList.add('d-none');
        initializeQuizSelectionFadeIn();
    }, 7000);

}

function initializeQuizSelectionFadeIn() {
    QuizSelection.classList.remove('d-none');
}

async function initializeQuiz(category) {

    QuizSelection.classList.add('d-none');
    LoadingQuestions.classList.remove('d-none');

    const startTime = new Date().getTime(); // Zeit vor der Serveranfrage

    try {
        const questions = await getQuestions(category);

        // Zeit nach der Serveranfrage
        const endTime = new Date().getTime();

        // Mindestens 3 Sekunden anzeigen, aber die Differenz zur Serveranfrage-Zeit hinzufügen
        const remainingTime = Math.max(500 - (endTime - startTime), 0);

        setTimeout(() => {
            LoadingQuestions.classList.add('d-none');
            QuestionGame.classList.remove('d-none');
            startQuiz(questions);
        }, remainingTime);
    } catch (error) {
        console.error(error);
    }
}

function getQuestions(category) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var url = `https://quiz-ofe1.onrender.com/api/${category}`;

        xhr.open('GET', url, true);

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Request was successful
                    var questions = JSON.parse(xhr.responseText);
                    resolve(questions);
                } else {
                    // Handle errors
                    reject(`Request failed with status: ${xhr.status}`);
                }
            }
        };

        xhr.send();
    });
}

function startQuiz(questions) {
    const answerElementsHTML = document.querySelectorAll('[for*="answer"]');
    const questionHTML = document.getElementById('question');
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    const submitButton = document.getElementById('submit');
    const quizQuestions = questions.data;
    const questionCount = document.getElementById('question-count');
    let questionCounter = 1;


    let selectedAnswerIndex;

    console.table(quizQuestions);

    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            if (submitButton.disabled = true) {
                submitButton.disabled = false;
            }
            selectedAnswerIndex = index + 1;
            console.log(selectedAnswerIndex);
        });
    });

    async function displayQuestions() {
        for (const element of quizQuestions) {

            questionCount.textContent = `Question ${questionCounter}/10`;

            radioButtons.forEach((element) => {
                element.checked = false;
            });
            submitButton.disabled = true;

            //* FILL HTML
            questionHTML.textContent = element.question;
            const answers = [element.answer1, element.answer2, element.answer3, element.answer4];
            answers.forEach((answer, index) => {
                answerElementsHTML[index].textContent = answer;
            });

            //* WAIT FOR USER INPUT
            await waitForSubmit(submitButton);
            await checkAnswer(selectedAnswerIndex, element.correct_answer, answerElementsHTML, submitButton);

            //* QUESTION QUESTION-COUNTER
            questionCounter++;
        }

        QuestionGame.classList.add('d-none');

        showResult();

    }

    displayQuestions();
}

async function waitForSubmit(button) {
    return new Promise((resolve) => {
        button.addEventListener('click', () => {
            button.removeEventListener('click', () => { });
            resolve();
        });
    });
}

function checkAnswer(selectedAnswerIndex, correctAnswer, answerElementsHTML, button) {
    return new Promise((resolve) => {

        console.log(selectedAnswerIndex);
        console.log(correctAnswer);

        const inputs = document.getElementsByClassName('btn-check');

        Array.from(inputs).forEach(input => {
            input.disabled = true;
        });

        if (selectedAnswerIndex == correctAnswer) {

            //* RIGHT ANSWER
            answerElementsHTML[selectedAnswerIndex - 1].classList.remove('btn-outline-primary');
            answerElementsHTML[selectedAnswerIndex - 1].classList.add('btn-success');

            result.push(true);

        } else {

            //* WRONG ANSWER
            answerElementsHTML[selectedAnswerIndex - 1].classList.remove('btn-outline-primary');
            answerElementsHTML[selectedAnswerIndex - 1].classList.add('btn-danger');

            //* RIGHT ANSWER
            answerElementsHTML[correctAnswer - 1].classList.remove('btn-outline-primary');
            answerElementsHTML[correctAnswer - 1].classList.add('btn-success');

            result.push(false);
        }

        button.textContent = 'Continue questions';

        button.addEventListener('click', () => {

            button.textContent = 'Check answer';
            answerElementsHTML.forEach(element => {
                element.classList.remove('btn-success', 'btn-danger');
                element.classList.add('btn-outline-primary');
            });

            Array.from(inputs).forEach(input => {
                input.disabled = false;
            });

            button.removeEventListener('click', () => { });
            resolve();
        });


    });
}

function showResult() {


    const resultTextHTML = document.getElementById('result-text');
    const trueCount = result.filter(value => value === true).length;
    let resultText;
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

function newQuiz() {

    gameResultHTML.classList.add('d-none');

    QuizSelection.classList.remove('d-none');

}