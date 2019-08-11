Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-line', {
    props:['movements','strategies','shadow'],
    template: `
        <div id = "timelineContainer">
            <div class="progress">
                <div v-for="strategy in processedStrategies" :class="'progress-bar bg-'+strategy.class" :style="'width:'+strategy.offset+'%'">{{strategy.detail}}</div>
            </div>
            {{strategies}}
            <div class = "timelineEvent" v-for = "movement in processedMovements" :style = "'position:absolute;top:8;left:'+movement.offset+'%'">
                <i :class="'fab fa-'+movement.icon"></i>
            </div>
        </div>`,
    computed : {
        processedMovements(){
            if(this.movements.length >0){
                console.log("Have movements")
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
        processedStrategies(){
            return []
            let classMap = {
                blind : "success",
                standard : "danger",
                bedtime : "warning"
            }
            //the rest are transient
            if(this.shadow && this.strategies.length > 0){
               let earliest = new Date(this.strategies[this.strategies.length-1].timestamp)
               let now = new Date();
               let span = now - earliest
               let offset = (a,b)=>(new Date(a) - new Date(b))*100/span
               let previous = {
                detail: this.shadow.strategy,
                timestamp : now
               }
               return this.strategies.map((strategy)=>{
                   return {
                        offset : offset(previous.timestamp,this.strategies[i].timestamp),
                        class : classMap[previous.detail],
                        detail : previous.detail
                   }
                   previous = strategy
                }).reverse()
            } else {
                console.log("No strategies/shadow yet")
                console.log(this.strategies)
                console.log(this.shadow)
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
        states: []
    },
    mounted : function (){
        this.shadow = {"armed":false,"strategy":"blind","state":"quiet"}
        this.strategies = [{"detail":"blind","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"standard","timestamp":"2019-08-11T09:59:00.000Z"}]
        this.states = [{"detail":"quiet","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"warning","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"guarding","timestamp":"2019-08-11T09:59:00.000Z"},{"detail":"arming","timestamp":"2019-08-11T09:58:00.000Z"}]
        this.movements = [{"detail":"Entry","timestamp":"2019-08-11T13:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:07:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:03:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:02:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:01:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:00:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:55:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:50:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:49:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:48:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:47:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:47:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:46:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:46:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:44:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:44:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:42:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:41:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:40:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:39:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:38:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:38:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:37:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:37:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:36:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:36:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:35:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:35:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:34:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:30:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:29:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:28:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:27:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:26:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:23:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:22:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:21:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:14:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:10:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:57:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:54:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:52:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:51:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:50:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:50:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:38:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:35:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:33:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:32:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:31:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:30:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:29:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:28:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:27:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:24:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:24:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:21:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:19:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:17:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:16:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:16:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:15:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:13:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:09:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:08:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:07:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:06:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:05:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:02:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:01:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:00:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:00:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:59:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:56:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:55:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:51:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:50:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:46:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:35:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:33:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:32:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:21:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:19:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:15:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:14:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:13:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:09:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:06:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:54:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:53:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:45:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:26:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:24:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:23:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:21:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:19:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:18:00.000Z"}]
        console.log(this.shadow,this.strategies,this.states,this.movements,"Done")
    }/*
    mounted : function(){
        signHttpRequest("GET","/alarm/monitor")
        .then(axios)
        .then(({data:{shadow,metrics : {strategyState:strategies,alarmState:states,movement:movements}}})=>{
            this.shadow = shadow
            this.movements = movements
            this.states = states
        })
    }*/
})  

