/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";
import { copyAttributes } from "../ls-utils/dom_utils.js";
import { moveChildNodes } from "../ls-utils/dom_utils.js";

import LSX_Accordion      from "./lib/lsx-accordion.js";
import LSX_Card           from "./lib/lsx-card.js";
import LSX_Carousel       from "./lib/lsx-carousel.js";
import LSX_GithubEdit     from "./lib/lsx-github-edit.js";
import LSX_Grid           from "./lib/lsx-grid.js";
import LSX_InfoBox        from "./lib/lsx-info-box.js";
import LSX_Quiz           from "./lib/lsx-quiz.js";
import LSX_TabPages       from "./lib/lsx-tab-pages.js";
import LSX_ul             from "./lib/lsx-ul.js";
import LSX_Youtube        from "./lib/lsx-youtube.js";

// Must be started last
import LSX_Modal          from "./lib/lsx-modal.js";
import LSX_ModalImage     from "./lib/lsx-modal-image.js";

import "./style.less";
import "./icomoon/style.css";

/**
 * This plugin adds additional HTML tags which ease the content creation
 * with lecture-slides.js and mini-tutorial.js See the README file for detailed
 * information.
 */
export default class LS_Plugin_ExtraTags {
    /**
     * Constructor.
     */
    constructor(config) {
        this.config = config || {};

        this.config.labelCarouselNext       = this.config.labelCarouselNext       || "Next Step";
        this.config.labelCarouselPrev       = this.config.labelCarouselPrev       || "Previous Step";
        this.config.labelCarouselReset      = this.config.labelCarouselReset      || "Restart";

        this.config.labelGithubEditOnline   = this.config.labelGithubEditOnline   || "Start Online IDE";
        this.config.labelGithubEditDownload = this.config.labelGithubEditDownload || "Download Source Code";
        this.config.githubEditUrlPrefix     = this.config.githubEditUrlPrefix     || "";

        this.config.labelQuizPoints         = this.config.labelQuizPoints         || "{1} from {2}";
        this.config.labelQuizEvaluate       = this.config.labelQuizEvaluate       || "Correct";
        this.config.labelQuizNewTry         = this.config.labelQuizNewTry         || "New Try";
        this.config.quizExerciseHeading     = this.config.quizExerciseHeading     || "h2";
    }

    /**
     * This function replaces all custom HTML tags with standard ones.
     * @param {Element} html DOM node with the slide definitions
     */
    preprocessHtml(html) {
        [
            LSX_Accordion,
            LSX_Card,
            LSX_Carousel,
            LSX_GithubEdit,
            LSX_Grid,
            LSX_InfoBox,
            LSX_Quiz,
            LSX_TabPages,
            LSX_ul,
            LSX_Youtube,

            // Must be last
            LSX_Modal,
            LSX_ModalImage,
        ].forEach(CustomTag => {
            let tag = new CustomTag();
            tag.preprocessHtml(html, this);
        });
    }

    /**
     * Copy all attribute values from the source element to the destination
     * elements.
     *
     * @param {DOMElement} srcElement Source element
     * @param {DOMElement} dstElement Destination element
     */
    copyAttributes(srcElement, dstElement) {
        copyAttributes(srcElement, dstElement);
    }

    /**
     * Moves all child nodes from one parent element to another, without
     * copying them.
     *
     * @param {DOMElement} srcElement Source element
     * @param {DOMElement} dstElement Destination element
     */
    moveChildNodes(srcElement, dstElement) {
        moveChildNodes(srcElement, dstElement);
    }

    /**
     * Generates a random ID for elements that contain an own ID.
     * @return {String} Generated ID
     */
    getRandomId() {
        return Math.random().toString(36).split(".")[1].replace(/\d/g, "A");
    }

    /**
     * Search the parent node hierarchy until a node matches a given match
     * function.
     *
     * @param  {DOMElement} element The child node whose parent is searched
     * @param  {Function} compare Match function to check a given node
     * @return {DOMElement} The matched node or null
     */
    getParentRecursive(element, match) {
        let matchedNode = null;

        while (element.parentNode && !matchedNode) {
            element = element.parentNode;
            matchedNode = match(element) ? element : null;
        }

        return matchedNode;
    }

    /**
     * Recursively fires a `CustomEvent` for the given parent node and all
     * its direct or indirect child nodes.
     *
     * For performance reasons the custom event will never bubble up,
     * no matter the given properties. Besides that all values given to
     * this method are directly passed on to the `CustomEvent` construtor.
     *
     * @param {DOMElement} parent Parent element
     * @param {String} name Name of the custom event
     * @param {Object} properties Properties for the `CustomEvent`
     */
    broadcastCustomEvent(parent, name, properties) {
        properties = properties || {};
        properties.bubbles = false;

        let elements = [parent];
        let childElements = [];

        while (elements.length) {
            elements.forEach(element => {
                let event = new CustomEvent(name, properties);
                element.dispatchEvent(event);

                for (let i = 0; i < element.children.length; i++) {
                    childElements.push(element.children[i]);
                }
            });

            elements = childElements;
            childElements = [];
        }
    }
}
