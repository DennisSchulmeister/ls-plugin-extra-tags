/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-quiz>  custom tag.
 */
class LSX_Quiz {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        this._countQuizContents(html, plugin);

        this._render_lsx_quiz(html, plugin);
        this._render_lsx_exercise(html, plugin);
        this._render_lsx_question(html, plugin);
        this._render_lsx_answer(html, plugin);
        this._render_lsx_hint(html, plugin);
    }

    /**
     * Find each <lsx-quiz> and recursively count all its <lsx-exercise>.
     * Then traverse all <lsx-exercise> and count their <lsx-question>.
     * After that count all <lsx-answer>. Each element gets corresponding
     * data attributes set so that it is always clear to which quiz, exercise,
     * question or answer it belongs.
     *
     * For <lsx-answer> additionaly the `type` attribute of the parent
     * <lsx-question> is copied to `data-type`.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    _countQuizContents(html, plugin) {
        let quizNumber = 0;

        html.querySelectorAll("lsx-quiz").forEach(lsxQuizElement => {
            lsxQuizElement.dataset.quiz = ++quizNumber;
            let exerciseNumber = 0;

            lsxQuizElement.querySelectorAll(":scope > lsx-exercise").forEach(lsxExerciseElement => {
                lsxExerciseElement.dataset.quiz = quizNumber;
                lsxExerciseElement.dataset.exercise = ++exerciseNumber;
                let questionNumber = 0;

                lsxExerciseElement.querySelectorAll(":scope > lsx-question").forEach(lsxQuestionElement => {
                    lsxQuestionElement.dataset.quiz = quizNumber;
                    lsxQuestionElement.dataset.exercise = exerciseNumber;
                    lsxQuestionElement.dataset.question = ++questionNumber;
                    let answerNumber = 0;

                    lsxQuestionElement.querySelectorAll(":scope > lsx-answer").forEach(lsxAnswerElement => {
                        lsxAnswerElement.dataset.quiz = quizNumber;
                        lsxAnswerElement.dataset.exercise = exerciseNumber;
                        lsxAnswerElement.dataset.question = questionNumber;
                        lsxAnswerElement.dataset.answer = ++answerNumber;
                        lsxAnswerElement.dataset.type = lsxQuestionElement.getAttribute("type");
                    });
                });
            });
        });
    }

    /**
     * Replace all <lsx-quiz> with their HTML counterpart.
     *
     * Input:
     *
     *   <lsx-quiz prefix="Exercise #: ">
     *       …
     *   </lsx-quiz>
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    _render_lsx_quiz(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-quiz");

        lsxElements.forEach(lsxElement => {
            // Generate HTML structure
            let points = plugin.config.labelQuizPoints;
            points = points.replace("{1}", '<span class="lsx-quiz-actual-points" data-value="0">0</span>');
            points = points.replace("{2}", '<span class="lsx-quiz-max-points" data-value="0">0</span>');

            let newElement = parseHtml(`
                <div
                    class                   = "lsx-quiz"
                    data-correction-visible = "false"
                    data-exercise-prefix    = ""
                    data-quiz               = "${lsxElement.dataset.quiz}"
                >
                    <div
                        class     = "lsx-quiz-correction lsx-quiz-border-bottom"
                        data-quiz = "${lsxElement.dataset.quiz}"
                    >
                        <div class="lsx-quiz-total-percentage" data-value="0">0%</div>
                        <div class="lsx-quiz-total-points">
                            ${points}
                        </div>
                    </div>

                    <div
                        class     = "lsx-quiz-controls"
                        data-quiz = "${lsxElement.dataset.quiz}"
                    >
                        <div>
                            <button type="button" class="lsx-quiz-action-submit btn btn-dark">${plugin.config.labelQuizEvaluate}</button>
                            <button type="button" class="lsx-quiz-action-reset btn btn-light">${plugin.config.labelQuizNewTry}</button>
                        </div>
                    </div>
                </div>
            `)[0];

            if (lsxElement.attributes.prefix) {
                newElement.setAttribute("data-exercise-prefix", lsxElement.getAttribute("prefix"));
                lsxElement.removeAttribute("prefix");
            }

            plugin.copyAttributes(lsxElement, newElement);
            plugin.moveChildNodes(lsxElement, newElement);
            lsxElement.replaceWith(newElement);

            // Place overall quiz corrections and controls after everything else
            let quizCorrectionElement = newElement.querySelector(".lsx-quiz-correction");
            newElement.removeChild(quizCorrectionElement);
            newElement.append(quizCorrectionElement);

            let quizControlsElement = newElement.querySelector(".lsx-quiz-controls");
            newElement.removeChild(quizControlsElement);
            newElement.append(quizControlsElement);

            // Register event handlers
            let submitButton = quizControlsElement.querySelector(".lsx-quiz-action-submit");
            let resetButton = quizControlsElement.querySelector(".lsx-quiz-action-reset");

            submitButton.addEventListener("click", () => {
                // Broadcast events to make the exercises correct themselves
                plugin.broadcastCustomEvent(newElement, "lsx-quiz-correction-reset");
                plugin.broadcastCustomEvent(newElement, "lsx-quiz-answer-correct");
                newElement.dataset.correctionVisible = true;
            });

            resetButton.addEventListener("click", () => {
                // Broadcast events to reset all correction results
                plugin.broadcastCustomEvent(newElement, "lsx-quiz-correction-reset");
                plugin.broadcastCustomEvent(newElement, "lsx-quiz-answer-reset");
                newElement.dataset.correctionVisible = false;
            });

            let actualPointsElement = quizCorrectionElement.querySelector(".lsx-quiz-actual-points");
            let maxPointsElement = quizCorrectionElement.querySelector(".lsx-quiz-max-points");
            let totalPercentageElement = quizCorrectionElement.querySelector(".lsx-quiz-total-percentage");

            quizCorrectionElement.addEventListener("lsx-quiz-correction-reset", () => {
                this._onCorrectionScoreReset(actualPointsElement, maxPointsElement, totalPercentageElement);
            });

            quizCorrectionElement.addEventListener("lsx-quiz-correction-update", event => {
                this._onCorrectionScoreUpdate(event, actualPointsElement, maxPointsElement, totalPercentageElement);
            });
        });
    }

    /**
     * Replace all <lsx-exercise> with their HTML counterpart.
     *
     * Input:
     *
     *   <lsx-exercise title="Exercise Title">
     *       …
     *   </lsx-exercise>
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    _render_lsx_exercise(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-exercise");

        let prevQuiz = 0;
        let closedBorderTop = "";
        let margin = "";

        lsxElements.forEach(lsxElement => {
            // Generate HTML structure
            let quizElement = plugin.getParentRecursive(lsxElement, e => e.classList.contains("lsx-quiz")) || document.createElement("div");

            if (quizElement.dataset.quiz != prevQuiz) {
                prevQuiz = quizElement.dataset.quiz;
                margin = "p-0";
                closedBorderTop = "lsx-quiz-border-top";
            } else {
                margin = "p-0 pt-4";
                closedBorderTop = "";
            }

            let prefix = quizElement.dataset.exercisePrefix || "";
            prefix = prefix.replace("#", lsxElement.dataset.exercise);

            let points = plugin.config.labelQuizPoints;
            points = points.replace("{1}", '<span class="lsx-quiz-actual-points" data-value="0">0</span>');
            points = points.replace("{2}", '<span class="lsx-quiz-max-points" data-value="0">0</span>');

            let quizCorrectionElement = parseHtml(`
                <div
                    class         = "lsx-quiz-correction ${margin} ${closedBorderTop}"
                    data-quiz     = "${lsxElement.dataset.quiz}"
                    data-exercise = "${lsxElement.dataset.exercise}"
                >
                    <div>
                        ${points}
                    </div>
                </div>
            `)[0];

            let quizExerciseElement = parseHtml(`
                <div
                    class         = "lsx-quiz-exercise ${margin}"
                    data-quiz     = "${lsxElement.dataset.quiz}"
                    data-exercise = "${lsxElement.dataset.exercise}"
                >
                    <h2>${prefix} ${lsxElement.getAttribute("title") || ""}</h2>
                </div>
            `)[0];

            lsxElement.removeAttribute("title");

            plugin.copyAttributes(lsxElement, quizExerciseElement);
            lsxElement.replaceWith(quizCorrectionElement);
            quizCorrectionElement.after(quizExerciseElement);

            // Temporarily insert child elements with questions and answers,
            // so that they will be picked up by `_render_lsx_question()`
            // and `_render_lsx_answer()`.
            let lsxChildren = lsxElement.querySelectorAll("lsx-hint, lsx-question, lsx-answer");
            let insertAfterElement = quizExerciseElement;

            lsxChildren.forEach(lsxChild => {
                lsxChild.remove();
                insertAfterElement.after(lsxChild);
                insertAfterElement = lsxChild;
            });

            // Register event handlers
            let actualPointsElement = quizCorrectionElement.querySelector(".lsx-quiz-actual-points");
            let maxPointsElement = quizCorrectionElement.querySelector(".lsx-quiz-max-points");

            quizCorrectionElement.addEventListener("lsx-quiz-correction-reset", () => {
                this._onCorrectionScoreReset(actualPointsElement, maxPointsElement);
            });

            quizCorrectionElement.addEventListener("lsx-quiz-correction-update", event => {
                this._onCorrectionScoreUpdate(event, actualPointsElement, maxPointsElement);
            });
        });
    }

    /**
     * Replace all <lsx-question> with their HTML counterpart.
     *
     * Input:
     *
     *   <lsx-question
     *       type = "single-choice"
     *       text = "a) How does the Internet relate to the World Wide Web?"
     *   >
     *       …
     *   </lsx-question>
     *
     * Or with HTML-styled question text:
     *
     *   <lsx-question type="single-choice">
     *      <lsx-question-text>
     *          a) How does the Internet relate to the World Wide Web?
     *      </lsx-question-text>
     *      …
     *   </lsx-question>
     *
     * Attributes:
     *
     *   * `type`: `single-choice` or `multiple-choice`
     *   * `text`: Question text
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    _render_lsx_question(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-question");

        let prevQuiz = 0;
        let prevExercise = 0;
        let margin = "";

        lsxElements.forEach(lsxElement => {
            // Get margin
            if (lsxElement.dataset.quiz != prevQuiz
                    || lsxElement.dataset.exercise != prevExercise) {
                prevQuiz = lsxElement.dataset.quiz;
                prevExercise = lsxElement.dataset.exercise;
                margin = "";
            } else {
                margin = "mt-2";
            }

            // Get question type and text
            let questionType = lsxElement.getAttribute("type") || "multiple-choice";

            let questionTextHtml = "";
            let lsxQuestionTextElement = lsxElement.querySelector("lsx-question-text");

            if (lsxQuestionTextElement) {
                questionTextHtml = lsxQuestionTextElement.innerHTML;
            } else {
                questionTextHtml = `${lsxElement.getAttribute("text") || ""}`;
            }

            // Generate HTML structure
            let quizCorrectionElement = parseHtml(`
                <div
                    class         = "lsx-quiz-correction"
                    data-quiz     = "${lsxElement.dataset.quiz}"
                    data-exercise = "${lsxElement.dataset.exercise}"
                    data-question = "${lsxElement.dataset.question}"
                >
                </div>
            `)[0];

            let quizQuestionElement = parseHtml(`
                <div
                    class         = "lsx-quiz-question ${margin}"
                    data-type     = "${questionType}"
                    data-quiz     = "${lsxElement.dataset.quiz}"
                    data-exercise = "${lsxElement.dataset.exercise}"
                    data-question = "${lsxElement.dataset.question}"
                >
                    ${questionTextHtml}
                </div>
            `)[0];

            lsxElement.removeAttribute("type");
            lsxElement.removeAttribute("text");

            plugin.copyAttributes(lsxElement, quizQuestionElement);
            lsxElement.replaceWith(quizCorrectionElement);
            quizCorrectionElement.after(quizQuestionElement);
        });
    }

    /**
     * Replace all <lsx-answer> with their HTML counterpart.
     *
     * Input:
     *
     *   <lsx-answer correct>Correct Answer</lsx-answer>
     *   <lsx-answer partialy-correct>Partialy Correct Answer</lsx-answer>
     *   <lsx-answer wrong>Wrong Answer</lsx-answer>
     *   <lsx-answer>Neutral Answer</lsx-answer>
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    _render_lsx_answer(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-answer");

        lsxElements.forEach(lsxElement => {
            // Generate HTML structure
            let correction = "";
            let iconUnchecked = "";
            let iconChecked = "";

            if (lsxElement.hasAttribute("correct")) correction = "correct";
            else if (lsxElement.hasAttribute("partialy-correct")) correction = "partialy-correct";
            else if (lsxElement.hasAttribute("wrong")) correction = "wrong";
            else correction = "neutral";

            if (lsxElement.dataset.type.toLowerCase() === "multiple-choice") {
                iconUnchecked = "__lspet__icon-checkbox-unchecked";
                iconChecked   = "__lspet__icon-checkbox-checked";
            } else if (lsxElement.dataset.type.toLowerCase() === "single-choice") {
                iconUnchecked = "__lspet__icon-radio-unchecked";
                iconChecked   = "__lspet__icon-radio-checked2";
            }

            let quizCorrectionElement = parseHtml(`
                <div
                    class         = "lsx-quiz-correction"
                    data-quiz     = "${lsxElement.dataset.quiz}"
                    data-exercise = "${lsxElement.dataset.exercise}"
                    data-question = "${lsxElement.dataset.question}"
                    data-answer   = "${lsxElement.dataset.answer}"
                    data-type     = "${lsxElement.dataset.type}"
                    data-status   = ""
                    data-points   = "0"
                >
                    <span class="lsx-quiz-icon"></span>
                </div>
            `)[0];

            let quizSelectElement = parseHtml(`
                <div
                    class               = "lsx-quiz-answer-select"
                    data-quiz           = "${lsxElement.dataset.quiz}"
                    data-exercise       = "${lsxElement.dataset.exercise}"
                    data-question       = "${lsxElement.dataset.question}"
                    data-answer         = "${lsxElement.dataset.answer}"
                    data-type           = "${lsxElement.dataset.type}"
                    data-correction     = "${correction}"
                    data-icon-unchecked = "${iconUnchecked}"
                    data-icon-checked   = "${iconChecked}"
                >
                    <span class="lsx-quiz-icon ${iconUnchecked}"></span>
                </div>
            `)[0];

            let quizTextElement = parseHtml(`
                <div
                    class         = "lsx-quiz-answer-text"
                    data-quiz     = "${lsxElement.dataset.quiz}"
                    data-exercise = "${lsxElement.dataset.exercise}"
                    data-question = "${lsxElement.dataset.question}"
                    data-answer   = "${lsxElement.dataset.answer}"
                    data-type     = "${lsxElement.dataset.type}"
                >
                    ${lsxElement.innerHTML}
                </div>
            `)[0];

            lsxElement.removeAttribute("data-exercise");
            lsxElement.removeAttribute("data-answer");

            plugin.copyAttributes(lsxElement, quizTextElement);
            lsxElement.replaceWith(quizCorrectionElement);
            quizCorrectionElement.after(quizSelectElement);
            quizSelectElement.after(quizTextElement);

            // Register mouse event handlers
            quizSelectElement.addEventListener("mouseover", event => this._onAnswerCheckHover(event, true));
            quizSelectElement.addEventListener("mouseout", event => this._onAnswerCheckHover(event, false));
            quizSelectElement.addEventListener("click", event => this._onAnswerCheckClick(event));

            quizTextElement.addEventListener("mouseover", event => this._onAnswerCheckHover(event, true));
            quizTextElement.addEventListener("mouseout", event => this._onAnswerCheckHover(event, false));
            quizTextElement.addEventListener("click", event => this._onAnswerCheckClick(event));

            // Register correction event handlers
            quizSelectElement.addEventListener("lsx-quiz-answer-reset", event => this._onAnswerReset(event));
            quizSelectElement.addEventListener("lsx-quiz-answer-correct", event => this._onAnswerCorrect(event, plugin));

            quizTextElement.addEventListener("lsx-quiz-answer-reset", event => this._onAnswerReset(event));
            quizTextElement.addEventListener("lsx-quiz-answer-correct", event => this._onAnswerCorrect(event, plugin));

            quizCorrectionElement.addEventListener("lsx-quiz-correction-reset", event => this._onCorrectionIconReset(event));
            quizCorrectionElement.addEventListener("lsx-quiz-correction-update", event => this._onCorrectionIconUpdate(event));
        });
    }

    /**
     * Replace all <lsx-hint> with their HTML counterpart.
     *
     * Input:
     *
     *   <lsx-hint>
     *      This is a hint for an exercise or question.
     *   </lsx-hint>
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    _render_lsx_hint(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-hint");

        lsxElements.forEach(lsxElement => {
            let quizCorrectionElement = parseHtml(`
                <div class="lsx-quiz-correction"></div>
            `)[0];

            let quizHintElement = parseHtml(`
                <div class ="lsx-quiz-hint"></div>
            `)[0];

            plugin.copyAttributes(lsxElement, quizHintElement);
            plugin.moveChildNodes(lsxElement, quizHintElement);
            lsxElement.replaceWith(quizCorrectionElement);
            quizCorrectionElement.after(quizHintElement);
        });
    }

    /**
     * Handle mouse hover on multiple-choice and single-choice answers.
     *
     * @param  {DOMEvent} event The original DOM event
     * @param  {Boolean} hovering `true`, if the mosue is hovering the answer
     */
    _onAnswerCheckHover(event, hovering) {
        // Search real target element
        let targetElement = event.target;

        while (targetElement && !targetElement.dataset.answer) {
            targetElement = targetElement.parentElement;
        }

        // Don't hover if the target element is inactive
        if (targetElement.dataset.inactive) {
            hovering = false;
        }

        // Add or remove `hover` class to all related elements
        let quiz = targetElement.dataset.quiz;
        let exercise = targetElement.dataset.exercise;
        let question = targetElement.dataset.question;
        let answer = targetElement.dataset.answer;

        let elements = document.querySelectorAll(`
            .lsx-quiz-answer-select[data-quiz='${quiz}'][data-exercise='${exercise}'][data-question='${question}'][data-answer='${answer}'],
            .lsx-quiz-answer-text[data-quiz='${quiz}'][data-exercise='${exercise}'][data-question='${question}'][data-answer='${answer}']
        `);

        elements.forEach(element => {
            if (hovering) {
                element.classList.add("hover");
            } else {
                element.classList.remove("hover");
            }
        });
    }

    /**
     * Handle mouse click on a multiple-choice or single-choice answer.
     *
     * @param  {DOMEvent} event The original DOM event
     */
    _onAnswerCheckClick(event) {
        // Search real target element
        let targetElement = event.target;

        while (targetElement && !targetElement.dataset.answer) {
            targetElement = targetElement.parentElement;
        }

        // Abort if the target element is inactive
        if (targetElement.dataset.inactive) return;

        // Mark all related elemeents as checked or unchecked
        let quiz = targetElement.dataset.quiz;
        let exercise = targetElement.dataset.exercise;
        let question = targetElement.dataset.question;
        let answer = targetElement.dataset.answer;

        let sameAnswerElements = document.querySelectorAll(`
            .lsx-quiz-answer-select[data-quiz='${quiz}'][data-exercise='${exercise}'][data-question='${question}'][data-answer='${answer}'],
            .lsx-quiz-answer-text[data-quiz='${quiz}'][data-exercise='${exercise}'][data-question='${question}'][data-answer='${answer}']
        `);

        let otherAnswerElements = document.querySelectorAll(`
            .lsx-quiz-answer-select[data-quiz='${quiz}'][data-exercise='${exercise}'][data-question='${question}']:not([data-answer='${answer}']),
            .lsx-quiz-answer-text[data-quiz='${quiz}'][data-exercise='${exercise}'][data-question='${question}']:not([data-answer='${answer}'])
        `);

        sameAnswerElements.forEach(element => {
            if (element.dataset.checked) {
                element.removeAttribute("data-checked");
            } else {
                element.dataset.checked = true;
            }

            this._updateAnswerIcon(element);
        });

        // Remove checkmark from other single-choice answers
        if (targetElement.dataset.type.toLowerCase() === "single-choice") {
            otherAnswerElements.forEach(element => {
                element.removeAttribute("data-checked");
                this._updateAnswerIcon(element);
            });
        }
    }

    /**
     * Handle internal event which is broadcast when all answers and corrections
     * shall be reset. This resets the given answer by unchecking it and
     * allowing it to be changed, again.
     *
     * @param {DOMEvent} event The original DOM event
     */
    _onAnswerReset(event) {
        event.target.removeAttribute("data-inactive");
        event.target.removeAttribute("data-checked");

        this._updateAnswerIcon(event.target);
    }

    /**
     * Handle internal event which is broadcast when the answers shall correct
     * themselves. This checkes the validity of an answer and then broadcasts
     * a new event to update the score.
     *
     * @param {DOMEvent} event THe original DOM event
     * @param {Object} plugin Plugin main object
     */
    _onAnswerCorrect(event, plugin) {
        // Make answer inactive
        event.target.dataset.inactive = true;

        // Determine correction status and points for the answer
        if (!event.target.dataset.correction) return;

        let status = "";
        let points = 0;

        switch (event.target.dataset.correction) {
            case "correct":
                if (event.target.dataset.checked) {
                    status = "correct";
                    points = 1;
                } else {
                    status = "wrong";
                    points = 0;
                }

                break;
            case "partialy-correct":
                if (event.target.dataset.checked) {
                    status = "partialy-correct";
                    points = 0.5;
                } else {
                    status = "correct";
                    points = 0;
                }

                break;
            case "wrong":
                if (event.target.dataset.checked) {
                    status = "wrong";
                    points = -1;
                } else {
                    status = "correct";
                    points = 0;
                }

                break;
            default:
                if (event.target.dataset.checked) {
                    status = "wrong";
                    points = 0;
                } else {
                    status = "correct";
                    points = 0;
                }
        }

        // Update maximum score
        let quizElement = plugin.getParentRecursive(event.target, e => e.classList.contains("lsx-quiz"));

        if (quizElement && event.target.dataset.correction == "correct") {
            plugin.broadcastCustomEvent(quizElement, "lsx-quiz-correction-update", {
                detail: {
                    quiz:     event.target.dataset.quiz,
                    exercise: event.target.dataset.exercise,
                    question: event.target.dataset.question,
                    answer:   event.target.dataset.answer,
                    status:   status,
                    type:     "max",
                    points:   1,
                }
            });
        }

        // Update actual score
        plugin.broadcastCustomEvent(quizElement, "lsx-quiz-correction-update", {
            detail: {
                quiz:     event.target.dataset.quiz,
                exercise: event.target.dataset.exercise,
                question: event.target.dataset.question,
                answer:   event.target.dataset.answer,
                status:   status,
                type:     "actual",
                points:   points,
            }
        });
    }

    /**
     * Handle internal event which is broadcast to reset all corrections.
     * This method resets the icons for each answer.
     *
     * @param {DOMEvent} event The original DOM event
     */
    _onCorrectionIconReset(event) {
        event.target.status = "";
        event.target.points = 0;
        this._updateStatusIcon(event.target);
    }

    /**
     * Handle internal event which is broadcast to update the corrections.
     * This method updates the icons for each answer.
     *
     * @param {DOMEvent} event The original DOM event
     */
    _onCorrectionIconUpdate(event) {
        if (!event.detail.type == "actual"
                || event.detail.quiz     != event.target.dataset.quiz
                || event.detail.exercise  != event.target.dataset.exercise
                || event.detail.question != event.target.dataset.question
                || event.detail.answer   != event.target.dataset.answer) {
            return;
        }

        event.target.dataset.status = event.detail.status;
        event.target.dataset.points = event.detail.points;

        this._updateStatusIcon(event.target);
    }

    /**
     * Handle internal event which is broadcast to reset all corrections.
     * This method resets all points to zero for the given elements.
     *
     * @param {DOMElement} actualPointsElement Actual points achieved
     * @param {DOMElement} maxPointsElement Maximum possible points
     * @param {DOMElement} totalPercentageElement Actual percentage achieved (optional)
     */
    _onCorrectionScoreReset(actualPointsElement, maxPointsElement, totalPercentageElement) {
        if (actualPointsElement) {
            actualPointsElement.dataset.value = 0;
            actualPointsElement.textContent = 0;
        }

        if (maxPointsElement) {
            maxPointsElement.dataset.value = 0;
            maxPointsElement.textContent = 0;
        }

        if (totalPercentageElement) {
            totalPercentageElement.dataset.value = 0;
            totalPercentageElement.textContent = "0%";
        }
    }

    /**
     * Handle internal event which is broadcast to sum up the points for all
     * answers.
     *
     * @param {DOMEvent} event See above
     * @param {DOMElement} actualPointsElement Actual points achieved
     * @param {DOMElement} maxPointsElement Maximum possible points
     * @param {DOMElement} totalPercentageElement Actual percentage achieved (optional)
     */
    _onCorrectionScoreUpdate(event, actualPointsElement, maxPointsElement, totalPercentageElement) {
        if (event.target.dataset.quiz     && event.target.dataset.quiz     != event.detail.quiz)     return;
        if (event.target.dataset.exercise && event.target.dataset.exercise != event.detail.exercise) return;
        if (event.target.dataset.question && event.target.dataset.question != event.detail.question) return;
        if (event.target.dataset.answer   && event.target.dataset.answer   != event.detail.answer)   return;

        let pointsElement = event.detail.type === "actual" ? actualPointsElement : maxPointsElement;
        pointsElement.dataset.value = Number(pointsElement.dataset.value) + event.detail.points;
        pointsElement.textContent = pointsElement.dataset.value;

        if (totalPercentageElement) {
            totalPercentageElement.dataset.value = Number(actualPointsElement.dataset.value) / Number(maxPointsElement.dataset.value) * 100;
            totalPercentageElement.textContent = `${Math.round(totalPercentageElement.dataset.value)}%`;
        }
    }

    /**
     * Update the icon of a multiple-choice or single-choice answer
     * depending on its current selection state.
     *
     * @param {DOMElement} element Answer element to be updated
     */
    _updateAnswerIcon(element) {
        let iconElement = element.querySelector(".lsx-quiz-icon");

        if (iconElement) {
            let iconUnchecked = element.dataset.iconUnchecked;
            let iconChecked = element.dataset.iconChecked;

            if (iconUnchecked) iconElement.classList.remove(iconUnchecked);
            if (iconChecked) iconElement.classList.remove(iconChecked);
            iconElement.classList.add(element.dataset.checked ? iconChecked : iconUnchecked);
        }
    }

    /**
     * Update the correction status icon of an answer.
     *
     * @param {DOMElement} element Answer correction element to be updated
     */
    _updateStatusIcon(element) {
        let iconElement = element.querySelector(".lsx-quiz-icon");
        if (!iconElement) return;
        iconElement.className = "lsx-quiz-icon";

        let status = element.dataset.status || "";
        let points = Number(element.dataset.points);

        if (status == "correct" && points) {
            iconElement.classList.add("__lspet__icon-checkmark");
        } else if (status == "partialy-correct") {
            iconElement.classList.add("__lspet__icon-checkmark2");
        } else if (status == "wrong") {
            iconElement.classList.add("__lspet__icon-cross");
        }
    }
}

export default LSX_Quiz;
