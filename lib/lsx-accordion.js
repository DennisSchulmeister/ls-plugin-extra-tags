/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-accordion> custom tag.
 */
class LSX_Accordion {
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
        let lsxAccordionElements = html.querySelectorAll("lsx-accordion");

        lsxAccordionElements.forEach(lsxAccordionElement => {
            // Render outer HTML element
            let newAccordionElement = $.parseHTML($.trim(`
                <div class="accordion"></div>
            `))[0];

            plugin.copyAttributes(lsxAccordionElement, newAccordionElement);
            lsxAccordionElement.replaceWith(newAccordionElement);

            // Determine ID used by the child elements
            if (!newAccordionElement.id) {
                newAccordionElement.id = plugin.getRandomId();
            }

            let id = newAccordionElement.id;

            // Render accordion pages
            let lsxAccordionPageElements = lsxAccordionElement.querySelectorAll(":scope > lsx-accordion-page");
            let pageNumber = 0;

            lsxAccordionPageElements.forEach(lsxAccordionPageElement => {
                // Render "card" which will contain the page title and content
                let cardElement = $.parseHTML($.trim(`
                    <div class="card"></div>
                `))[0];

                newAccordionElement.appendChild(cardElement);

                let expanded = "active" in lsxAccordionPageElement.attributes;
                let show = expanded ? "show" : "";
                lsxAccordionPageElement.removeAttribute("active");

                pageNumber += 1;

                // Render card title
                let titleElement = $.parseHTML($.trim(`
                    <div
                        id            = "${id}-page${pageNumber}-title"
                        class         = "card-header"
                        data-toggle   = "collapse"
                        aria-expanded = "${expanded}"
                        aria-controls = "${id}-page${pageNumber}-content"
                        href          = "#${id}-page${pageNumber}-content"
                    >
                    </div>
                `))[0];

                let lsxTitleAttribute = lsxAccordionPageElement.getAttribute("title");
                lsxAccordionPageElement.removeAttribute("title");
                let lsxTitleElement = lsxAccordionPageElement.querySelector(":scope > lsx-accordion-title");

                if (lsxTitleElement && lsxTitleElement.innerHTML) {
                    plugin.copyAttributes(lsxTitleElement, titleElement);
                    plugin.moveChildNodes(lsxTitleElement, titleElement);
                } else if (lsxTitleAttribute) {
                    titleElement.textContent = lsxTitleAttribute;
                } else {
                    titleElement.textContent = pageNumber;
                }

                cardElement.appendChild(titleElement);

                // Render card content
                let contentElement = $.parseHTML($.trim(`
                    <div
                        id              = "${id}-page${pageNumber}-content"
                        class           = "collapse ${show} p-3"
                        aria-labelledby = "${id}-page${pageNumber}-title"
                        data-parent     = "#${id}"
                    >
                    </div>
                `))[0];

                let lsxContentElement = lsxAccordionPageElement.querySelector(":scope > lsx-accordion-content");

                if (lsxContentElement) {
                    plugin.copyAttributes(lsxContentElement, contentElement);
                    plugin.moveChildNodes(lsxContentElement, contentElement);
                } else {
                    plugin.copyAttributes(lsxAccordionPageElement, contentElement);
                    plugin.moveChildNodes(lsxAccordionPageElement, contentElement);
                }

                cardElement.appendChild(contentElement);
            });
        });
    }
}

export default LSX_Accordion;
