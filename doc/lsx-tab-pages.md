Tab Pages
=========

1. [Usage](#usage)
1. [JavaScript API](#javascript-api)


Usage
-----

Tab pages allow to switch between different content pages by clicking on a title.

<img src="./img/lsx-tab-pages.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-tab-pages id="example">
    <lsx-tab-page title="Explanation">
        Content of the first tab page.
    </lsx-tab-page>
    <lsx-tab-page title="Case Study">
        Content of the second tab page.
    </lsx-tab-page>
    <lsx-tab-page title="Example Code">
        Content of the third tab page.
    </lsx-tab-page>
</lsx-tab-pages>
```

They will be rendered as plain bootstrap tab pages:

```html
<div>
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a
                id             = "example-page1-tab"
                class          = "nav-link active"
                data-bs-toggle = "tab"
                href           = "#example-page1"
                role           = "tab"
                aria-controls  = "example-page1"
                aria-expanded  = "true"
            >
                Explanation
            </a>
        </li>
        <li class="nav-item">
            <a
                id             = "example-page2-tab"
                class          = "nav-link"
                data-bs-toggle = "tab"
                href           = "#example-page2"
                role           = "tab"
                aria-controls  = "example-page2"
            >
                Case Study
            </a>
        </li>
    </ul>
    <div class="tab-content">
        <div
            class           = "tab-pane fade show active"
            id              = "example-page1"
            role            = "tabpanel"
            aria-labelledby = "example-page1-tab"
        >
            Content of the first tab page.
        </div>
        <div
            class           = "tab-pane fade"
            id              = "example-page2"
            role            = "tabpanel"
            aria-labelledby = "example-page2-tab"
        >
            Content of the second tab page.
        </div>
    </div>
</div>
```


JavaScript API
--------------

TODO