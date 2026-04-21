# Accessible tables for magnifier user - companion resources

This is the companion resources to the paper:

> Frode Eika Sandness, Nusrat Akter, I. Scott MacKenzie: Improving the Accessibility of Web Tables for Magnifier Users with Annotations and Crumbs. In: ICCHP 2026, Computers Helping People with Special Needs, 20th International Conference, LNCS, Springer, In press (2026).

The paper explores two visual embellishments for making tables more accessible to magnifier users.

## Trying the magnification embellishments

A live demo of the experimental platform can be found here:
https://frode-sandnes.github.io/table-magnify-exp-2026/

You can bookmark bookmarklets implmeneting each of the techniques and apply them (hopefully) to any website.
- [Bookmarklet collection](https://frode-sandnes.github.io/table-magnify-exp-2026/bookmarklets.html)

You may experiment by combining the bookmarklets to get the benefits of each.

It is assumed that the tables take the following format: First row and column contain header information. Each row contains a separate item and the columns contain corresponding attributes of each item.

Note that these are simply prototype demonstrations. They use fixed colors for simplicity which may render too low contrast with particular web site designs. 

The code has only been tested with Chrome.

## Brief overview of the code components
The embellishments:
- [annotateTooltip.js](annotateTooltip.js)
- [breadcrumbs.js](breadcrumbs.js)
- [snippet.js](snippet.js)

Experiment framework
- [experimentConfig.js](experimentConfig.js): most of the experiment configuration parameters
- [randomTable.js](randomTable.js): generating random tables
- [tableController.js](tableController.js): table logic for detecting table interactions
- [likertModal.js](likertModal.js): Likert question mobal logic
- [submitToForm.js](submitToForm.js): Logging logic.
- [index.html](index.html): Main page
- [page.html](page.html): The iFrame showing the table (inside the "keyhole")

