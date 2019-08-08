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
            <div v-for="state in processedStates" :class="'progress-bar bg-'+state.class" :style="'width:'+state.offset+'%'"></div>
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
                        class : state.detail == "quiet" ? "success" : "warning"
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
        "armed": false,
        "strategy": "blind",
        "state": "quiet"
    }
    this.strategies =  [
            {
                "detail": "blind",
                "timestamp": "2019-08-08T18:37:00.000Z"
            },
            {
                "detail": "standard",
                "timestamp": "2019-08-08T17:37:00.000Z"
            },
            {
                "detail": "blind",
                "timestamp": "2019-08-08T16:27:00.000Z"
            },
            {
                "detail": "standard",
                "timestamp": "2019-08-08T07:27:00.000Z"
            },
            {
                "detail": "blind",
                "timestamp": "2019-08-08T06:59:00.000Z"
            }
        ]
        this.states =  [
            {
                "detail": "quiet",
                "timestamp": "2019-08-08T18:37:00.000Z"
            },
            {
                "detail": "warning",
                "timestamp": "2019-08-08T18:37:00.000Z"
            },
            {
                "detail": "arming",
                "timestamp": "2019-08-08T17:37:00.000Z"
            },
            {
                "detail": "guarding",
                "timestamp": "2019-08-08T17:37:00.000Z"
            },
            {
                "detail": "quiet",
                "timestamp": "2019-08-08T16:27:00.000Z"
            },
            {
                "detail": "warning",
                "timestamp": "2019-08-08T16:27:00.000Z"
            },
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
        ]
        this.movement = [
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:56:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:56:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:55:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:55:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:54:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:53:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:53:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:52:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:44:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:44:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:39:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:38:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:38:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:37:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:36:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T19:36:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:35:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:34:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:33:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:31:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:30:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:29:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:27:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:26:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:25:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:21:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:20:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:15:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:14:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:05:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:04:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T19:03:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:55:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:51:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:48:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:47:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:46:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:46:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:45:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:45:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:44:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:44:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:43:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:43:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:42:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:42:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:41:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T18:39:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:39:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:38:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T18:37:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:25:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:24:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:24:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:23:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:21:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:20:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:19:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:18:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:17:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:16:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:15:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:14:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:13:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T17:12:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:12:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:11:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:10:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:09:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T17:03:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T16:59:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T16:58:00.000Z"
            },
            {
                "detail": "Lounge",
                "timestamp": "2019-08-08T16:29:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T16:29:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T16:28:00.000Z"
            },
            {
                "detail": "Entry",
                "timestamp": "2019-08-08T16:27:00.000Z"
            },
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
                "detail": "Lounge",
                "timestamp": "2019-08-08T07:12:00.000Z"
            },
            {
                "detail": "Entry",
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

