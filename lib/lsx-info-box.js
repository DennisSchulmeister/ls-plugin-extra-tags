/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-info-box>  custom tag.
 */
class LSX_InfoBox {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} jqHtml jQuery wrapped version of `html`
     * @param {Object} utils Utility functions from lecture-slides.js
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, jqHtml, utils, plugin) {
        let lsxElements = html.querySelectorAll("lsx-info-box");

        lsxElements.forEach(lsxElement => {
            // Clone <lsx-info-box> into a new <div>
            let newElement = document.createElement("div");

            plugin.copyAttributes(lsxElement, newElement);
            newElement.classList.add("info-box");

            // Set CSS class from type attribute
            if ("type" in lsxElement.attributes) {
                let type = lsxElement.getAttribute("type");
                newElement.removeAttribute("type");
                newElement.classList.add(type);
            };

            // Add title div
            if ("title" in lsxElement.attributes) {
                let titleElement = $.parseHTML(`<div class="info-box-title"></div>`)[0];
                titleElement.textContent = lsxElement.getAttribute("title");
                newElement.appendChild(titleElement);
            }

            // Move inner content
            let contentElement = $.parseHTML(`<div class="info-box-content"></div>`)[0];
            plugin.moveChildNodes(lsxElement, contentElement);
            newElement.appendChild(contentElement);

            // Replace old HTML
            lsxElement.replaceWith(newElement);
        });

    }
}

export default LSX_InfoBox;
