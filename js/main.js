Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    props:['metrics'],
    template: `<div>
        <div v-for="movement in metrics.movement">
            {{movement}}
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
    },
    computed : {
        movements(){
            let earliest = new Date(this.metrics.movement[this.metrics.movement.length-1])
            let latest = new Date(this.metrics.movement[0])
            let span = latest-earliest
            let offset  =  (time)=>(new Date(time)-earliest)/span
            return this.metrics.movement.map((movement)=>({
                location : movement.detail,
                date : new Date(movement.timestamp),
                offset : offset(movement.timestamp)          
            }))
        }
    }
})  

