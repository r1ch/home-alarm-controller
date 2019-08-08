Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    props:['processedMovements'],
    template: `<div>
        <div v-for="movement in processedMovements">
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
            console.log(movements)
            console.log(this.movements)
        })
    },
    computed : {
        processedMovements(){
            console.log("Processing",this.movements)
            let earliest = new Date(this.movements[this.movements.length-1])
            let latest = new Date(this.movements[0])
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

