---
layout: default
---

<div id = "app"></div>

<div :class = "shadow.state" id = "2">
    <state-view :shadow = "shadow" :ready = "ready"></state-view>
    <google-login></google-login>
    <time-d-three :movements = "movements" :strategies = "strategies" :shadow = "shadow" :ready = "ready"></time-d-three>
    <alarm-controls :shadow = "shadow" :presence = "presence" :ready = "ready" :boost = "boost"></alarm-controls>
    <version-stamp :cache = "cache"></version-stamp>
</div>
<script src="js/main.js"></script>
