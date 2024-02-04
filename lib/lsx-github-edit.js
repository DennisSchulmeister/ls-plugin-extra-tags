/*
* ls-plugin-extra-tags (https://www.wpvs.de)
* © 2020 – 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
* Licensed under the 2-Clause BSD License.
 */
"use strict";

import { parseHtml } from "@dschulmeis/ls-utils/dom_utils.js";

/**
 * Implementation of the <lsx-github-edit>  custom tag.
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

        let urlPrefix = plugin.config.githubEditUrlPrefix;
        let labelOnline = plugin.config.labelGithubEditOnline;
        let labelDownload = plugin.config.labelGithubEditDownload;

        lsxElements.forEach(lsxElement => {
            let url = lsxElement.getAttribute("url") || "";
            let download = lsxElement.getAttribute("download") || url;

            let editLink = `https://www.gitpod.io/#${urlPrefix}${url}`;
            let downloadLink = `https://dennisschulmeister.github.io/DownGit/#/home?url=${urlPrefix}${download}`;

            let editButton = `
                <a href="${editLink}" target="_blank">
                    <button class="btn btn-dark">
                        ${labelOnline}
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
                </div>`)[0];

            plugin.copyAttributes(lsxElement, newElement);
            plugin.moveChildNodes(lsxElement, newElement);
            lsxElement.replaceWith(newElement);
        });
    }
}