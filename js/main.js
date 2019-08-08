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
                console.log(earliest,latest,span)
                let output = m.map((M)=>({
                    location : M.detail,
                    date : new Date(M.timestamp),
                    offset : offset(M.timestamp)          
                }))
                console.log("Out",output)
                return output
            } else {
                console.log("Nothing")
            }
        }
    }
})


var app = new Vue({
    el: '#app',
    data : {
        shadow : {},
        movements : [ { "detail": "Entry", "timestamp": "2019-08-08T07:15:00.000Z" }, { "detail": "Entry", "timestamp": "2019-08-08T07:14:00.000Z" }, { "detail": "Entry", "timestamp": "2019-08-08T07:13:00.000Z" }, { "detail": "Entry", "timestamp": "2019-08-08T07:12:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-08T07:12:00.000Z" }, { "detail": "Entry", "timestamp": "2019-08-08T07:11:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-08T07:11:00.000Z" }, { "detail": "Entry", "timestamp": "2019-08-08T07:10:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-08T07:10:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-08T07:01:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-08T06:59:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T23:21:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T23:20:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T22:58:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T22:53:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T22:51:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T22:08:00.000Z" }, { "detail": "Lounge", "timestamp": "2019-08-07T22:07:00.000Z" } ],
        strategies : [],
        states: [],
    },
    mounted : function(){
        /*signHttpRequest("GET","/alarm/monitor")
        .then(axios)
        .then(({data:{shadow,metrics : {strategyState:strategies,alarmState:states,movement:movements}}})=>{
            this.shadow = shadow
            this.movements = movements
        })*/
    }
})  

