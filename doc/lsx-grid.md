Bootstrap Grid
==============

This is just a simple wrapper around bootstrap's `<div class="container-fluid">`,
`<div class="row">` and `<div class="col">` to make the HTML code more readable.

```html
<lsx-grid-fluid>
    <lsx-row>
        <lsx-col size="md-6 xl-8">
            ...
        </lsx-col>
    </lsx-row>
</lsx-grid-fluid>
```

This will be translated to:

```html
<div class="container-fluid">
    <div class="row">
        <div class="col-md-6 col-xl-8">
            ...
        </div>
    </div>
</div>
```

`<lsx-grid>` will be translated to `<div class="container">`.