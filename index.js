/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";
import LSX_Accordion from "./lib/lsx-accordion.js";
import LSX_Carousel from "./lib/lsx-carousel.js";
import LSX_Grid from "./lib/lsx-grid.js";
import LSX_InfoBox from "./lib/lsx-info-box.js";
import LSX_Quiz from "./lib/lsx-quiz.js";
import LSX_TabPages from "./lib/lsx-tab-pages.js";
import LSX_ul from "./lib/lsx-ul.js";
import LSX_Youtube from "./lib/lsx-youtube.js";

import "./style.less";
import "./icomoon/style.css";

/**
 * This plugin adds additional HTML tags which ease the content creation
 * with lecture-slides.js. See the README file for detailed information.
 */
class LsPluginExtraTags {
    /**
     * Constructor.
     */
    constructor(config) {
        this.config = config || {};
        this.config.labelCarouselNext  = config.labelCarouselNext  || "Next Step";
        this.config.labelCarouselPrev  = config.labelCarouselPrev  || "Previous Step";
        this.config.labelCarouselReset = config.labelCarouselReset || "Restart";
        this.config.labelQuizPoints    = config.labelQuizPoints    || "{1} from {2}";
        this.config.labelQuizEvaluate  = config.labelQuizEvaluate  || "Correct";
        this.config.labelQuizNewTry    = config.labelQuizNewTry    || "New Try";
    }

    /**
     * This function replaces all custom HTML tags with standard ones.
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} utils Utility functions from lecture-slides.js
     */
    preprocessHtml(html, utils) {
        let jqHtml = $(html);

        [
            LSX_Accordion,
            LSX_Carousel,
            LSX_Grid,
            LSX_InfoBox,
            LSX_Quiz,
            LSX_TabPages,
            LSX_ul,
            LSX_Youtube,
        ].forEach(CustomTag => {
            let tag = new CustomTag();
            tag.preprocessHtml(html, jqHtml, utils, this);
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
        for (let i = 0; i < srcElement.attributes.length; i++) {
            let attribute = srcElement.attributes[i];
            dstElement.setAttribute(attribute.name, attribute.value);
        }
    }

    /**
     * Moves all child nodes from one parent element to another, without
     * copying them.
     *
     * @param {DOMElement} srcElement Source element
     * @param {DOMElement} dstElement Destination element
     */
    moveChildNodes(srcElement, dstElement) {
        let len = srcElement.childNodes.length;

        for (let i = 0; i < len; i++) {
            dstElement.append(srcElement.childNodes[0]);
        }
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

export default LsPluginExtraTags;
