Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    template: `<div>
        <div v-for="event in metrics">
            {{event}}
        </div>
    </div>`,
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})


var app = new Vue({
    el: '#app',
    data : {
        shadow : {},
        metrics : {}
    },
    mounted : function(){
        signHttpRequest("GET","/alarm/monitor")
        .then(axios)
        .then(({data:{shadow,metrics}})=>{
            this.shadow = shadow
            this.metrics = metrics
        })
    }
})  

