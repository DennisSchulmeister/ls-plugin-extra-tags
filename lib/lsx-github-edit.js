/*
 * ls-plugin-extra-tags (https://www.wpvs.de)
 * © 2020  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";

/**
 * Implementation of the <lsx-github-edit>  custom tag.
 */
class LSX_GithubEdit {
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
        let lsxElements = html.querySelectorAll("lsx-github-edit");

        let urlPrefix = plugin.config.githubEditUrlPrefix;
        let labelOnline = plugin.config.labelGithubEditOnline;
        let labelDownload = plugin.config.labelGithubEditDownload;

        lsxElements.forEach(lsxElement => {
            let url = lsxElement.getAttribute("url") || "";
            let download = lsxElement.getAttribute("download") || url;

            let editLink = `https://www.gitpod.io/#${urlPrefix}${url}`;
            let downloadLink = `https://dennisschulmeister.github.io/DownGit/#/home?url=${urlPrefix}${download}`;

            let newElement = $.parseHTML($.trim(`
                <div>
                    <a href="${editLink}" target="_blank">
                        <button class="btn btn-dark">
                            ${labelOnline}
                        </button>
                    </a>

                    <a href="${downloadLink}" target="_blank">
                        <button class="btn btn-light">
                            ${labelDownload}
                        </button>
                    </a>
                </div>
            `))[0];

            plugin.copyAttributes(lsxElement, newElement);
            plugin.moveChildNodes(lsxElement, newElement);
            lsxElement.replaceWith(newElement);
        });
    }
}

export default LSX_GithubEdit;
