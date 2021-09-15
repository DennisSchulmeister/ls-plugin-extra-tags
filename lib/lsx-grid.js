/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-grid> and <lsx-grid-fluid> custom tags.
 */
class LSX_Grid {
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
        // Replace the container elements
        let lsxContainerElements = html.querySelectorAll("lsx-grid, lsx-grid-fluid");
        let newContainerElements = [];

        lsxContainerElements.forEach(lsxElement => {
            let newElement = document.createElement("div");

            plugin.copyAttributes(lsxElement, newElement);
            plugin.moveChildNodes(lsxElement, newElement);

            switch (lsxElement.nodeName) {
                case "LSX-GRID":
                    newElement.classList.add("container");
                    break;

                case "LSX-GRID-FLUID":
                    newElement.classList.add("container-fluid");
                    break;
            }

            lsxElement.replaceWith(newElement);
            newContainerElements.push(newElement);
        });

        // Replace the row elements
        newContainerElements.forEach(newContainerElement => {
            let rowElements = newContainerElement.querySelectorAll(":scope > lsx-row");

            rowElements.forEach(lsxElement => {
                let newElement = document.createElement("div");

                plugin.copyAttributes(lsxElement, newElement);
                plugin.moveChildNodes(lsxElement, newElement);
                newElement.classList.add("row");

                lsxElement.replaceWith(newElement);
            });
        });

        // Replace the col elements
        newContainerElements.forEach(newContainerElement => {
            let colElements = newContainerElement.querySelectorAll(":scope > div.row > lsx-col");

            colElements.forEach(lsxElement => {
                let newElement = document.createElement("div");

                plugin.copyAttributes(lsxElement, newElement);
                plugin.moveChildNodes(lsxElement, newElement);

                if ("size" in lsxElement.attributes) {
                    let sizeAttribute = lsxElement.attributes["size"].value;
                    newElement.attributes.removeNamedItem("size");

                    sizeAttribute.split(" ").forEach(size => {
                        newElement.classList.add(`col-${size}`);
                    });
                }

                lsxElement.replaceWith(newElement);
            });
        });
    }
}

export default LSX_Grid;
