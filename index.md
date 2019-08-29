<!DOCTYPE html>
<html lang="en">

    <head>
        <meta content="width=device-width, initial-scale=1.0" name="viewport">
        <meta charset="UTF-8">
        <meta name="google-signin-scope" content="profile">
        <meta name="google-signin-client_id"
            content="997641939483-l1c092jvameppl6vrj22efr2okreos21.apps.googleusercontent.com">
        <script src="https://apis.google.com/js/platform.js" async defer></script>
        <script src="https://sdk.amazonaws.com/js/aws-sdk-2.488.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="https://kit.fontawesome.com/7370ae70b4.js"></script>
        <script src="https://d3js.org/d3.v5.min.js"></script>
        <script src="js/awsconfig.js"></script>
        <script src="js/authentication.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
        <link rel="stylesheet" type="text/css" href="css/main.css">
        <title>Home monitor</title>
    </head>

    <body>
        <div :class = "shadow.state" id = "app">
            <state-view :shadow = "shadow" :ready = "ready"></state-view>
            <google-login></google-login>
            <time-d-three :movements = "movements" :strategies = "strategies" :ready = "ready"></time-d-three>
            <alarm-controls :shadow = "shadow" :presence = "presence" :ready = "ready"></alarm-controls>
            <version-stamp :cacheVersion = "cacheVersion"></version-stamp>
        </div>
        <script>
            {% assign min = 0 %}
            {% assign max = 10000 %}
            {% assign diff = max | minus: min %}
            {% assign randomNumber = "now" | date: "%N" | modulo: diff | plus: min %}
            let versionNumber = {{randomNumber}};
        </script>
        <script src="js/main.js"></script>
    </body>
</html>
