/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

/**
 * Implementation of the <lsx-modal> custom tag.
 */
export default class LSX_Modal {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-modal");

        lsxElements.forEach(lsxElement => {
            // Render custom element
            let lsxThumbnailElement = lsxElement.querySelector(":scope > lsx-thumbnail");
            let lsxContentElement   = lsxElement.querySelector(":scope > lsx-content");

            if (!lsxThumbnailElement) {
                console.warn("<lsx-modal>: Missing <lsx-thumbnail> child element");
                return;
            } else if (!lsxContentElement) {
                console.warn("<lsx-modal>: Missing <lsx-content> child element");
                return;
            }

            let thumbnailElement = document.createElement("div");
            plugin.copyAttributes(lsxElement, thumbnailElement);
            plugin.copyAttributes(lsxThumbnailElement, thumbnailElement);
            plugin.moveChildNodes(lsxThumbnailElement, thumbnailElement);
            lsxElement.replaceWith(thumbnailElement);

            // Event handler to open the modal image window
            let modalElement = document.createElement("div");
            modalElement.classList.add("lsx-modal");

            plugin.copyAttributes(lsxContentElement, modalElement);
            plugin.moveChildNodes(lsxContentElement, modalElement);

            modalElement.addEventListener("click", () => {
                modalElement.remove();
            });

            thumbnailElement.addEventListener("click", () => {
                document.querySelector("body").appendChild(modalElement);
            });
        });
    }
}