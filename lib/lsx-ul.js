/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-ul>  custom tag.
 */
class LSX_ul {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-ul");

        lsxElements.forEach(lsxElement => {
            let liEmojiElement = lsxElement.querySelector(":scope > li[emoji]");
            let newElement = null;

            if (liEmojiElement) {
                newElement = this._render_table(lsxElement, plugin);
            } else {
                newElement = this._render_ul(lsxElement, plugin);
            }

            lsxElement.replaceWith(newElement);
        });
    }

    /**
     * Renders the list as a plain <ul>, because all items share the same emoji.
     *
     * @param {DOMElement} lsxElement The <lsx-ul> element
     * @param {Object} plugin Plugin main object
     * @return {DOMElement} Replacement element for the <lsx-ul>
     */
    _render_ul(lsxElement, plugin) {
        let emoji = lsxElement.getAttribute("emoji") || "🌟";

        let newElement = parseHtml(`
            <ul style="list-style-type: '${emoji}  ';"></ul>
        `)[0];

        plugin.copyAttributes(lsxElement, newElement);
        plugin.moveChildNodes(lsxElement, newElement);
        return newElement;
    }

    /**
     * Renders the list as a <table>, because at least some items have
     * differnet emojis.
     *
     * @param {DOMElement} lsxElement The <lsx-ul> element
     * @param {Object} plugin Plugin main object
     * @return {DOMElement} Replacement element for the <lsx-ul>
     */
    _render_table(lsxElement, plugin) {
        let defaultEmoji = lsxElement.getAttribute("emoji") || "🌟";

        let newElement = document.createElement("table");
        plugin.copyAttributes(lsxElement, newElement);

        lsxElement.querySelectorAll("li").forEach(lsxLiElement => {
            let emoji = lsxLiElement.getAttribute("emoji") || defaultEmoji;

            let trElement = parseHtml(`
                <tr>
                    <td style="padding-right: 0.5em;">${emoji}</td>
                    <td></td>
                </tr>
            `)[0];

            plugin.copyAttributes(lsxLiElement, trElement);
            plugin.moveChildNodes(lsxLiElement, trElement.querySelectorAll("td")[1]);

            newElement.append(trElement);
        });

        return newElement;
    }
}

export default LSX_ul;
