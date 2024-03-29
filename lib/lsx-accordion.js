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
export default class LSX_Accordion {
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
                // Render "item" which will contain the title and content
                let cardElement = parseHtml(`
                    <div class="accordion-item"></div>
                `)[0];

                newAccordionElement.appendChild(cardElement);

                let expanded = "active" in lsxAccordionPageElement.attributes;
                let show = expanded ? "show" : "";
                lsxAccordionPageElement.removeAttribute("active");

                let bold = "bold" in lsxAccordionPageElement.attributes ? "fw-bold" : "";
                lsxAccordionPageElement.removeAttribute("bold");

                pageNumber += 1;

                // Render title element
                let titleOuterElement = parseHtml(`
                    <div
                        id    = "${id}-page${pageNumber}-title"
                        class = "accordion-header"
                    >
                        <button
                            class          = "accordion-button bg-light text-body fs-5 ${bold}"
                            type           = "button"
                            data-bs-toggle = "collapse"
                            data-bs-target = "#${id}-page${pageNumber}-content"
                            aria-controls  = "${id}-page${pageNumber}-content"
                            aria-expanded  = "${expanded}"
                        >
                        </button>
                    </div>
                `)[0];
                let titleInnerElement = titleOuterElement.querySelector("button");

                let lsxTitleAttribute = lsxAccordionPageElement.getAttribute("title");
                lsxAccordionPageElement.removeAttribute("title");
                let lsxTitleElement = lsxAccordionPageElement.querySelector(":scope > lsx-accordion-title");

                if (lsxTitleElement && lsxTitleElement.innerHTML) {
                    plugin.copyAttributes(lsxTitleElement, titleOuterElement);
                    plugin.moveChildNodes(lsxTitleElement, titleInnerElement);
                } else if (lsxTitleAttribute) {
                    titleInnerElement.innerHTML = lsxTitleAttribute;
                } else {
                    titleInnerElement.textContent = pageNumber;
                }

                cardElement.appendChild(titleOuterElement);

                // Render body element
                let contentOuterElement = parseHtml(`
                    <div
                        id              = "${id}-page${pageNumber}-content"
                        class           = "accordion-collapse collapse ${show}"
                        aria-labelledby = "${id}-page${pageNumber}-title"
                        data-bs-parent  = "#${id}"
                    >
                        <div class="accordion-body"></div>
                    </div>
                `)[0];
                let contentInnerElement = contentOuterElement.querySelector(".accordion-body");

                let lsxContentElement = lsxAccordionPageElement.querySelector(":scope > lsx-accordion-content");

                if (lsxContentElement) {
                    plugin.copyAttributes(lsxContentElement, contentOuterElement);
                    plugin.moveChildNodes(lsxContentElement, contentInnerElement);
                } else {
                    plugin.copyAttributes(lsxAccordionPageElement, contentOuterElement);
                    plugin.moveChildNodes(lsxAccordionPageElement, contentInnerElement);
                }

                cardElement.appendChild(contentOuterElement);
            });
        });
    }
}