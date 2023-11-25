const LogoContainer = document.querySelector('.page-logo');
const LogoSVG = document.querySelector('.page-logo svg');
const QuizSelection = document.getElementById('quiz-selection');

document.addEventListener("DOMContentLoaded", function() {
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
    }, 5000);

    setTimeout(() => {
        console.log('REMOVE WRAPPER');
        LogoContainer.classList.add('d-none');
        initializeQuizSelectionFadeIn();
    }, 7000);

}

function initializeQuizSelectionFadeIn() {

    QuizSelection.classList.remove('d-none');

}