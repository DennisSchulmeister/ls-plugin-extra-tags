/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2024 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-card>  custom tag.
 */
export default class LSX_Card {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-card");

        lsxElements.forEach(lsxElement => {
            // Clone <lsx-card> into a new <div>
            let newElement = document.createElement("div");
            newElement.classList.add("card");

            let imgElement, headerElement, bodyElement, footerElement;

            // Render top image
            let lsxImgAttribute = lsxElement.getAttribute('img');
            lsxElement.removeAttribute("img");

            let lsxImgPositionAttribute = lsxElement.getAttribute("img-position") || "top";
            lsxElement.removeAttribute("img-position");

            let lsxImgAltAttribute = lsxElement.getAttribute("img-alt") || "";
            lsxElement.removeAttribute("img-alt");

            if (lsxImgAttribute) {
                imgElement = parseHtml(`<img src="${lsxImgAttribute}" class="card-img-${lsxImgPositionAttribute}"> alt="${lsxImgAltAttribute}"`)[0];
            }

            // Render header div
            let lsxTitleAttribute = lsxElement.getAttribute("title") || lsxElement.getAttribute("header");
            let lsxHeaderElement  = lsxElement.querySelector(":scope > lsx-card-header");
            
            lsxElement.removeAttribute("title");
            if (lsxHeaderElement) lsxElement.removeChild(lsxHeaderElement);
            
            if (lsxHeaderElement || lsxTitleAttribute) {
                let bold = "bold" in lsxElement.attributes ? "fw-bold" : "";
                lsxElement.removeAttribute("bold");

                headerElement = parseHtml(`<div class="card-header ${bold}"></div>`)[0];
                
                if (lsxHeaderElement && lsxHeaderElement.innerHTML) {
                    plugin.copyAttributes(lsxHeaderElement, headerElement);
                    plugin.moveChildNodes(lsxHeaderElement, headerElement);
                } else if (lsxTitleAttribute) {
                    headerElement.innerHTML = lsxTitleAttribute;
                }
            }

            // Render footer div likewise
            let lsxFooterAttribute = lsxElement.getAttribute("footer");
            let lsxFooterElement   = lsxElement.querySelector(":scope > lsx-card-footer");

            lsxElement.removeAttribute("footer");
            if (lsxFooterElement) lsxElement.removeChild(lsxFooterElement);
            
            if (lsxFooterElement || lsxFooterAttribute) {
                footerElement = parseHtml(`<div class="card-footer"></div>`)[0];
                
                if (lsxFooterElement && lsxFooterElement.innerHTML) {
                    plugin.copyAttributes(lsxFooterElement, footerElement);
                    plugin.moveChildNodes(lsxFooterElement, footerElement);
                } else if (lsxFooterAttribute) {
                    footerElement.innerHTML = lsxFooterAttribute;
                }
            }

            // Render body div
            let lsxBodyElement = lsxElement.querySelector(":scope > lsx-card-body");

            if (lsxBodyElement || lsxElement.innerHTML) {
                bodyElement = parseHtml(`<div class="card-body"></div>`)[0];
            }

            if (lsxBodyElement && lsxBodyElement.innerHTML) {
                plugin.copyAttributes(lsxBodyElement, bodyElement);
                plugin.moveChildNodes(lsxBodyElement, bodyElement);
            } else if (lsxElement.innerHTML) {
                plugin.moveChildNodes(lsxElement, bodyElement);
            }

            // Replace old HTML
            plugin.copyAttributes(lsxElement, newElement);

            if (imgElement)    newElement.appendChild(imgElement);
            if (headerElement) newElement.appendChild(headerElement);
            if (bodyElement)   newElement.appendChild(bodyElement);
            if (footerElement) newElement.appendChild(footerElement);

            lsxElement.replaceWith(newElement);
        });
    }
}