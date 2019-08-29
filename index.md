---
layout: default
---

<div :class = "shadow.state" id = "app">
    <state-view :shadow = "shadow" :ready = "ready"></state-view>
    <google-login></google-login>
    <time-d-three :movements = "movements" :strategies = "strategies" :ready = "ready"></time-d-three>
    <alarm-controls :shadow = "shadow" :presence = "presence" :ready = "ready"></alarm-controls>
    <version-stamp :cache = "cache"></version-stamp>
</div>
<script src="js/main.js"></script>
