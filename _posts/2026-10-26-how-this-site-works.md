---
title: "How this site works"
slug: how-this-site-works
lang: en
description: "Rules are sentences, and you can push them around."
categories: [meta]
tags: [site, puzzle]
math: true
---

Most of this site is ordinary reading: who I am, what I have written, where I have spoken. It is also, quietly, a puzzle. Most pages open with a small board whose rules are written on the board itself, as sentences you can push around — and whose bottom row has gates to every other page.

A rule is three blocks in a row or a column — a subject, the verb *is*, and a property. <span class="rule"><span class="rw rw--s">webb</span><span class="rw rw--v">is</span><span class="rw rw--o">you</span></span> means the round thing with the arrow is you; <span class="rule"><span class="rw rw--s">star</span><span class="rw rw--v">is</span><span class="rw rw--o">win</span></span> means walking onto the star wins. The rules are the ones from *Baba Is You*: any sentence you can spell holds, so <span class="rule"><span class="rw rw--s">webb</span><span class="rw rw--v">is</span><span class="rw rw--o">win</span></span> wins on the spot.

## Rules are sentences

Read left to right or top to bottom, any noun–*is*–property triple on the board is a rule. After every move the board is read again, so the set of rules is just a function of where the words are:

$$
R(B) = \{\, (n, p) : n \cdot \mathrm{is} \cdot p \text{ appears in a row or column of } B \,\}
$$

Push a word out of line and its rule disappears; push it back and the rule holds again. That is the whole game.

## If you would rather read

Every puzzle has a plain-text twin. The first time you open the site it asks whether you want the game at all, and “Hide puzzles” under any board turns them off everywhere. The blog has no boards.

## How posts are written

Posts live in the site's repository as Markdown files in `_posts/`, each with a short header. Math goes between double dollar signs.

```yaml
---
title: "How this site works"
categories: [meta]
tags: [site, puzzle]
series: "Paper notes"   # optional — groups posts into a series
math: true              # optional — loads MathJax for $$ … $$
---
```

Add a file, push, and the post appears on the blog, in the feed and in the archive.
