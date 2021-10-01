/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-carousel>  custom tag.
 */
class LSX_Carousel {
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
        let lsxCarouselElements = html.querySelectorAll("lsx-carousel");

        lsxCarouselElements.forEach(lsxCarouselElement => {
            // Determine ID used by the child elements
            if (!lsxCarouselElement.id) {
                lsxCarouselElement.id = plugin.getRandomId();
            }

            let id = lsxCarouselElement.id;

            // Render outer HTML elements
            let newCarouselElement = $.parseHTML($.trim(`
                <div class="carousel-outer">
                    <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item">
                            <a href="#${id}-items" class="nav-link" data-slide="next">${plugin.config.labelCarouselNext}</a>
                        </li>
                        <li class="nav-item">
                            <a href="#${id}-items" class="nav-link" data-slide="prev">${plugin.config.labelCarouselPrev}</a>
                        </li>
                        <li class="nav-item">
                            <a href="#${id}-items" class="nav-link" data-slide-to="0">${plugin.config.labelCarouselReset}</a>
                        </li>
                    </ul>

                    <ul class="nav nav-tabs sub-nav-tabs" role="tablist"></ul>

                    <div id="${id}-items" class="carousel slide mb-0" data-interval="false">
                        <div class="carousel-inner"></div>
                    </div>
                </div>
            `))[0];

            let navItemsDirectLinksParent = newCarouselElement.querySelectorAll("ul")[1];
            let carouselPagesParent = newCarouselElement.querySelector(".carousel-inner");

            plugin.copyAttributes(lsxCarouselElement, newCarouselElement);
            lsxCarouselElement.parentNode.replaceChild(newCarouselElement, lsxCarouselElement);

            // Render carousel items
            let lsxCarouselPageElements = lsxCarouselElement.querySelectorAll(":scope > lsx-carousel-page");
            let pageNumber = -1;
            let directLinksFound = true;

            lsxCarouselPageElements.forEach(lsxCarouselPageElement => {
                let newCarouselPageElement = $.parseHTML(`<div class="carousel-item"></div>`)[0];

                pageNumber += 1;
                if (pageNumber === 0) newCarouselPageElement.classList.add("active");

                let directLink = lsxCarouselPageElement.getAttribute("direct-link");
                if (directLink) {
                    let navItemDirectLinkElement = $.parseHTML($.trim(`
                        <li class="nav-item">
                            <small>
                                <a href="#${id}-items" class="nav-link" data-slide-to="${pageNumber}">${directLink}</a>
                            </small>
                        </li>
                    `))[0];

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

export default LSX_Carousel;
