Vue.component('google-login', {
    template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
    data : ()=>({authenticated : false}),
    mounted : function(){
        Credentials.then(()=>{this.authenticated = true})
    }
})

Vue.component('time-d-three',{
    data : function(){
        let margin = {top: 100, right: 100, bottom: 100, left: 100};
        let width = 960 - margin.left - margin.right;
        let height = 500 - margin.top - margin.bottom;
        return  {
            margin : margin,
            width : width,
            height : height
        }
    },
    props:['strategies','movements'],
    template: `
        <div id = 'd3'>
{{svg}}
        </div>
    `,
    computed : {
        svg(){
        if(this.strategies.length == 0) return;
        let x = d3.scaleTime()
            .domain([
              this.strategies[this.strategies.length-1].timestamp,
              this.strategies[0].timestamp
            ])
        .range([0, this.width]);

        let xAxis = d3.axisBottom(x)
            .ticks(10); // specify the number of ticks
            
        let y = d3.scaleBand()
            .domain(this.movements.map(movement=>movement.detail))
            .range([this.height, 0])
            .paddingInner(0.05);

        let yAxis = d3.axisLeft(y)

        let svg = d3.select("#d3").append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis);
            
       svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
       
       return svg
        }
    }
})

Vue.component('time-line', {
    props:['strategies','movements','span'],
    template: `
        <div id = "timelineContainer">
            <div class="progress timeline">
                <div v-for="strategy in processedStrategies" :class="'progress-bar bg-'+strategy.type" :style="'width:'+strategy.offset+'%'">{{strategy.detail}}</div>
            </div>
            <div class = "timelineEvent" v-for = "movement in processedMovements" v-if = "movement.show" :style = "'left:'+movement.offset+'%'">
                <div :class = "'timelineMarker track-'+movement.track">
                    <i :class="'fas fa-'+movement.icon"></i>
                </div>
            </div>
        </div>`,
    computed : {
        processedMovements(){
            if(this.movements.length > 0){
                let offset  =  (time)=>(time-this.span.earliest)*100/this.span.range
                return this.movements
                .filter(movement=>movement.timestamp>this.span.earliest)
                .map((movement,index,array)=>{
                    let portion = {
                        location : movement.detail,
                        date : movement.timestamp,
                        offset : offset(movement.timestamp),
                        index: index,
                        show : true,
                        track : movement.detail == "Entry" ? "one" : "two",
                        icon : movement.detail == "Entry" ? "door-open" : "couch"
                    }
                    return portion
                }).reverse()
            } else {
                console.log("No movements yet")
            }
        },
        processedStrategies(){
            let typeMap = {
                blind : "success",
                standard : "danger",
                bedtime : "warning",
                unknown : "info"
            }
            if(this.strategies.length > 0){
               let offset = (a,b)=>{
                   a =  Math.max(this.span.earliest,a)
                   b =  Math.max(this.span.earliest,b)
                   return (a - b)*100/this.span.range
               }
               let output = []
               for(i=0;i<this.strategies.length-1;i++){
                    let previous = this.strategies[i]
                    let current = this.strategies[i+1]
                    console.log(`Pre: ${previous.timestamp}:${previous.detail}`)
                    console.log(`Cur: ${current.timestamp}:${current.detail}`)
                    let portion = {
                        offset : offset(previous.timestamp,current.timestamp),
                        type : typeMap[current.detail],
                        detail : current.detail
                    }
                    output.push(portion)
               }
               return output.reverse()
            } else {
                console.log("No strategies/shadow yet")
            }
        }
    }
})


var app = new Vue({
    el: '#app',
    data : {
        rawShadow : {},
        rawStrategies : [],
        rawMovements : [],
        span : {
            now : new Date(),
            earliest : new Date(Date.now() - 24*60*60*1000),
            range : 24*60*60*1000
        }
    },
    computed : {
        shadow(){
           return this.rawShadow
        },
        strategies(){
            if(this.rawStrategies.length===0) return []
            let output = this.rawStrategies.map(strategy=>{
                strategy.timestamp = new Date(strategy.timestamp)
                return strategy
            })
            output.unshift({timestamp: this.span.now})
            output.push({timestamp:this.span.earliest,detail:"unknown"})
            return output
        },
        movements(){
            if(this.rawMovements.length===0) return []
            let output = this.rawMovements.map(movement=>{
                movement.timestamp = new Date(movement.timestamp)
                return movement
            })
            return output
        }
    },
    /*mounted : function (){
        this.rawShadow = {"armed":false,"strategy":"blind","state":"quiet"}
        this.rawStrategies = [{"detail":"blind","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"standard","timestamp":"2019-08-11T09:59:00.000Z"}]
        //this.states = [{"detail":"quiet","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"warning","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"guarding","timestamp":"2019-08-11T09:59:00.000Z"},{"detail":"arming","timestamp":"2019-08-11T09:58:00.000Z"}]
        this.rawMovements = [{"detail":"Entry","timestamp":"2019-08-11T13:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:07:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:03:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:02:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:01:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:00:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:55:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:50:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:49:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:48:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:47:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:47:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:46:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:46:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:44:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:44:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:42:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:41:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:40:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:39:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:38:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:38:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:37:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:37:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:36:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:36:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:35:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:35:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:34:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:30:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:29:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:28:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:27:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:26:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:23:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:22:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:21:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:14:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:10:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:57:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:54:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:52:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:51:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:50:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:50:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:38:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:35:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:33:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:32:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:31:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:30:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:29:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:28:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:27:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:24:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:24:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:21:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:19:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:17:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:16:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:16:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:15:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:13:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:09:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:08:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:07:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:06:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:05:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:02:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:01:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:00:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:00:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:59:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:56:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:55:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:51:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:50:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:46:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:35:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:33:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:32:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:21:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:19:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:15:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:14:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:13:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:09:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:06:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:54:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:53:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:45:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:26:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:24:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:23:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:21:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:19:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:18:00.000Z"}]                      
    }*/
    mounted : function(){
        signHttpRequest("GET","/alarm/monitor")
        .then(axios)
        .then(({data})=>{
            this.rawShadow = data.shadow
            this.rawMovements = data.metrics.movement
            this.rawStrategies = data.metrics.strategyState
        })
    }
})  

