# Acessible tables for magnifier user - companion resourses

This is the comanion resources to the paper:

> Frode Eika Sandness, Nusrat Akter, I. Scott Mac-Kenzie: Improving the Accessibility of Web Tables for Magnifier Users with Annotations and Crumbs. In: ICCHP 2026, Computers Helping People with Special Needs, 20th International Conference, LNCS, Springer, In press (2026).

The paper explores two visual emellishments for making tables more accessible to magnifier users.

## Trying the magnification embellishments

A live demo of the experimental platform can be found here:
https://frode-sandnes.github.io/table-magnify-exp-2026/

You can create bookmarks to the following bookmarklets and apply the techniques on any website.
- [Annotate](): The highlighted cell is annotated with the corresponding column and row header.
- [Crumbs](): The visited cells are higlighted, as well as the corresponding row and column, leaving a breadcrumbs trail along the patth of the viewed table.
- [Snippet](): A popup shows recently visited cells for quick refernce (discussed by not included in the experiment as the concept need more work).

You may experiment with combinibng the bookmarklets to get the benefits of each.

It is assumed that the tables take the following format: First row and column contains header information. Each row contain a separate item and the columns contain corresponding attributes of each item.

Note that these are simply prototype demonstrations. THey use fixed colours for simplicity which may render too low contrast with particular web site designs. 


## Breif overview of the code comonents
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
- [page.html](page.html): Iframe showing the table (inside the "keyhole"
