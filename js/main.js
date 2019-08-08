Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    props:['movements'],
    template: `
        <div id = "lineCont">
            <div id = "line">
                <div v-for="movement in processedMovements" class="circle" :id="'circle'+movement.index" :style="'left:'+movement.offset+'%;'">
                    <i :class="'fas fa-'+movement.icon"></i>
                </div>
            </div>    
    </div>`,
    computed : {
        processedMovements(){
            if(this.movements.length >0){
                let earliest = new Date(this.movements[this.movements.length-1].timestamp)
                let latest = new Date()
                let span = latest-earliest
                let offset  =  (time)=>(new Date(time)-earliest)*100/span
                return this.movements.map((movement,index)=>({
                    location : movement.detail,
                    date : new Date(movement.timestamp),
                    offset : offset(movement.timestamp),
                    index: index,
                    icon : movement.location == "Entry" ? "door-open" : "couch"
                }))
            } else {
                console.log("Evaluated too early")
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

