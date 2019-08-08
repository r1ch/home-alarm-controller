Vue.component('google-login', {
    template: '<div v-if = "CredentialsStatus.notReady" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>'
})

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})

