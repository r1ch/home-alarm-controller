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
            <div v-for="state in states" :class="'progress-bar bg-'+state.color" :style="'width:'+state.offset+'%'"></div>
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
                })
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
        /*signHttpRequest("GET","/alarm/monitor")
        .then(axios)
        .then(({data:{shadow,metrics : {strategyState:strategies,alarmState:states,movement:movements}}})=>{
            this.shadow = shadow
            this.movements = movements
            this.states = states
        })*/
    this.shadow = {
        "armed": true,
        "strategy": "standard",
        "state": "guarding"
    }
    this.strategies = [
            {
                "detail": "standard",
                "timestamp": "2019-08-08T07:27:00.000Z"
            },
            {
                "detail": "blind",
                "timestamp": "2019-08-08T06:59:00.000Z"
            }
        ]
     this.states = [
            {
                "detail": "arming",
                "timestamp": "2019-08-08T07:27:00.000Z"
            },
            {
                "detail": "guarding",
                "timestamp": "2019-08-08T07:27:00.000Z"
            },
            {
                "detail": "quiet",
                "timestamp": "2019-08-08T06:59:00.000Z"
            }
        ],
     this.movements = [
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T07:15:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T07:14:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T07:13:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T07:12:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T07:12:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T07:11:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T07:11:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T07:10:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T07:10:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T07:01:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T06:59:00.000Z"
            }
        ]
    }
})  

