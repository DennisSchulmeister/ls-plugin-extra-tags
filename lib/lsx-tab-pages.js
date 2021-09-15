/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-tab-pages> custom tag.
 */
class LSX_TabPages {
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
        let lsxTabPagesElements = html.querySelectorAll("lsx-tab-pages");

        lsxTabPagesElements.forEach(lsxTabPagesElement => {
            // Render outer HTML elements
            let newTabPagesElement = $.parseHTML($.trim(`
                <div class="tab-pages">
                    <ul class="nav nav-tabs" role="tablist">
                    </ul>
                    <div class="tab-content">
                    </div>
                </div>
            `))[0];

            let navItemsParent = newTabPagesElement.querySelector(".nav-tabs");
            let tabPanesParent = newTabPagesElement.querySelector(".tab-content");

            plugin.copyAttributes(lsxTabPagesElement, newTabPagesElement);
            lsxTabPagesElement.replaceWith(newTabPagesElement);

            // Determine ID used by the child elements
            if (!newTabPagesElement.id) {
                newTabPagesElement.id = plugin.getRandomId();
            }

            let id = newTabPagesElement.id;

            // Render tab selectors and pages
            let lsxTabPageElements = lsxTabPagesElement.querySelectorAll(":scope > lsx-tab-page");
            let tabNumber = 0;

            lsxTabPageElements.forEach(lsxTabPageElement => {
                // Render tab selector
                tabNumber += 1;
                let tabTitle = lsxTabPageElement.getAttribute("title") || String(tabNumber);

                let navItemElement = $.parseHTML($.trim(`
                    <li class="nav-item">
                        <a
                            id            = "${id}-page${tabNumber}-tab"
                            class         = "nav-link"
                            data-toggle   = "tab"
                            href          = "#${id}-page${tabNumber}"
                            role          = "tab"
                            aria-controls = "${id}-page${tabNumber}"
                            aria-expanded = "true"
                        >
                            ${tabTitle}
                        </a>
                    </li>
                `))[0];

                if (tabNumber === 1) navItemElement.querySelector("a").classList.add("active");
                navItemsParent.appendChild(navItemElement);

                // Render tab content
                let tabPaneElement = $.parseHTML($.trim(`
                    <div
                        class           = "tab-pane fade show"
                        id              = "${id}-page${tabNumber}"
                        role            = "tabpanel"
                        aria-labelledby = "${id}-page${tabNumber}-tab"
                    >
                    </div>
                `))[0];

                if (tabNumber === 1) tabPaneElement.classList.add("active");
                plugin.moveChildNodes(lsxTabPageElement, tabPaneElement);
                tabPanesParent.appendChild(tabPaneElement);
            });
        });
    }
}

export default LSX_TabPages;
