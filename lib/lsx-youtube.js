/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-youtube>  custom tag.
 */
class LSX_Youtube {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-youtube");

        lsxElements.forEach(lsxElement => {
            let videoId = lsxElement.getAttribute("video");
            let aspectRatio = lsxElement.getAttribute("aspect-ratio") || "16x9";
            aspectRatio = aspectRatio.replaceAll("by", "x");

            // The class embed-responsive-item is not used by Bootstrap, anymore.
            // But we keep it for lecture-slides.js compatiblity, as there a default
            // margin is set based on that class.
            let newElement = parseHtml(`
                <div class="ratio ratio-${aspectRatio}">
                    <iframe class="embed-responsive-item" src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&amp;showinfo=0" allow="fullscreen"></iframe>
                </div>
            `)[0];

            lsxElement.removeAttribute("video");
            lsxElement.removeAttribute("aspect-ratio");
            plugin.copyAttributes(lsxElement, newElement);

            lsxElement.replaceWith(newElement);
        });

    }
}

export default LSX_Youtube;
