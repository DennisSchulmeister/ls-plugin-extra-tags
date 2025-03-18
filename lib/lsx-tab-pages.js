/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-tab-pages> custom tag.
 */
export default class LSX_TabPages {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxTabPagesElements = html.querySelectorAll("lsx-tab-pages");

        lsxTabPagesElements.forEach(lsxTabPagesElement => {
            // Render outer HTML elements
            let newTabPagesElement = parseHtml(`
                <div class="tab-pages d-flex flex-column">
                    <ul class="nav nav-tabs" role="tablist">
                    </ul>
                    <div class="tab-content flex-fill">
                    </div>
                </div>
            `)[0];

            let navItemsParent = newTabPagesElement.querySelector(".nav-tabs");
            let tabPanesParent = newTabPagesElement.querySelector(".tab-content");

            plugin.copyAttributes(lsxTabPagesElement, newTabPagesElement);
            lsxTabPagesElement.replaceWith(newTabPagesElement);

            // Determine ID used by the child elements
            if (!newTabPagesElement.id) {
                newTabPagesElement.id = plugin.getRandomId();
            }

            let id = newTabPagesElement.id;

            // Attach API methods
            newTabPagesElement.lsxSetVisibleTabs = setVisibleTabs.bind(newTabPagesElement);
            newTabPagesElement.lsxGotoTab        = gotoTab.bind(newTabPagesElement);
            newTabPagesElement.lsxEnableTab      = enableTab.bind(newTabPagesElement);
            newTabPagesElement.lsxDisableTab     = disableTab.bind(newTabPagesElement);

            // Render tab selectors and pages
            let lsxTabPageElements = lsxTabPagesElement.querySelectorAll(":scope > lsx-tab-page");
            let tabNumber = 0;

            lsxTabPageElements.forEach(lsxTabPageElement => {
                // Render tab selector
                tabNumber += 1;
                lsxTabPageElement.dataset.tabNumber = tabNumber;

                let tabTitle = lsxTabPageElement.getAttribute("title") || String(tabNumber);

                let navItemElement = parseHtml(`
                    <li class="nav-item" role="presentation" data-tab-number="${tabNumber}">
                        <a
                            id              = "${id}-page${tabNumber}-tab"
                            class           = "nav-link"
                            data-bs-toggle  = "tab"
                            href            = "#${id}-page${tabNumber}"
                            role            = "tab"
                            aria-controls   = "${id}-page${tabNumber}"
                            aria-expanded   = "true"
                            data-tab-number = "${tabNumber}"
                        >
                            ${tabTitle}
                        </a>
                    </li>
                `)[0];

                if (tabNumber === 1) navItemElement.querySelector("a").classList.add("active");
                navItemsParent.appendChild(navItemElement);

                // Render tab content
                let tabPaneElement = parseHtml(`
                    <div
                        class           = "tab-pane show"
                        id              = "${id}-page${tabNumber}"
                        role            = "tabpanel"
                        aria-labelledby = "${id}-page${tabNumber}-tab"
                        data-tab-number = "${tabNumber}"
                    >
                    </div>
                `)[0];

                if (tabNumber === 1) tabPaneElement.classList.add("active");
                plugin.moveChildNodes(lsxTabPageElement, tabPaneElement);
                tabPanesParent.appendChild(tabPaneElement);
            });

            // Set property with total number of tab pages
            newTabPagesElement.lsxNumberPages = tabNumber;

            // Handle disabled and hidden attributes
            for (let lsxTabPageElement of lsxTabPageElements) {
                if (lsxTabPageElement.hasAttribute("hidden")) {
                    newTabPagesElement.lsxDisableTab(lsxTabPageElement.dataset.tabNumber, false);
                } else if (lsxTabPageElement.hasAttribute("disabled")) {
                    newTabPagesElement.lsxDisableTab(lsxTabPageElement.dataset.tabNumber, true);
                }
            }
        });
    }
}

/**
 * Set which tabs are actually visible and which are invisible and cannot be used.
 * This is meant to dynamicly replace tabs by hidding some and showing some others.
 * The first tab has the number "1". The total number can be read from the property
 * `lsxNumberPages`.
 * 
 * @param {Array} visibleTabs Visible tab numbers (strings or numbers)
 * @param {boolean} othersStillVisible Leave other tabs visible but inactive
 */
function setVisibleTabs(visibleTabs, othersStillVisible) {
    for (let i = 1; i <= this.lsxNumberPages; i++) {
        this.disableTab(i, othersStillVisible);
    }

    for (let visibleTab of visibleTabs || []) {
        this.enableTab(visibleTab);
    }
}

/**
 * Change the visible tab page.
 * @param {string|number} tabNumber Tab number
 */
function gotoTab(tabNumber) {
    for (let element of this.querySelectorAll("[role='tab'], [role='tabpanel']")) {
        element.classList.remove("active");
    }

    let aElement   = this.querySelector(`[role='tab'][data-tab-number='${tabNumber}']`);
    let divElement = this.querySelector(`[role='tabpanel'][data-tab-number='${tabNumber}']`);

    aElement.classList.add("active");
    divElement.classList.add("active");
}

/**
 * Reenable a previously disabled or hidden tab.
 * @param {string|number} tabNumber Tab number
 */
function enableTab(tabNumber) {
    let aElement  = this.querySelector(`[role='tab'][data-tab-number='${tabNumber}']`);
    let liElement = aElement.parentElement;

    aElement.removeAttribute("disabled");
    liElement.classList.remove("d-none");
}

/**
 * Hide a tab or make it inactive so that it still remains visible but cannot be selected.
 * @param {string|number} tabNumber Tab number
 * @param {boolean} stillVisible Leave the tab selector visible but inactive
 */
function disableTab(tabNumber, stillVisible) {
    let aElement  = this.querySelector(`[role='tab'][data-tab-number='${tabNumber}']`);
    let liElement = aElement.parentElement;

    aElement.setAttribute("disabled", "");
    
    if (stillVisible) liElement.classList.remove("d-none");
    else liElement.classList.add("d-none");
}