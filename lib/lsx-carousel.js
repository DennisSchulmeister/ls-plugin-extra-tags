/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**4
 * Implementation of the <lsx-carousel> custom tag.
 */
export default class LSX_Carousel {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxCarouselElements = html.querySelectorAll("lsx-carousel");

        lsxCarouselElements.forEach(lsxCarouselElement => {
            // Determine ID used by the child elements
            if (!lsxCarouselElement.id) {
                lsxCarouselElement.id = plugin.getRandomId();
            }

            let id = lsxCarouselElement.id;

            // Render outer HTML elements
            let newCarouselElement = parseHtml(`
                <div class="carousel-outer">
                    <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item">
                            <a href="#${id}-items" class="nav-link" data-bs-slide="next">${plugin.config.labelCarouselNext}</a>
                        </li>
                        <li class="nav-item">
                            <a href="#${id}-items" class="nav-link" data-bs-slide="prev">${plugin.config.labelCarouselPrev}</a>
                        </li>
                        <li class="nav-item">
                            <a href="#${id}-items" class="nav-link" data-bs-slide-to="0">${plugin.config.labelCarouselReset}</a>
                        </li>
                    </ul>

                    <ul class="nav nav-tabs sub-nav-tabs" role="tablist"></ul>

                    <div id="${id}-items" class="carousel slide mb-0" data-bs-interval="false">
                        <div class="carousel-inner"></div>
                    </div>
                </div>
            `)[0];

            let navItemsDirectLinksParent = newCarouselElement.querySelectorAll("ul")[1];
            let carouselPagesParent = newCarouselElement.querySelector(".carousel-inner");

            plugin.copyAttributes(lsxCarouselElement, newCarouselElement);
            lsxCarouselElement.parentNode.replaceChild(newCarouselElement, lsxCarouselElement);

            // Render carousel items
            let lsxCarouselPageElements = lsxCarouselElement.querySelectorAll(":scope > lsx-carousel-page");
            let pageNumber = -1;
            let directLinksFound = true;

            lsxCarouselPageElements.forEach(lsxCarouselPageElement => {
                let newCarouselPageElement = parseHtml(`<div class="carousel-item"></div>`)[0];

                pageNumber += 1;
                if (pageNumber === 0) newCarouselPageElement.classList.add("active");

                let directLink = lsxCarouselPageElement.getAttribute("direct-link");
                if (directLink) {
                    let navItemDirectLinkElement = parseHtml(`
                        <li class="nav-item">
                            <small>
                                <a href="#${id}-items" class="nav-link" data-bs-slide-to="${pageNumber}">${directLink}</a>
                            </small>
                        </li>
                    `)[0];

                    navItemsDirectLinksParent.appendChild(navItemDirectLinkElement);
                    directLinksFound = true;
                }

                plugin.moveChildNodes(lsxCarouselPageElement, newCarouselPageElement);
                plugin.copyAttributes(lsxCarouselPageElement, newCarouselPageElement);
                carouselPagesParent.appendChild(newCarouselPageElement);
            });

            if (!directLinksFound) {
                navItemsDirectLinksParent.parentNode.removeChild(navItemsDirectLinksParent);
            }
        });
    }
}