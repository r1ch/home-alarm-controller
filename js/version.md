---
{% assign min = 0 %}
{% assign max = 1000 %}
{% assign diff = max | minus: min %}
{% assign randomNumber = "now"|date: "%N"|modulo: diff|plus: min %}
let versionNumber = {{randomNumber}}
