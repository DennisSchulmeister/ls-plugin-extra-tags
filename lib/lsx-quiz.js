/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2023 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml }           from "@dschulmeis/ls-utils/dom_utils.js";
import { determineLinebreaks } from "@dschulmeis/ls-utils/string_utils.js";
import { escapeHTML }          from "@dschulmeis/ls-utils/string_utils.js";

/**
 * Implementation of the <lsx-quiz> custom tag (version 2). This version offers more features
 * than the old version (more question types) based on a less ad-hoc implementation.
 */
export default class LSX_Quiz {
    quizInstances = [];

    /**
     * Called by the plugin main class to replace the custom HTML tags with standard HTML code.
     * Here the HTML structure is parsed into a object-oriented data structure composed of the
     * classes below, which manages the quiz state and re-renders the DOM on each state update.
     * 
     * The basic object hierarchy is the following:
     * 
     * ```text
     * Quiz
     * `-- Exercise
     * |   `--Question Sub-Class    
     * |   `--Question Sub-Class    
     * |   `--Question Sub-Class
     * `-- Exercise
     *     `--Question Sub-Class
     * ```
     * 
     * ### Note on the rendered output
     * 
     * The whole quiz is rendered into one big CSS grid using two columns for correction marks
     * and the quiz content, like so:
     * 
     * ```html
     * <div class="lsx-quiz" data-score-visible="true">
     *     <div class="lsx-quiz-column-score">Correction marks and score</div>
     *     <div class="lsx-quiz-column-main">Quiz content</div>
     *
     *     <div class="lsx-quiz-column-score">Correction marks and score</div>
     *     <div class="lsx-quiz-column-main">Quiz content</div>
     * 
     *     ...
     * </div>
     * ```
     * 
     * @param {Element} html DOM node with the slide definitions
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        this.quizInstances = [];

        for (let quizElement of html.querySelectorAll("lsx-quiz")) {
            let quiz = Quiz.createFromHtmlSource(quizElement, plugin);
            this.quizInstances.push(quiz);
            quizElement.replaceWith(quiz.render());
        }
    }
};

/**
 * Utility function to calculate the HTML code to display the actual and maximum score points
 * of a quiz, exercise or question group.
 * 
 * @param {LS_Plugin_ExtraTags} plugin Plugin main object
 * @returns {String} HTML code to display actual and max score points
 */
function calcScorePointsHtml(plugin) {
    let result = plugin.config.labelQuizPoints;
    result = result.replace("{1}", '<span class="lsx-quiz-actual-points">0</span>');
    result = result.replace("{2}", '<span class="lsx-quiz-max-points">0</span>');
    return result;
}

/**
 * Utility function to update the displayed score points of a quiz, exercise or question group.
 * 
 * @param {Element} element Parent HTML element holding the placeholder `<span>`s
 * @param {Number} maxScore Maximum possible score points
 * @param {Number} actualScore Achieved actual score points
 */
function updateScorePoints({element, maxScore, actualScore} = {}) {
    maxScore    = maxScore    || 0;
    actualScore = actualScore || 0;

    // Update score points
    let pointsFormatter = new Intl.NumberFormat(undefined, {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
        roundingMode: "halfCeil",
    });

    let maxScoreElement = element?.querySelector(".lsx-quiz-max-points");
    if (maxScoreElement) maxScoreElement.textContent = pointsFormatter.format(maxScore);

    let actualScoreElement = element?.querySelector(".lsx-quiz-actual-points");
    if (actualScoreElement) actualScoreElement.textContent = pointsFormatter.format(actualScore);

    // Update score percentage
    let percentageFormatter = new Intl.NumberFormat(undefined, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        roundingMode: "halfCeil",
    });

    let percentage = maxScore > 0 ? (actualScore / maxScore) : 0;

    let percentageElement = element?.querySelector(".lsx-quiz-percentage");
    if (percentageElement) percentageElement.textContent = percentageFormatter.format(percentage);
}

/**
 * Top-most parent object of a quiz. Contains a nested structure with the quiz contents
 * and maintains the global state of the quiz.
 */
class Quiz {
    plugin           = null;
    lsxElement       = null;
    renderedQuiz     = null;
    renderedScore    = null;
    renderedControls = null;

    exercisePrefix  = "";
    exercises       = [];

    MODE_NORMAL     = 1;     // Normal mode: Correction marks hidden, answers can be changed
    MODE_CORRECTION = 2;     // Correction mode: Correction marks visible, answers cannot be changed

    mode        = this.MODE_NORMAL;
    maxScore    = 0;
    actualScore = 0;

    /**
     * Factory method that creates a new instance based on the given HTML source.
     * @param {Element} quizElement `<lsx-quiz>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     * @returns {Quiz} New instance
     */
    static createFromHtmlSource(quizElement, plugin) {
        let quiz = new Quiz();

        quiz.plugin         = plugin;
        quiz.lsxElement     = quizElement;
        quiz.exercisePrefix = quizElement.getAttribute("prefix") || "";

        for (let exerciseElement of quizElement.querySelectorAll(":scope > lsx-exercise")) {
            quiz.exercises.push(Exercise.createFromHtmlSource(exerciseElement, plugin, quiz));
        }

        return quiz;
    }

    /**     
     * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
     * This will be called before a rerender.
     */
    evaluateAnswers() {
        this.mode        = this.MODE_CORRECTION;
        this.maxScore    = 0;
        this.actualScore = 0;

        for (let exercise of this.exercises) {
            exercise.evaluateAnswers();

            this.maxScore    += exercise.maxScore;
            this.actualScore += exercise.actualScore;
        }
    }
    
    
    /**
     * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
     */
    resetEvaluation() {
        this.mode        = this.MODE_NORMAL;
        this.maxScore    = 0;
        this.actualScore = 0;

        for (let exercise of this.exercises) {
            exercise.resetEvaluation();

            this.maxScore    += exercise.maxScore;
            this.actualScore += exercise.actualScore;
        }
    }

    /**
     * Create or update HTML content to be shown on screen.
     * @returns {Element} Rendered DOM element (always the same)
     */
    render() {
        // Render overall structure
        if (!this.renderedQuiz) {
            let points = calcScorePointsHtml(this.plugin);

            this.renderedQuiz = parseHtml(`
                <div class="lsx-quiz" data-score-visible="false">
                    <!-- Exercise rows -->

                    <!-- Last row: Total score and control buttons -->
                    <div class="lsx-quiz-column-score lsx-quiz-border-bottom pt-4">
                        <div class="lsx-quiz-total-percentage" data-value="0">
                            <span class="lsx-quiz-percentage">0%</span>
                        </div>
                        <div class="lsx-quiz-total-points">${points}</div>
                    </div>
                    <div class="lsx-quiz-column-main lsx-quiz-controls pt-4">
                        <div>
                            <button type="button" class="lsx-quiz-action-submit btn btn-dark">${this.plugin.config.labelQuizEvaluate}</button>
                            <button type="button" class="lsx-quiz-action-reset btn btn-light">${this.plugin.config.labelQuizNewTry}</button>
                        </div>
                    </div>
                </div>
            `)[0];

            this.renderedScore = this.renderedQuiz.querySelector(".lsx-quiz-column-score");
            this.renderedControls = this.renderedQuiz.querySelector(".lsx-quiz-controls");

            // Event listener for evaluate button
            this.renderedControls.querySelector(".lsx-quiz-action-submit").addEventListener("click", () => {
                this.evaluateAnswers();
                this.render();
            });

            // Event listener for reset button
            this.renderedControls.querySelector(".lsx-quiz-action-reset").addEventListener("click", () => {
                this.resetEvaluation();
                this.render();
            });
        }

        let scoreVisible = this.mode === this.MODE_CORRECTION;
        this.renderedQuiz.dataset.scoreVisible = scoreVisible;

        updateScorePoints({
            element:     this.renderedScore,
            maxScore:    this.maxScore,
            actualScore: this.actualScore,
        });

        // Render exercises
        this.renderedQuiz.replaceChildren();

        for (let exercise of this.exercises) {
            for (let childElement of exercise.render() || []) {
                this.renderedQuiz.append(childElement);
            }
        }

        this.renderedQuiz.append(this.renderedScore);
        this.renderedQuiz.append(this.renderedControls);

        return this.renderedQuiz;
    }
}

/**
 * Exercise inside a quiz. Contains an exercise title and usually at least one question
 * group for the questions. Note, that question groups are used to place questions next
 * to each other on large screens, which means the the score points must be added to be
 * shown in the correction column. But since usually all questions are shown below each
 * other, the definition of question groups in the HTML source is optional. Questions
 * without group will automatically be placed in groups.
 */
class Exercise {
    plugin        = null;
    lsxElement    = null;
    renderedScore = null;
    renderedMain  = null;
    renderedTitle = null;
    renderedHint  = null;

    quiz        = null;
    title       = "";
    questions   = [];
    maxScore    = 0;
    actualScore = 0;

    /**
     * Factory method that creates a new instance based on the given HTML source.
     * @param {Element} exerciseElement `<lsx-exercise>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     * @param {Quiz} Quiz Parent quiz object
     * @returns {Exercise} New instance
     */
    static createFromHtmlSource(exerciseElement, plugin, quiz) {
        let exercise = new Exercise();

        exercise.plugin     = plugin;
        exercise.lsxElement = exerciseElement;
        exercise.quiz       = quiz;
        exercise.title      = exerciseElement.getAttribute("title") || "";
        exercise.hint       = exerciseElement.getAttribute("hint")  || "";

        for (let titleElement of exerciseElement.querySelectorAll(":scope > lsx-title")) {
            exercise.title += " " + titleElement.innerHTML;
            titleElement.remove();
        }

        for (let hintElement of exerciseElement.querySelectorAll(":scope > lsx-hint")) {
            exercise.hint += " " + hintElement.innerHTML;
            hintElement.remove();
        }

        exercise.title = exercise.title.trim();
        exercise.hint  = exercise.hint.trim();

        for (let questionElement of exerciseElement.querySelectorAll(":scope > lsx-question")) {
            exercise.questions.push(Question.createFromHtmlSource(questionElement, plugin, exercise));
        }

        return exercise;
    }

    /**     
     * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
     * This will be called before a rerender.
     */
    evaluateAnswers() {
        this.maxScore    = 0;
        this.actualScore = 0;

        for (let question of this.questions) {
            question.evaluateAnswers();

            this.maxScore    += question.maxScore;
            this.actualScore += question.actualScore;
        }
    }
    
    
    /**
     * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
     */
    resetEvaluation() {
        this.maxScore    = 0;
        this.actualScore = 0;

        for (let question of this.questions) {
            question.resetEvaluation();

            this.maxScore    += question.maxScore;
            this.actualScore += question.actualScore;
        }
    }

    /**
     * Create or update HTML content to be shown on screen. The content will be rendered directly
     * into the `<div class="lsx-quiz"></div>` element, which uses a CSS grid to create two columns
     * for the correction marks and the quiz itself.
     * 
     * @returns {Element[]} Rendered DOM elements (always the same)
     */
    render() {
        // Render overall structure
        if (!this.renderedScore || !this.renderedMain) {
            let points = calcScorePointsHtml(this.plugin);
            let hx = this.plugin.config.quizExerciseHeading;

            [this.renderedScore, this.renderedMain] = parseHtml(`
                <div class="lsx-quiz-column-score">
                    <div class="lsx-exercise-points">${points}</div>
                </div>
                <div class="lsx-quiz-column-main">
                    <${hx}></${hx}>
                    <div class="lsx-quiz-hint"></div>
                </div>
            `);

            this.renderedTitle = this.renderedMain.querySelector(":scope > *:first-child");
            this.renderedHint  = this.renderedMain.querySelector(".lsx-quiz-hint");
        }

        updateScorePoints({
            element:     this.renderedScore,
            maxScore:    this.maxScore,
            actualScore: this.actualScore,
        });

        // Render top border and paddings
        let exerciseNumber = this.quiz.exercises.indexOf(this) + 1;

        if (exerciseNumber === 1) {
            this.renderedScore.classList.add("lsx-quiz-border-top");
            this.renderedScore.classList.remove("pt-4");
            this.renderedMain.classList.remove("pt-4");
        } else {
            this.renderedScore.classList.remove("lsx-quiz-border-top");
            this.renderedScore.classList.add("pt-4");
            this.renderedMain.classList.add("pt-4");
        }

        // Render exercise title
        this.renderedTitle.innerHTML = `${this.quiz.exercisePrefix} ${this.title}`.replace("#", exerciseNumber);

        // Render exercise hint
        this.renderedHint.innerHTML = this.hint;

        if (this.hint) {
            this.renderedHint.classList.remove("hidden");
        } else {
            this.renderedHint.classList.add("hidden");
        }

        // Render questions
        let result = [this.renderedScore, this.renderedMain];

        for (let question of this.questions) {
            result.push(...question.render());
        }

        return result;
    }
}

/**
 * Abstract base-class for the actual questions. Contains some logic common to all types
 * of questions.
 */
class Question {
    plugin        = null;
    lsxElement    = null;
    renderedScore = null;
    renderedMain  = null;

    exercise    = null;
    type        = "";
    text        = "";
    hint        = "";
    lines       = [];
    maxScore    = 0;
    actualScore = 0;
    emptyPoints = 0;
    wrongPoints = 0;

    /**
     * Factory method that creates a new instance based on the given HTML source.
     * @param {Element} questionElement `<lsx-question>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     * @param {Exercise} exercise Parent exercise object
     * @returns {Question} New instance
     */
    static createFromHtmlSource(questionElement, plugin, exercise) {
        let type   = (questionElement.getAttribute("type") || "single-choice").toLowerCase();
        let class_ = Question;

        switch (type) {
            case "single-choice":
            case "multiple-choice":
                class_ = ChoiceQuestion;
                break;
            case "assignment":
                class_ = AssignmentQuestion;
                break;
            case "gap-text":
                class_ = GapTextQuestion;
                break;
            case "free-text":
                class_ = FreeTextQuestion;
                break;
        }

        let question = new class_();

        question.plugin      = plugin;
        question.lsxElement  = questionElement;
        question.exercise    = exercise;
        question.type        = type;
        question.text        = questionElement.getAttribute("text") || "";
        question.hint        = questionElement.getAttribute("hint") || "";
        question.emptyPoints = parseFloat(questionElement.getAttribute("empty-points")) || 0;
        question.wrongPoints = parseFloat(questionElement.getAttribute("wrong-points")) || 0;

        for (let questionTextElement of questionElement.querySelectorAll(":scope > lsx-question-text, :scope > lsx-text")) {
            question.text += " " + questionTextElement.innerHTML;
            questionTextElement.remove();
        }

        for (let questionHintElement of questionElement.querySelectorAll(":scope > lsx-question-hint, :scope > lsx-hint")) {
            question.hint += " " + questionHintElement.innerHTML;
            questionHintElement.remove();
        }

        question.text = question.text.trim();
        question.hint = question.hint.trim();

        question.parseHtmlSource(questionElement);

        for (let line of question.lines) {
            line.question = question;
        }

        return question;
    }

    /**
     * Abstract method for sub-classes to read question type specific content from the HTML
     * source into the object instance. Should also populate the `lines` member attribute.
     * 
     * @param {Element} questionElement `<lsx-question>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     */
    parseHtmlSource(questionElement, plugin) {
        // Must be overridden
    }

    /**     
     * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
     * This will be called before a rerender.
     */
    evaluateAnswers() {
        this.maxScore    = 0;
        this.actualScore = 0;

        for (let line of this.lines) {
            line.evaluateAnswers();

            this.maxScore    += line.maxScore;
            this.actualScore += line.actualScore;
        }

        this.actualScore = Math.max(0, this.actualScore);
    }
    
    /**
     * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
     */
    resetEvaluation() {
        this.maxScore    = 0;
        this.actualScore = 0;

        for (let line of this.lines) {
            line.resetEvaluation();

            this.maxScore    += line.maxScore;
            this.actualScore += line.actualScore;
        }
    }

    /**
     * Create or update HTML content to be shown on screen. The content will be rendered directly
     * into the `<div class="lsx-quiz"></div>` element, which uses a CSS grid to create two columns
     * for the correction marks and the quiz itself.
     * 
     * @returns {Element[]} Rendered DOM elements (always the same)
     */
    render() {
        // Render overall structure
        if (!this.renderedScore || !this.renderedMain) {
            let points = calcScorePointsHtml(this.plugin);

            [this.renderedScore, this.renderedMain] = parseHtml(`
                <div class="lsx-quiz-column-score">
                    <div class="lsx-question-points">${points}</div>
                </div>
                <div class="lsx-quiz-column-main"></div>
            `);
        }

        let index = this.exercise.questions.indexOf(this);

        if (index > 0) {
            this.renderedScore.classList.add("pt-4");
            this.renderedMain.classList.add("pt-4");
        } else {
            this.renderedScore.classList.remove("pt-4");
            this.renderedMain.classList.remove("pt-4");
        }

        updateScorePoints({
            element:     this.renderedScore,
            maxScore:    this.maxScore,
            actualScore: this.actualScore,
        });

        // Render question text and hint
        let questionTextHtml = `<div class="lsx-quiz-question">${this.text}</div>`;
        if (this.hint) questionTextHtml += `<div class="lsx-quiz-hint">${this.hint}</div>`;
        this.renderedMain.innerHTML = questionTextHtml;

        // Render question lines
        let result = [this.renderedScore, this.renderedMain];
        
        for (let line of this.lines) {
            result.push(...line.render());
        }

        return result;
    }
}

/**
 * Abstract base-class for question lines.
 */
class QuestionLine {
    plugin           = null;
    lsxElement       = null;
    renderedScore    = null;
    renderedMain     = null;
    
    STATUS_UNKNOWN = 0;
    STATUS_CORRECT = 1;
    STATUS_PARTIAL = 2;
    STATUS_WRONG   = 3;
    
    question     = null;
    status       = this.STATUS_UNKNOWN;
    maxScore     = 0;
    actualScore  = 0;

    /**
     * Factory method that creates a new instance based on the given HTML source.
     * @param {Element} questionLineElement `<lsx-question-line>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     * @param {Question} question Parent question object
     * @returns {QuestionLine} New instance
     */
    static createFromHtmlSource(questionLineElement, plugin, question) {
        // Must be overridden
    }

    /**
     * Abstract method for sub-classes to evaluate the given answers and update the attributes
     * `status`, `maxScore` and `actualScore` accordingly. This will be called before a rerender.
     * Sub-classes should call this method first to reset the score points.
     */
    evaluateAnswers() {
        this.status      = this.STATUS_UNKNOWN;
        this.maxScore    = 0;
        this.actualScore = 0;
    }

    /**
     * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
     * Sub-classes should call this method to reset the score points, if the method is overridden.
     */
    resetEvaluation() {
        this.status      = this.STATUS_UNKNOWN;
        this.maxScore    = 0;
        this.actualScore = 0;
    }

    /**
     * Utility method for sub-classes to be called during evaluation of the answers. Must be called with
     * the status of each individual answer to update the overall status of the question line. This makes
     * sure, that the overall status is ...
     * 
     *  * `STATUS_CORRECT` when all answers are `STATUS_CORRECT`
     *  * `STATUS_WRONG` when all answers are `STATUS_WRONG`
     *  * `STATUS_PARTIAL` when some answers are `STATUS_CORRECT` and some are `STATUS_WRONG`
     *  * `STATUS_UNKNOWN` otherwise
     * 
     * Before starting the evaluation `this.status` must be reset to `STATUS_UNKNOWN`.
     * 
     * @param {string} answerStatus Evaluation status of a single answer (see constants)
     */
    updateStatus(answerStatus) {
        if (answerStatus === this.STATUS_UNKNOWN) {
            // UNKNOWN answer status doesn't change the overall status
        } else if (answerStatus === this.STATUS_PARTIAL) {
            // PARTIAL is the final status after which nothing changes anymore
            this.status = this.STATUS_PARTIAL;
        } else if (answerStatus === this.STATUS_CORRECT) {
            // Nothing to do, when the overall status is already CORRECT or PARTIAL
            if (this.status === this.STATUS_UNKNOWN) {
                this.status = this.STATUS_CORRECT;
            } else if (this.status === this.STATUS_WRONG) {
                this.status = this.STATUS_PARTIAL;
            }
        } else if (answerStatus === this.STATUS_WRONG) {
            // Nothing to do, when the overall status is already WRONG or PARTIAL
            if (this.status === this.STATUS_UNKNOWN) {
                this.status = this.STATUS_WRONG;
            } else if (this.status === this.STATUS_CORRECT) {
                this.status = this.STATUS_PARTIAL;
            }
        }
    }
    
    /**
     * Create or update HTML content to be shown on screen. The content will be rendered directly
     * into the `<div class="lsx-quiz"></div>` element, which uses a CSS grid to create two columns
     * for the correction marks and the quiz itself.
     * 
     * @returns {Element[]} Rendered DOM elements (always the same)
     */
    render() {
        // Render score column
        if (!this.renderedScore || !this.renderedMain) {
            [this.renderedScore, this.renderedMain] = parseHtml(`
                <div class="lsx-quiz-column-score">
                    <span data-status="${this.STATUS_CORRECT}" class="lsx-quiz-icon __lspet__icon-checkmark"></span>
                    <span data-status="${this.STATUS_PARTIAL}" class="lsx-quiz-icon __lspet__icon-checkmark2"></span>
                    <span data-status="${this.STATUS_WRONG}"   class="lsx-quiz-icon __lspet__icon-cross"></span>
                </div>
                <div class="lsx-quiz-column-main lsx-quiz-question-line"></div>
            `);
        }

        for (let iconElement of this.renderedScore.querySelectorAll(":scope > *")) {
            iconElement.classList.add("hidden");

            if (iconElement.dataset.status == this.status) {
                iconElement.classList.remove("hidden");
            }
        }

        // Render main column
        this.renderedMain.replaceChildren();
        
        for (let element of this.renderMain()) {
            this.renderedMain.append(element);
        }
        
        return [this.renderedScore, this.renderedMain];
    }

    /**
     * Abstract method for sub-classes to create or update HTML content for the main column.
     * The content will be rendered directly into a `<div class="lsx-quiz-column-main lsx-quiz-question-line">`
     * that is styled as a responsive flexbox (column on small screens, row on large screens).
     * 
     * @returns {Element[]} Rendered DOM elements (always the same)
     */
    renderMain() {
        // Must be overridden
        return [];
    }

    /**
     * Utility method for sub-classes to read the common attributes with correction hints from
     * a source element. This interprets the attributes `points`, `correct`, `partially-correct`
     * and `wrong` to determine how a given answer should be evaluated.
     * 
     * @param {Element} element `<lsx-...>` DOM element
     * @param {number} defaultStatus Status when not defined in the HTML (see constants)
     * @returns {Object} An object with `status` and `points` attributes
     */
    readStatusAndPoints(element, defaultStatus) {
        let result = {
            status: defaultStatus,
            points: parseFloat(element.getAttribute("points")) || NaN,
        };
    
        if (element.hasAttribute("correct"))                result.status = this.STATUS_CORRECT;
        else if (element.hasAttribute("partially-correct")) result.status = this.STATUS_PARTIAL;
        else if (element.hasAttribute("partialy-correct"))  result.status = this.STATUS_PARTIAL;      // Typo up to version 3.0.2
        else if (element.hasAttribute("wrong"))             result.status = this.STATUS_WRONG;
    
        if (isNaN(result.points)) {
            if (result.status === this.STATUS_CORRECT)      result.points = 1;
            else if (result.status === this.STATUS_PARTIAL) result.points = 0.5;
            else if (result.status === this.STATUS_WRONG)   result.points = -1;
            else result.points = 0;
        }
    
        return result;
    }

    /**
     * Utility method for sub-classes to easily find out, if the quiz is running in normal mode
     * or in correction mode. Returns true in normal mode, which means, that the quiz element
     * is enabled and can be manipulated by the learner.
     * 
     * @returns {boolean} Whether the quiz element can be manipulated by the learner
     */
    isEnabled() {
        return this.question.exercise.quiz.mode === this.question.exercise.quiz.MODE_NORMAL;
    }
}

/**
 * Multiple-choice or single-choice question where the learner must check the correct answers
 * in a list.
 */
class ChoiceQuestion extends Question {
    TYPE_SINGLE_CHOICE   = "single-choice";
    TYPE_MULTIPLE_CHOICE = "multiple-choice";

    labelLength = "";

    /**
     * Called from the parent class `createFromHtmlSource()` method to read question type specific
     * content from the HTML source into the object instance.
     * 
     * @param {Element} questionElement `<lsx-question>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     */
    parseHtmlSource(questionElement, plugin) {
        // Read properties
        this.labelLength = questionElement.getAttribute("label-length")    || "";

        // Populate lines attribute
        for (let answerElement of questionElement.querySelectorAll(":scope > lsx-answer")) {
            let questionLineElement = document.createElement("lsx-question-line");
            answerElement.replaceWith(questionLineElement);
            questionLineElement.append(answerElement);
        }

        for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
            this.lines.push(ChoiceQuestion.Line.createFromHtmlSource(questionLineElement, plugin, this));
        }
    }

    static Line = class extends QuestionLine {
        answers = [];

        /**
         * Factory method that creates a new instance based on the given HTML source.
         * @param {Element} questionLineElement `<lsx-question-line>` DOM element
         * @param {LS_Plugin_ExtraTags} plugin Plugin main object
         * @param {Question} question Parent question object
         * @returns {QuestionLine} New instance
         */
        static createFromHtmlSource(questionLineElement, plugin, question) {
            let questionLine = new ChoiceQuestion.Line();
            questionLine.plugin     = plugin;
            questionLine.lsxElement = questionLineElement;
            questionLine.question   = question;

            for (let answerElement of questionLineElement.querySelectorAll(":scope > lsx-answer")) {
                let {status, points} = questionLine.readStatusAndPoints(answerElement, questionLine.STATUS_WRONG);

                if (status === questionLine.STATUS_WRONG && !answerElement.hasAttribute("points")) {
                    points = question.wrongPoints;
                }

                questionLine.answers.push({
                    ticked: false,
                    label:  [...answerElement.childNodes],
                    evaluationRule: {
                        status: status,
                        points: points,
                    },
                    currentEvaluation: {
                        status: questionLine.STATUS_UNKNOWN,
                        points: 0,
                    },
                    rendered: {
                        container: null,
                        button:    null,
                        label:     null,
                    },
                });
            }

            return questionLine;
        }

        /**     
         * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
         * This will be called before a rerender.
         */
        evaluateAnswers() {
            super.evaluateAnswers();

            for (let answer of this.answers) {
                // Evaluate answer
                if (answer.ticked) {
                    answer.currentEvaluation.status = answer.evaluationRule.status;
                    answer.currentEvaluation.points = answer.evaluationRule.points;
                } else if (answer.evaluationRule.status === this.STATUS_CORRECT) {
                    // Mark not ticked correct answer
                    answer.currentEvaluation.status = this.STATUS_WRONG;
                    answer.currentEvaluation.points = this.question.emptyPoints;
                }

                // Update max score
                if (answer.evaluationRule.status === this.STATUS_CORRECT) {
                    this.maxScore += answer.evaluationRule.points;
                }

                // Update actual score
                this.updateStatus(answer.currentEvaluation.status);
                this.actualScore += answer.currentEvaluation.points;
            }
        }
        
        /**
         * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
         */
        resetEvaluation() {
            super.resetEvaluation();
            
            for (let answer of this.answers) {
                answer.ticked = false;
                answer.currentEvaluation.status = this.STATUS_UNKNOWN;
                answer.currentEvaluation.points = 0;

                if (answer.evaluationRule.status === this.STATUS_CORRECT) {
                    this.maxScore += answer.evaluationRule.points;
                }
            }
        }

        /**
         * Called from the parent class `render()` method to render the actual question line content.
         * Will be rendered into a responsive flexbox in the main column of the quiz.
         * 
         * @returns {Element[]} Rendered DOM elements (always the same)
         */
        renderMain() {
            return this.answers.map(this.renderAnswer.bind(this));
        }

        /**
         * Render a single answer, consisting of a checkbox and label.
         * @returns {Element} Rendered DOM element (always the same)
         */
        renderAnswer(answer) {
            // Render overall structure
            if (!answer.rendered.container || !answer.rendered.button || !answer.rendered.label) {
                let styleLabelLength  = this.question.labelLength  ? `width: ${this.question.labelLength}; max-width: 100%;`  : "";

                answer.rendered.container = parseHtml(`
                    <div class="lsx-quiz-choice-answer" data-enabled="">
                        <div class="lsx-quiz-choice-button"></div>
                        <div class="lsx-quiz-choice-label" style="${styleLabelLength}"></div>
                    </div>
                `)[0];

                answer.rendered.button = answer.rendered.container.querySelector(".lsx-quiz-choice-button");
                answer.rendered.label  = answer.rendered.container.querySelector(".lsx-quiz-choice-label");

                // Click event listener
                answer.rendered.container.addEventListener("click", () => {
                    if (!this.isEnabled()) return;

                    answer.ticked = !answer.ticked;
                    this.renderAnswer(answer);

                    if (this.question.type === this.question.TYPE_SINGLE_CHOICE) {
                        for (let questionLine of this.question.lines) {
                            for (let otherAnswer of questionLine.answers) {
                                if (otherAnswer === answer) continue;
                                otherAnswer.ticked = false;
                                this.renderAnswer(otherAnswer);
                            }
                        }
                    }
                });
            }

            answer.rendered.container.dataset.enabled = this.isEnabled();

            // Render icon
            let icon1 = "__lspet__icon-radio-checked2";
            let icon2 = "__lspet__icon-radio-unchecked";

            if (this.question.type === this.question.TYPE_MULTIPLE_CHOICE) {
                icon1 = "__lspet__icon-checkbox-checked";                
                icon2 = "__lspet__icon-checkbox-unchecked";
            }

            answer.rendered.button.innerHTML = `<span class="lsx-quiz-icon ${answer.ticked ? icon1 : icon2}"></span>`;

            // Render label
            answer.rendered.label.innerHTML = "";
            answer.rendered.label.append(...answer.label);
            answer.rendered.label.classList.remove("lsx-quiz-highlight-wrong");
            answer.rendered.label.classList.remove("lsx-quiz-highlight-partial");

            if (answer.currentEvaluation.status === this.STATUS_WRONG) {
                answer.rendered.label.classList.add("lsx-quiz-highlight-wrong");
            } else if (answer.currentEvaluation.status === this.STATUS_PARTIAL) {
                answer.rendered.label.classList.add("lsx-quiz-highlight-partial");
            }

            // Return rendered answer
            return answer.rendered.container;
        }
    }
}

/**
 * Assignment question where the learner must assign the correct answers to one ore more items.
 * The items can be simple text lines, images or any other HTML content and the answers must
 * be chosen from a drop-down list.
 */
class AssignmentQuestion extends Question {
    selectLength   = "";
    selectPosition = "";
    selectStyle    = "";
    emptyAnswer    = "";

    /**
     * Called from the parent class `createFromHtmlSource()` method to read question type specific
     * content from the HTML source into the object instance.
     * 
     * @param {Element} questionElement `<lsx-question>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     */
    parseHtmlSource(questionElement, plugin) {
        // Read properties
        this.labelLength    = questionElement.getAttribute("label-length")    || "";
        this.selectLength   = questionElement.getAttribute("select-length")   || "";
        this.selectPosition = questionElement.getAttribute("select-position") || "after";
        this.selectStyle    = questionElement.getAttribute("select-style")    || "";
        this.emptyAnswer    = questionElement.getAttribute("empty-answer")    || "---";

        // Populate lines attribute
        for (let assignmentElement of questionElement.querySelectorAll(":scope > lsx-assignment")) {
            if (!assignmentElement.innerHTML.trim()) continue;

            let questionLineElement = document.createElement("lsx-question-line");
            assignmentElement.replaceWith(questionLineElement);
            questionLineElement.append(assignmentElement);
        }

        let allAssignmentElements = questionElement.querySelectorAll("lsx-assignment");

        for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
            this.lines.push(AssignmentQuestion.Line.createFromHtmlSource(questionLineElement, allAssignmentElements, plugin, this));
        }
    }

    static Line = class extends QuestionLine {
        assignments     = [];
        possibleAnswers = [];

        /**
         * Factory method that creates a new instance based on the given HTML source.
         * @param {Element} questionLineElement `<lsx-question-line>` DOM element
         * @param {Element[]} allAssignmentElements All `<lsx-assignment>` DOM elements of all lines
         * @param {LS_Plugin_ExtraTags} plugin Plugin main object
         * @param {Question} question Parent question object
         * @returns {QuestionLine} New instance
         */
        static createFromHtmlSource(questionLineElement, allAssignmentElements, plugin, question) {
            let questionLine = new AssignmentQuestion.Line();
            questionLine.plugin     = plugin;
            questionLine.lsxElement = questionLineElement;
            questionLine.question   = question;

            for (let assignmentElement of allAssignmentElements) {
                let answer = (assignmentElement.getAttribute("answer") || "").trim();
                if (!answer) continue;
                questionLine.possibleAnswers.push(answer);
            }

            questionLine.possibleAnswers = [...new Set(questionLine.possibleAnswers)];
            questionLine.possibleAnswers.sort();
            questionLine.possibleAnswers.unshift(questionLine.question.emptyAnswer);

            for (let assignmentElement of questionLineElement.querySelectorAll(":scope > lsx-assignment")) {
                if (!assignmentElement.innerHTML.trim()) continue;

                let expectedAnswer = (assignmentElement.getAttribute("answer") || "").trim();
                let evaluationRules = {};

                evaluationRules[questionLine.question.emptyAnswer] = {
                    status: questionLine.STATUS_WRONG,
                    points: questionLine.question.emptyPoints,
                }

                for (let otherAssignmentElement of allAssignmentElements) {
                    let otherAnswer = (otherAssignmentElement.getAttribute("answer") || "").trim();
                    if (!otherAnswer) continue;

                    evaluationRules[otherAnswer] = {
                        status: questionLine.STATUS_WRONG,
                        points: questionLine.question.wrongPoints,
                    }

                    if (otherAssignmentElement === assignmentElement || otherAnswer === expectedAnswer || !otherAssignmentElement.innerHTML.trim()) {
                        let status = (otherAssignmentElement === assignmentElement || otherAnswer === expectedAnswer) ? questionLine.STATUS_CORRECT : questionLine.STATUS_WRONG;
                        evaluationRules[otherAnswer] = questionLine.readStatusAndPoints(assignmentElement, status);
                    }
                }

                questionLine.assignments.push({
                    label:           [...assignmentElement.childNodes],
                    selectedAnswer:  question.emptyAnswer,
                    expectedAnswer:  expectedAnswer,
                    evaluationRules: evaluationRules,
                    currentEvaluation: {
                        status: questionLine.STATUS_UNKNOWN,
                        points: 0,
                    },
                    rendered: {
                        container: null,
                        label:     null,
                        button:    null,
                        selected:  null,
                        expected:  null,
                    },
                });
            }

            return questionLine;
        }

        /**     
         * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
         * This will be called before a rerender.
         */
        evaluateAnswers() {
            super.evaluateAnswers();
            
            for (let assignment of this.assignments) {
                // Evaluate answer
                let evaluationRule = assignment.evaluationRules[assignment.selectedAnswer];
                assignment.currentEvaluation.status = evaluationRule.status;
                assignment.currentEvaluation.points = evaluationRule.points;

                // Update actual score
                this.updateStatus(assignment.currentEvaluation.status);
                this.actualScore += assignment.currentEvaluation.points;

                // Update max score
                let maxScore = 0;

                for (let key of Object.keys(assignment.evaluationRules)) {
                    maxScore = Math.max(maxScore, assignment.evaluationRules[key].points);
                }

                this.maxScore += maxScore;
            }
        }
        
        /**
         * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
         */
        resetEvaluation() {
            super.resetEvaluation();

            for (let assignment of this.assignments) {
                // Reset actual score
                assignment.selectedAnswer = this.question.emptyAnswer;
                assignment.currentEvaluation.status = this.STATUS_UNKNOWN;
                assignment.currentEvaluation.points = 0;

                // Update max score
                let maxScore = 0;

                for (let key of Object.keys(assignment.evaluationRules)) {
                    maxScore = Math.max(maxScore, assignment.evaluationRules[key].points);
                }

                this.maxScore += this.maxScore;
            }
        }

        /**
         * Called from the parent class `render()` method to render the actual question line content.
         * Will be rendered into a responsive flexbox in the main column of the quiz.
         * 
         * @returns {Element[]} Rendered DOM elements (always the same)
         */
        renderMain() {
            return this.assignments.map(this.renderAssignment.bind(this));
        }

        /**
         * Render a single assignment, consisting of a label and a dropdown.
         * @returns {Element} Rendered DOM element (always the same)
         */
        renderAssignment(assignment) {
            // Render overall structure
            if (!assignment.rendered.container || !assignment.rendered.label || !assignment.rendered.button || !assignment.rendered.expected) {
                let styleLabelLength  = this.question.labelLength  ? `flex-basis: ${this.question.labelLength};`  : "";
                let styleSelectLength = this.question.selectLength ? `max-width: ${this.question.selectLength};` : "";

                assignment.rendered.container = parseHtml(`
                    <div class="lsx-quiz-assignment select-position-${this.question.selectPosition}" data-enabled="">
                        <div class="lsx-quiz-assignment-label" style="${styleLabelLength}"></div>
                        <div class="lsx-quiz-assignment-answer" style="${styleSelectLength}">
                            <div class="dropdown">
                                <button
                                    class          = "btn btn-light dropdown-toggle"
                                    type           = "button"
                                    data-bs-toggle = "dropdown"
                                    aria-expanded  = "false"
                                    style          = "${this.question.selectStyle}"
                                >
                                    <!-- Selected answer -->
                                    <div style="display: inline-block; vertical-align: middle;">
                                        <div class="lsx-quiz-assignment-selected"></div>
                                        <div class="lsx-quiz-assignment-expected"></div>
                                    </div>
                                </button>
                                <ul class="dropdown-menu">
                                    ${
                                        this.possibleAnswers.map(
                                            answer => `<li><button class="dropdown-item" type="button" data-answer="${answer}">${answer}</button></li>`
                                        ).join("\n")
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                `)[0];

                assignment.rendered.label    = assignment.rendered.container.querySelector(".lsx-quiz-assignment-label");
                assignment.rendered.button   = assignment.rendered.container.querySelector(".lsx-quiz-assignment-answer > .dropdown > button");
                assignment.rendered.selected = assignment.rendered.container.querySelector(".lsx-quiz-assignment-selected");
                assignment.rendered.expected = assignment.rendered.container.querySelector(".lsx-quiz-assignment-expected");

                // Click event listeners
                for (let answerButton of assignment.rendered.container.querySelectorAll(".dropdown-menu button")) {
                    answerButton.addEventListener("click", () => {
                        assignment.selectedAnswer = answerButton.dataset.answer;
                        this.renderAssignment(assignment);
                    });
                }
            }

            assignment.rendered.container.dataset.enabled = this.isEnabled();

            if (this.isEnabled()) {
                assignment.rendered.button.classList.remove("disabled");
            } else {
                assignment.rendered.button.classList.add("disabled");
            }

            // Render label
            assignment.rendered.label.innerHTML = "";
            assignment.rendered.label.append(...assignment.label);

            // Render dropdown button with selected answer
            if (assignment.selectedAnswer !== this.question.emptyAnswer) {
                assignment.rendered.selected.innerHTML = assignment.selectedAnswer;
            } else {
                assignment.rendered.selected.innerHTML = "";
            }

            assignment.rendered.selected.classList.remove("lsx-quiz-highlight-wrong");
            assignment.rendered.selected.classList.remove("lsx-quiz-highlight-partial");

            if (assignment.currentEvaluation.status === this.STATUS_WRONG) {
                assignment.rendered.selected.classList.add("lsx-quiz-highlight-wrong");
            } else if (assignment.currentEvaluation.status === this.STATUS_PARTIAL) {
                assignment.rendered.selected.classList.add("lsx-quiz-highlight-partial");
            }

            // Render expected answer
            if ([this.STATUS_PARTIAL, this.STATUS_WRONG].includes(assignment.currentEvaluation.status)) {
                assignment.rendered.expected.innerHTML = assignment.expectedAnswer;
            } else {
                assignment.rendered.expected.replaceChildren();
            }

            // Return rendered assignment
            return assignment.rendered.container;
        }
    }
}

/**
 * Gap-text question where the learner must fill in the blanks in a text.
 */
class GapTextQuestion extends Question {
    mode = "";

    /**
     * Called from the parent class `createFromHtmlSource()` method to read question type specific
     * content from the HTML source into the object instance.
     * 
     * @param {Element} questionElement `<lsx-question>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     */
    parseHtmlSource(questionElement, plugin) {
        // Read properties
        this.mode = (questionElement.getAttribute("mode") || "").toLowerCase();

        // Split HTML lines into single `<lsx-question-line>` elements
        // NOTE: Be extra careful to not destroy the DOM elements, as they might have event listeners attached!
        if (["source-code", "split-lines"].includes(this.mode)) {
            let oldParentElement = questionElement;
            let linebreak = determineLinebreaks(questionElement.innerHTML);

            while (linebreak && oldParentElement) {
                let newParentElement = document.createElement("lsx-question-line");
                let moveNodes = false;

                for (let childNode of [...oldParentElement.childNodes]) {
                    if (!moveNodes && childNode.nodeType === Node.TEXT_NODE && childNode.textContent.includes(linebreak)) {
                        let textLines = childNode.textContent.split(linebreak);
                        childNode.textContent = textLines[0];

                        if (textLines.length > 1) {
                            let textNode = document.createTextNode(textLines.slice(1).join(linebreak));
                            newParentElement.append(textNode);
                        }

                        moveNodes = true;
                        continue;
                    }

                    if (moveNodes) {
                        oldParentElement.removeChild(childNode);
                        newParentElement.append(childNode);
                    }
                }

                if (moveNodes) {
                    questionElement.append(newParentElement);
                    oldParentElement = newParentElement;
                } else {
                    oldParentElement = null;
                }
            }

            for (let questionLineElement of [...questionElement.querySelectorAll(":scope > lsx-question-line")]) {
                if (!questionLineElement.innerHTML.trim()) questionLineElement.remove();
                else break;
            }

            for (let questionLineElement of [...questionElement.querySelectorAll(":scope > lsx-question-line")].reverse()) {
                if (!questionLineElement.innerHTML.trim()) questionLineElement.remove();
                else break;
            }
        }

        // Treat leading whitespace of each line
        if (this.mode === "split-lines") {
            for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
                if (questionLineElement.firstChild.nodeType === Node.TEXT_NODE) {
                    questionLineElement.firstChild.textContent = questionLineElement.firstChild.textContent.trimStart();
                }
            }
        } else if (this.mode === "source-code") {
            let commonPrefix = null;

            for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
                if (questionLineElement.firstChild.nodeType === Node.TEXT_NODE && questionLineElement.firstChild.textContent.trim()) {
                    let whitespace = questionLineElement.firstChild.textContent.match(/^\s*/);
                    if (whitespace) whitespace = whitespace[0];
                    else whitespace = "";

                    if (commonPrefix === null || commonPrefix.startsWith(whitespace)) commonPrefix = whitespace;
                }
            }

            for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
                if (questionLineElement.firstChild.nodeType === Node.TEXT_NODE) {
                    // Strip HTML idention
                    if (commonPrefix) {
                        let lineLength = questionLineElement.firstChild.textContent.length;
                        questionLineElement.firstChild.textContent = questionLineElement.firstChild.textContent.slice(commonPrefix.length, lineLength);
                    }

                    // Replace leading whitespace
                    if (questionLineElement.firstChild.textContent.startsWith(commonPrefix)) {
                        questionLineElement.firstChild.textContent = questionLineElement.firstChild.textContent.slice(commonPrefix.length);
                    }

                    // Replace remaining spaces with &nbsp;
                    questionLineElement.firstChild.textContent = questionLineElement.firstChild.textContent.replaceAll("\t", String.fromCodePoint(160).repeat(4));
                    questionLineElement.firstChild.textContent = questionLineElement.firstChild.textContent.replaceAll(" ", String.fromCodePoint(160));
                }
            }
        }

        // Move all children into a single `<lsx-question-line>`, if none exists
        if (!questionElement.querySelector(":scope > lsx-question-line")) {
            let questionLineElement = document.createElement("question-line");
            questionLineElement.append(...questionElement.childNodes);
            questionElement.append(questionLineElement);
        }

        // Populate lines attribute
        for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
            questionLineElement.normalize();
            this.lines.push(GapTextQuestion.Line.createFromHtmlSource(questionLineElement, plugin, this));
        }
    }

    static Line = class extends QuestionLine {
        rendered   = null;
        childNodes = [];
        gaps       = new Map();

        /**
         * Factory method that creates a new instance based on the given HTML source.
         * @param {Element} questionLineElement `<lsx-question-line>` DOM element
         * @param {LS_Plugin_ExtraTags} plugin Plugin main object
         * @param {Question} question Parent question object
         * @returns {QuestionLine} New instance
         */
        static createFromHtmlSource(questionLineElement, plugin, question) {
            let questionLine = new GapTextQuestion.Line();
            questionLine.plugin     = plugin;
            questionLine.lsxElement = questionLineElement;
            questionLine.question   = question;
            questionLine.childNodes = [...questionLineElement.childNodes];

            for (let gapElement of questionLineElement.querySelectorAll("lsx-gap")) {
                let evaluationRules = [];

                if (gapElement.hasAttribute("answer") || gapElement.hasAttribute("regexp")) {
                    let {status, points} = questionLine.readStatusAndPoints(gapElement, questionLine.STATUS_CORRECT);

                    evaluationRules.push({
                        answer: gapElement.getAttribute("answer") || "",
                        regexp: gapElement.getAttribute("regexp") || "",
                        status: status,
                        points: points,
                    });
                }

                for (let answerElement of gapElement.querySelectorAll("lsx-answer")) {
                    let {status, points} = questionLine.readStatusAndPoints(answerElement, questionLine.STATUS_CORRECT);

                    evaluationRules.push({
                        answer: answerElement.innerHTML.trim(),
                        regexp: answerElement.getAttribute("regexp") || "",
                        status: status,
                        points: points,
                    });
                }

                let length = gapElement.getAttribute("length") || 0;

                if (!length) {
                    for (let evaluationRule of evaluationRules) {
                        if (!evaluationRule.answer) continue;
                        length = Math.max(length, evaluationRule.answer.length);
                    }

                    length = length ? `${length}em` : "";
                }

                questionLine.gaps.set(gapElement, {
                    ignoreCase:      gapElement.hasAttribute("ignore-case"),
                    ignoreSpaces:    gapElement.hasAttribute("ignore-spaces"),
                    validate:        gapElement.getAttribute("validate") || "",
                    length:          length,
                    evaluationRules: evaluationRules,
                    currentEvaluation: {
                        status:   questionLine.STATUS_UNKNOWN,
                        points:   0,
                        epxected: "",
                    },
                    rendered: {
                        input:    null,
                        expected: null,
                    },
                });
            }

            return questionLine;
        }

        /**     
         * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
         * This will be called before a rerender.
         */
        evaluateAnswers() {
            super.evaluateAnswers();
            
            for (let gapElement of this.gaps.keys()) {
                // Evaluate answer
                let gap = this.gaps.get(gapElement);

                gap.currentEvaluation.status   = this.STATUS_UNKNOWN;
                gap.currentEvaluation.points   = 0;
                gap.currentEvaluation.expected = "";

                let answer = gap.rendered.input ? gap.rendered.input.value.trim() : "";
                if (gap.ignoreCase)   answer = answer.toLowerCase();
                if (gap.ignoreSpaces) answer = answer.replaceAll(/\s/g, "");

                let callbackParameters = {
                    answer:          answer,
                    evaluation:      gap.currentEvaluation,
                    gapElement:      gapElement,
                    questionElement: this.question.lsxElement,
                    exerciseElement: this.question.exercise.lsxElement,
                    quizElement:     this.question.exercise.quiz.lsxElement,
                    status: {
                        unknown: this.STATUS_UNKNOWN,
                        correct: this.STATUS_CORRECT,
                        partial: this.STATUS_PARTIAL,
                        wrong:   this.STATUS_WRONG
                    },
                }
                
                if (gap.validate) {
                    let callbackFunction = window[gap.validate];
                    if (callbackFunction instanceof Function) callbackFunction(callbackParameters);
                }

                if (gap.currentEvaluation.status === this.STATUS_UNKNOWN) {
                    let event = new CustomEvent("lsx-quiz-validation", {
                        // Bubbling doesn't make sense, because the element is detached from its original parent
                        bubbles: false,
                        detail:  callbackParameters,
                    });

                    gapElement.dispatchEvent(event);
                }

                if (gap.currentEvaluation.status === this.STATUS_UNKNOWN) {
                    let ruleMatched = false;
                    let expectedAnswer = "";

                    for (let evaluationRule of gap.evaluationRules) {
                        if (evaluationRule.regexp) {
                            ruleMatched = answer.match(evaluationRule.regexp)

                            if (!expectedAnswer && evaluationRule.status === this.STATUS_CORRECT) {
                                expectedAnswer = evaluationRule.answer || evaluationRule.regexp;
                            }
                        } else if (evaluationRule.answer) {
                            let possibleAnswer = evaluationRule.answer;
                            if (gap.ignoreCase)   possibleAnswer = possibleAnswer.toLowerCase();
                            if (gap.ignoreSpaces) possibleAnswer = possibleAnswer.replaceAll(/\s/g, "");
                            ruleMatched = answer === possibleAnswer;

                            if (!expectedAnswer && evaluationRule.status === this.STATUS_CORRECT) {
                                expectedAnswer = evaluationRule.answer;
                            }
                        }
    
                        if (ruleMatched) {
                            gap.currentEvaluation.status = evaluationRule.status;
                            gap.currentEvaluation.points = evaluationRule.points;

                            if (gap.currentEvaluation.status === this.STATUS_WRONG || gap.currentEvaluation.status === this.STATUS_PARTIAL) {
                                gap.currentEvaluation.expected = expectedAnswer;
                            }
    
                            break;
                        }
                    }

                    if (!ruleMatched) {
                        gap.currentEvaluation.status   = this.STATUS_WRONG;
                        gap.currentEvaluation.points   = answer ? this.question.wrongPoints : this.question.emptyPoints;
                        gap.currentEvaluation.expected = expectedAnswer;
                    }
                }

                // Update actual score
                this.updateStatus(gap.currentEvaluation.status);
                this.actualScore += gap.currentEvaluation.points;

                // Update max score
                let maxScore = 0;

                for (let evaluationRule of gap.evaluationRules) {
                    maxScore = Math.max(maxScore, evaluationRule.points);
                }

                this.maxScore += maxScore;
            }
        }
        
        /**
         * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
         */
        resetEvaluation() {
            super.resetEvaluation();

            for (let gapElement of this.gaps.keys()) {
                let gap = this.gaps.get(gapElement);

                // Reset answer
                if (gap.rendered.input) gap.rendered.input.value = "";

                // Reset actual score
                gap.currentEvaluation.status   = this.STATUS_UNKNOWN;
                gap.currentEvaluation.points   = 0;
                gap.currentEvaluation.expected = "";

                // Update max score
                let maxScore = 0;

                for (let evaluationRule of gap.evaluationRules) {
                    maxScore = Math.max(maxScore, evaluationRule.points);
                }

                this.maxScore += maxScore;
            }
        }

        /**
         * Called from the parent class `render()` method to render the actual question line content.
         * Will be rendered into a responsive flexbox in the main column of the quiz.
         * 
         * @returns {Element[]} Rendered DOM elements (always the same)
         */
        renderMain() {
            // Render input fields
            for (let gapElement of this.gaps.keys()) {
                let gap = this.gaps.get(gapElement);

                // Input field
                if (!gap.rendered.input) {
                    let styleLength = gap.length ? `width: ${gap.length};` : "";
                    gap.rendered.input = parseHtml(`<input class="lsx-quiz-gap-text-input" style="${styleLength}"></input>`)[0];
                }

                gap.rendered.input.classList.remove("lsx-quiz-highlight-wrong");
                gap.rendered.input.classList.remove("lsx-quiz-highlight-partial");
    
                if (gap.currentEvaluation.status === this.STATUS_WRONG) {
                    gap.rendered.input.classList.add("lsx-quiz-highlight-wrong");
                } else if (gap.currentEvaluation.status === this.STATUS_PARTIAL) {
                    gap.rendered.input.classList.add("lsx-quiz-highlight-partial");
                }

                if (this.isEnabled()) {
                    gap.rendered.input.removeAttribute("disabled");
                } else {
                    gap.rendered.input.setAttribute("disabled", true);
                }

                // Expected answer
                if (!gap.rendered.expected) {
                    gap.rendered.expected = parseHtml(`<span class="lsx-quiz-gap-text-expected"></span>`)[0];
                }

                if (gap.currentEvaluation.expected) {
                    gap.rendered.expected.innerHTML = escapeHTML(gap.currentEvaluation.expected);
                } else {
                    gap.rendered.expected.innerHTML = "";
                }
            }

            // Render main element with child nodes
            if (!this.rendered) {
                this.rendered = parseHtml(`<div class="lsx-quiz-gap-text"></div>`)[0];
            }

            this.rendered.dataset.mode = this.question.mode;

            // TODO: Bug - lsx-gap must be searched transitive!
            let childNodes = this.childNodes.map(childNode => {
                let gap = this.gaps.get(childNode);
                if (!gap) return childNode;

                let spanElement = document.createElement("span");
                spanElement.append(gap.rendered.input);
                spanElement.append(gap.rendered.expected);
                return spanElement;
            });

            this.rendered.replaceChildren(...childNodes);
            return [this.rendered];
        }
    }
}

/**
 * Free-text question where the learner must formulate a textual answer.
 */
class FreeTextQuestion extends Question {
    /**
     * Called from the parent class `createFromHtmlSource()` method to read question type specific
     * content from the HTML source into the object instance.
     * 
     * @param {Element} questionElement `<lsx-question>` DOM element
     * @param {LS_Plugin_ExtraTags} plugin Plugin main object
     */
    parseHtmlSource(questionElement, plugin) {
        // Populate lines attribute
        for (let freeTextElement of questionElement.querySelectorAll(":scope > lsx-free-text")) {
            let questionLineElement = document.createElement("lsx-question-line");
            freeTextElement.replaceWith(questionLineElement);
            questionLineElement.append(freeTextElement);
        }

        for (let questionLineElement of questionElement.querySelectorAll(":scope > lsx-question-line")) {
            this.lines.push(FreeTextQuestion.Line.createFromHtmlSource(questionLineElement, plugin, this));
        }
    }

    static Line = class extends QuestionLine {
        /**
         * Factory method that creates a new instance based on the given HTML source.
         * @param {Element} questionLineElement `<lsx-question-line>` DOM element
         * @param {LS_Plugin_ExtraTags} plugin Plugin main object
         * @param {Question} question Parent question object
         * @returns {QuestionLine} New instance
         */
        static createFromHtmlSource(questionLineElement, plugin, question) {
            let questionLine = new FreeTextQuestion.Line();
            questionLine.plugin     = plugin;
            questionLine.lsxElement = questionLineElement;
            questionLine.question   = question;

            // TODO:
            return questionLine;
        }

        /**     
         * Evaluate the given answers and update the attributes `maxScore` and `actualScore` accordingly.
         * This will be called before a rerender.
         */
        evaluateAnswers() {
            super.evaluateAnswers();
            // TODO: Also consider this.question.emptyPoints/wrongPoints
        }
        
        /**
         * Reset evaluation when the learner wants to retry the quiz. This will be called before a rerender.
         */
        resetEvaluation() {
            super.resetEvaluation();
            // TODO:
        }

        /**
         * Called from the parent class `render()` method to render the actual question line content.
         * Will be rendered into a responsive flexbox in the main column of the quiz.
         * 
         * @returns {Element[]} Rendered DOM elements (always the same)
         */
        renderMain() {
            // TODO:
            return [];
        }
    }
}