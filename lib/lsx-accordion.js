/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-accordion> custom tag.
 */
class LSX_Accordion {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxAccordionElements = html.querySelectorAll("lsx-accordion");

        lsxAccordionElements.forEach(lsxAccordionElement => {
            // Render outer HTML element
            let newAccordionElement = parseHtml(`
                <div class="accordion"></div>
            `)[0];

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
                let cardElement = parseHtml(`
                    <div class="card"></div>
                `)[0];

                newAccordionElement.appendChild(cardElement);

                let expanded = "active" in lsxAccordionPageElement.attributes;
                let show = expanded ? "show" : "";
                lsxAccordionPageElement.removeAttribute("active");

                let bold = "bold" in lsxAccordionPageElement.attributes ? "font-weight-bold" : "";
                lsxAccordionPageElement.removeAttribute("bold");

                pageNumber += 1;

                // Render card title
                let titleElement = parseHtml(`
                    <div
                        id             = "${id}-page${pageNumber}-title"
                        class          = "card-header ${bold}"
                        data-bs-toggle = "collapse"
                        aria-expanded  = "${expanded}"
                        aria-controls  = "${id}-page${pageNumber}-content"
                        href           = "#${id}-page${pageNumber}-content"
                    >
                    </div>
                `)[0];

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
                let contentElement = parseHtml(`
                    <div
                        id              = "${id}-page${pageNumber}-content"
                        class           = "collapse ${show} p-3"
                        aria-labelledby = "${id}-page${pageNumber}-title"
                        data-bs-parent  = "#${id}"
                    >
                    </div>
                `)[0];

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
