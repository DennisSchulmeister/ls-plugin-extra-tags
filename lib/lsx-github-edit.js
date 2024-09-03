/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-github-edit> custom tag.
 */
export default class LSX_GithubEdit {
    /**
     * Called by the plugin main class to replace the custom HTML tags
     * with standard HTML code.
     *
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} plugin Plugin main object
     */
    preprocessHtml(html, plugin) {
        let lsxElements = html.querySelectorAll("lsx-github-edit");

        let editUrlPrefix  = plugin.config.githubEditUrlPrefix;
        let pagesUrlPrefix = plugin.config.githubPagesUrlPrefix;
        let labelOnline    = plugin.config.labelGithubEditOnline;
        let labelDownload  = plugin.config.labelGithubEditDownload;

        lsxElements.forEach(lsxElement => {
            let url         = lsxElement.getAttribute("url")          || "";
            let download    = lsxElement.getAttribute("download")     || url;
            let pagesUrl1   = lsxElement.getAttribute("pages-url1")   || "";
            let pagesLabel1 = lsxElement.getAttribute("pages-label1") || "";
            let pagesUrl2   = lsxElement.getAttribute("pages-url2")   || "";
            let pagesLabel2 = lsxElement.getAttribute("pages-label2") || "";
            let pagesUrl3   = lsxElement.getAttribute("pages-url3")   || "";
            let pagesLabel3 = lsxElement.getAttribute("pages-label3") || "";

            let editLink     = `https://www.gitpod.io/#${editUrlPrefix}${url}`;
            let downloadLink = `https://dennisschulmeister.github.io/DownGit/#/home?url=${editUrlPrefix}${download}`;
            let pagesLink1   = `${pagesUrlPrefix}${pagesUrl1}`;
            let pagesLink2   = `${pagesUrlPrefix}${pagesUrl2}`;
            let pagesLink3   = `${pagesUrlPrefix}${pagesUrl3}`;

            let editButton = `
                <a href="${editLink}" target="_blank">
                    <button class="btn btn-dark">
                        ${labelOnline}
                    </button>
                </a>`;
            
            let pagesButton1 = `
                <a href="${pagesLink1}" target="_blank">
                    <button class="btn btn-light">
                        ${pagesLabel1}
                    </button>
                </a>`;

            let pagesButton2 = `
                <a href="${pagesLink2}" target="_blank">
                    <button class="btn btn-light">
                        ${pagesLabel2}
                    </button>
                </a>`;

            let pagesButton3 = `
                <a href="${pagesLink3}" target="_blank">
                    <button class="btn btn-light">
                        ${pagesLabel3}
                    </button>
                </a>`;

            let newElement = parseHtml(`
                <div>
                    ${url ? editButton : ""}                    
                    
                    <a href="${downloadLink}" target="_blank">
                        <button class="btn btn-light">
                            ${labelDownload}
                        </button>
                    </a>

                    ${pagesLabel1 && pagesLink1 ? pagesButton1 : ""}
                    ${pagesLabel2 && pagesLink2 ? pagesButton2 : ""}
                    ${pagesLabel3 && pagesLink3 ? pagesButton3 : ""}
                </div>`)[0];

            plugin.copyAttributes(lsxElement, newElement);
            plugin.moveChildNodes(lsxElement, newElement);
            lsxElement.replaceWith(newElement);
        });
    }
}