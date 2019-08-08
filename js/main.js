Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    props:['movements','states'],
    template: `
        <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 15%" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
        <div v-for="state in state" :class="'progress-bar bg-'{{state.color}}" role="progressbar" :style="'width: '{{state.offset}}%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
        <div class="progress-bar bg-info" role="progressbar" style="width: 20%" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
    `,
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
                    icon : movement.detail == "Entry" ? "door-open" : "couch"
                }))
            } else {
                console.log("No movements yet")
            }
        },
        processedStates(){
            if(this.states.length >0){
                let earliest = new Date(this.states[this.states.length-1].timestamp)
                let latest = new Date()
                let span = latest-earliest
                let offset  =  (time)=>(new Date(time)-earliest)*100/span
                let progress = 0;
                return this.states.map((state)=>{
                    let slice = offset(state.timestamp)-progress
                    let output = {
                        date : new Date(state.timestamp),
                        offset : slice,
                        color : state.detail == "armed" ? "success" : "warning"
                    }
                    progress += slice
                    return output
                }))
            } else {
                console.log("No states yet")
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
            this.states = states
        })
    }
})  

