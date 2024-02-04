/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-modal-image> custom tag.
 */
export default class LSX_ModalImage {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-modal-image");

        lsxElements.forEach(lsxElement => {
            // Render custom element
            let src = lsxElement.getAttribute("src");
            lsxElement.removeAttribute("src");

            let caption = lsxElement.getAttribute("cation");
            lsxElement.removeAttribute("caption");

            let thumbnailElement = parseHtml(`
                <div class="lsx-modal-thumbnail">
                    <img src="${src}" class="img-thumbnail w-100" />
                    ${caption}
                </div>
            `)[0];

            plugin.copyAttributes(lsxElement, thumbnailElement);
            lsxElement.replaceWith(thumbnailElement);

            // Event handler to open the modal image window
            let modalElement = document.createElement("div");
            modalElement.classList.add("lsx-modal");

            let imgElement = document.createElement("img");
            imgElement.src = src;
            imgElement.classList.add("img-responsive");
            imgElement.classList.add("img-thumbnail");
            modalElement.appendChild(imgElement);

            modalElement.addEventListener("click", () => {
                modalElement.remove();
            });
            
            thumbnailElement.addEventListener("click", () => {
                document.querySelector("body").appendChild(modalElement);
            });
        });
    }
}