Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>'
})

var app = new Vue({
  el: '#app',
  data: {
    authenticated : false;
  },
  mounted : function(){
    Credentials.then(()=>{authenticated = true})
  }
})

