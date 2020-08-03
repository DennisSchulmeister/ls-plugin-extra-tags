/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-youtube>  custom tag.
 */
class LSX_Youtube {
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
        let lsxElements = html.querySelectorAll("lsx-youtube");

        lsxElements.forEach(lsxElement => {
            let videoId = lsxElement.getAttribute("video");
            let aspectRatio = lsxElement.getAttribute("aspect-ratio") || "16by9";

            let newElement = $.parseHTML($.trim(`
                <div class="embed-responsive embed-responsive-${aspectRatio}">
                    <iframe class="embed-responsive-item" src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&amp;showinfo=0" allowfullscreen></iframe>
                </div>
            `))[0];

            lsxElement.removeAttribute("video");
            lsxElement.removeAttribute("aspect-ratio");
            plugin.copyAttributes(lsxElement, newElement);

            lsxElement.replaceWith(newElement);
        });

    }
}

export default LSX_Youtube;
