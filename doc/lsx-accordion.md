Accordion
=========

An accordion works similar to tab pages in that it allows to switch between
multiple sub-pages. Unlike tab pages, the accordion pages are stacked
vertically, however.

<img src="./img/lsx-accordion.png" style="border: 1px solid lightgrey; margin-bottom: 1em" />

```html
<lsx-accordion id="example">
    <!-- Short version with plain-text title -->
    <lsx-accordion-page title="First Page" bold active>
        Content of the first accordion page.
    </lsx-accordion-page>

    <!-- Long version with HTML title -->
    <lsx-accordion-page>
        <lsx-accordion-title>
            <b>Second Page</b>
        </lsx-accordion-title>
        <lsx-accordion-content>
            Content of the second accordion page.
        <lsx-accordion-content>
    </lsx-accordion-page>

    <!-- Long version with left and right title content -->
    <lsx-accordion-page>
        <lsx-accordion-title>
            <div class="w-100 me-3 d-flex justify-content-between">
                <b><tt>GET</tt></b>
                <span>Request Resources</span>
            </div>
        </lsx-accordion-title>
        <lsx-accordion-content>
            Content of the third accordion page
        </lsx-accordion-content>
    <lsx-accordion-page>
</lsx-accordion>
```

This will be rendered as:

```html
<div id="example" class="accordion">
    <div class="accordion-item">
        <div
            id    =  "example-page1-title"
            class = "accordion-header font-weight-bold"
        >
            <button
                class          = "accordion-button bg-light text-body fs-5"
                type           = "button"
                data-bs-toggle = "collapse"
                data-bs-target = "#example-page1-content"
                aria-controls  = "example-page1-content"
                aria-expanded  = "false"
            >
                First Page
            </button>
        </div>
        <div
            id              = "example-page1-content"
            class           = "accordion-collapse collapse"
            aria-labelledby = "example-page1-title"
            data-bs-parent  = "#example"
        >
            <div class="accordion-body">
                Content of the first accordion page.
            </div>
        </div>
    </div>

    <div class="accordion-item">
        <div
            id    = "example-page2-title"
            class = "accordion-header"
        >
            <button
                class          = "accordion-button bg-light text-body fs-5"
                type           = "button"
                data-bs-toggle = "collapse"
                data-bs-target = "#example-page2-content"
                aria-controls  = "example-page2-content"
                aria-expanded  = "false"
            >
                <b>Second Page</b>
            </button>
        </div>
        <div
            id              = "example-page2-content"
            class           = "accordion-collapse collapse"
            aria-labelledby = "example-page2-title"
            data-bs-parent  = "#example"
        >
            <div class="accordion-body">
                Content of the second accordion page.
            </div>
        </div>
    </div>
</div>
```

The attribute `active` can be used to open one page by default. Accordingly
the attribute `bold` can be used to render a bold page title.