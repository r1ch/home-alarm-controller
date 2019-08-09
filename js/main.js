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
        <div id = "timelineContainer">
            <div class="progress">
                <div v-for="state in processedStates" :class="'progress-bar bg-'+state.class" :style="'width:'+state.offset+'%'">{{state.detail}}</div>
            </div>
            <div class = "timelineEvent" v-for = "movement in processedMovements" :style = "'position:absolute;top:8;left:'+movement.offset+'%'">
                <i :class="'fab fa-'+movement.icon"></i>
            </div>
        </div>
    `,
    computed : {
        processedMovements(){
            if(this.movements.length >0){
                let earliest = new Date(this.movements[this.movements.length-1].timestamp)
                let now = new Date()
                let span = now-earliest
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
            let stateMap = {
                quiet:{
                    bg : "success",
                    import : 0
                },
                guarding:{
                    bg: "warning",
                    import : 1
                },
                sounding: {
                    bg : "danger",
                    import : 2
                }
            }
            //the rest are transient
            if(this.states.length >0){
                let earliest = new Date(this.states[this.states.length-1].timestamp)
                let now = new Date()
                let span = now-earliest
                let spanBetween  =  (now,then)=>(new Date(now)-new Date(then))*100/span;
                return this.states
                    .filter(state=>Object.keys(stateMap).includes(state.detail))
                    .sort((a,b)=>new Date(b.timestamp)+stateMap[b.detail].import-new Date(a.timestamp)-stateMap[a.detail].import)
                    .map((state,index,arr)=>{
                        let previous = index === 0 ? {timestamp:now} : arr[index-1]
                        let output = {
                            date : new Date(state.timestamp),
                            offset : spanBetween(previous.timestamp,state.timestamp),
                            class : stateMap[state.detail].bg,
                            detail : state.detail
                        }
                        console.log("Sort",new Date(state.timestamp)+stateMap[state.detail].import,stateMap[state.detail].import,state)
                        console.log(output)
                        return output
                    })
                    .reverse()
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

