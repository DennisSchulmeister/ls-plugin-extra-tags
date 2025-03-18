lecture-slides.js: Additional HTML Tags
=======================================

1. [Description](#description)
1. [Components](#components)
1. [Installation](#installation)
1. [Copyright](#copyright)

Description
-----------

This plugin simplifies content creation with `lecture-slides.js` and
`mini-tutorial.js` by defining additional HTML tags for complex elements.

Please note, that this requires the Bootstrap framework in your document.
For `lecture-slides.js` this is no problem, as Bootstrap is already used
for the main UI and can be used, anyway. For `mini-tutorial.js` projects
Bootstrap must be manually added to the project as it is intentionally not
defined as a dependency here.

Components
----------

See the following pages for screenshots and detailed documentation.

1. [Grid](./doc/lsx-grid.md)
1. [Info Box](./doc/lsx-info-box.md)
1. [Card](./doc/lsx-card.md)
1. [Tab Pages](./doc/lsx-tab-pages.md)
1. [Accordion](./doc/lsx-accordion.md)
1. [Slide Carousel](./doc/lsx-carousel.md)
1. [Youtube Video](./doc/lsx-youtube.md)
1. [Interactive Quiz](./doc/lsx-quiz.md)
1. [List with Emoji Symbols](./lsx-ul.md)
1. [Edit and Download GitHub Repositories Online](doc/lsx-github-edit.md)
1. [Modal Overlay Window](./doc/lsx-modal.md)

Installation
------------

**If you are using `mini-tutorial.js`:**

 1. Add Bootstrap to you project, if you are using `mini-tutorial.js`.
 1. Make sure your bundler allows loading of LESS stylesheets

**In all cases:**

 1. Add this plugin to your presentation: `$ npm add --save-dev @dschulmeis/ls-plugin-extra-tags`
 1. Import it in the `index.js` file
 1. Use the HTML tags below in your presentation

Example for `lecture-slides.js`:

```javascript
"use strict";

import SlideshowPlayer from "lecture-slides.js";
import LS_Plugin_ExtraTags from "ls-plugin-extra-tags";

window.addEventListener("load", () => {
    let player = new SlideshowPlayer({
        plugins: {
            ExtraTags: new LS_Plugin_ExtraTags({
                // Carousel control labels
                labelCarouselNext: "Next Step",
                labelCarouselPrev: "Previous Step",
                labelCarouselReset: "Restart",

                labelGithubEditOnline: "Start Online-IDE",
                labelGithubEditDownload: "Download Source Code",

                labelQuizPoints: "{1} from {2}",
                labelQuizEvaluate: "Correct",
                labelQuizNewTry: "New Try",
                quizExerciseHeading: "h2",

                githubEditUrlPrefix: "https://github.com/DennisSchulmeister/dhbwka-wwi-webprog-quellcodes/tree/master/",
                githubPagesUrlPrefix: "https://dennisschulmeister.github.io/dhbwka-wwi-webprog-quellcodes/",
            }),
        }
    });

    player.start();
});
```

Example for `mini-tutorial.js`:

```javascript
import MiniTutorial from "@dschulmeis/mini-tutorial.js";
import LS_Plugin_ExtraTags from "ls-plugin-extra-tags";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

window.addEventListener("load", () => {
    let mt = new MiniTutorial({
        plugins: [
            new LS_Plugin_ExtraTags({
                // Same options as above
            }),
        ]
    });

    mt.start();
});
```

Copyright
---------

lecture-slides.js: https://www.github.com/DennisSchulmeister/lecture-slides.js <br/>
This plugin: https://github.com/DennisSchulmeister/ls-plugin-extra-tags <br/>
© 2020 – 2025 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de> <br/>
Licensed under the 2-Clause BSD License.
