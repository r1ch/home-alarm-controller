Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    props:['movements'],
    template: `<div>
        <div v-for="movement in processedMovements">
            {{movement}}
        </div>
    </div>`,
    computed : {
        processedMovements(){
            let m = this.movements
            if(m){
                let earliest = new Date(m[m.length-1])
                let latest = new Date(m[0])
                let span = latest-earliest
                let offset  =  (time)=>(new Date(time)-earliest)/span
                return m.map((M)=>({
                    location : M.detail,
                    date : new Date(M.timestamp),
                    offset : offset(M.timestamp)          
                }))
            }
        }
    }
})


var app = new Vue({
    el: '#app',
    data : {
        shadow : {},
        movements : [],
        strategies : [],
        states: [],
    },
    mounted : function(){
        signHttpRequest("GET","/alarm/monitor")
        .then(axios)
        .then(({data:{shadow,metrics : {strategyState:strategies,alarmState:states,movement:movements}}})=>{
            this.shadow = shadow
            this.movements = movements
        })
    }
})  

