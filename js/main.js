Vue.component('google-login', {
	template: `
		<div class = "row justify-content-center">
			<div v-if = "!authenticated" class="g-signin2 col-sm-auto" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>
		</div>
	`,
	data: () => ({
		authenticated: false
	}),
	mounted: function() {
		Credentials.then(() => {
			this.authenticated = true
		})
	}
})

Vue.component('alarm-controls',{
	props: ['shadow'],
	data: () => ({
		authenticated: false,
	}),
	template: `
		<div v-if = "authenticated" class = "row">
			<button v-on:click = "action().handler()" type="button" class="btn btn-primary col-sm-3">{{action().text}}</button>
			<button type="button" class="btn btn-secondary col-sm-3">Secondary</button>
			<button type="button" class="btn btn-success col-sm-3">Success</button>
			<button type="button" class="btn btn-danger col-sm-3">Danger</button>
		</div>
	`,
	mounted: function() {
		Credentials.then(() => {
			this.authenticated = true
		})
	},
	methods: {
		arm(){
			signHttpRequest("POST", "/alarm/monitor/on")
			.then(axios)
			.then(this.$root.fetchData())
		},
		disarm(){
			signHttpRequest("POST", "/alarm/monitor/off")
			.then(axios)
			.then(this.$root.fetchData())
		},
		bedtime(){},
		action() {
			let actionMap = {
				"quiet" : {text:"Arm","handler":this.arm},
				"arming" : {text:"Disarm","handler":this.disarm},
				"guarding" : {text:"Disarm","handler":this.disarm},
				"warning" : {text:"Disarm","handler":this.disarm},
				"sounding" : {text:"Disarm","handler":this.disarm},
				"default" : {text:"Disarm","handler":this.disarm},
			}
			return actionMap[this.shadow.state||"default"]
		}
	},
})

Vue.component('time-d-three', {
	data: function() {
		let margin = {
			top: 50,
			right: 50,
			bottom: 50,
			left: 50
		};
		let fullWidth = 600
		let fullHeight = 150
		let width = fullWidth - margin.left - margin.right;
		let height = fullHeight - margin.top - margin.bottom;
		return {
			margin: margin,
			width: width,
			height: height,
			fullWidth : fullWidth,
			fullHeight : fullHeight,
			svg : false
		}
	},
	props: ['strategies', 'movements'],
	template: `
		<div class = "row">
			<div id = 'd3' class = 'col-sm-12'>
			</div>
		</div>
    	`,
	mounted : function(){
		this.svg = d3.select("#d3")
				.append("svg")
				.attr("width", '100%')
				.attr("height", '100%')
				.attr('viewBox',`0 0 ${this.fullWidth} ${this.fullHeight}`)
				.append("g")
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
		
		this.svg.append("g")
			.attr("class", "y axis")
		
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
	},
	watch : {
		strategies(){
			this.draw()
		},
		movements(){
			this.draw()
		},
	},
	methods: {
		draw() {
			if (this.strategies.length == 0 || this.movements.length == 0) return;
			
			  let t = d3.transition().duration(750);
			
			let xScale = d3.scaleTime()
				.domain(d3.extent(this.strategies, function(d) {
					return d.timestamp
				}))
				.range([0, this.width])

			let xAxis = d3.axisBottom(xScale)
				.ticks(5); // specify the number of ticks

			let yScale = d3.scalePoint()
				.domain(this.movements.map(movement => movement.detail))
				.range([0, this.height])
				.padding(.5)

			let yAxis = d3.axisLeft(yScale)


			this.svg.select(".y")
				.transition(t)
				.call(yAxis);

			this.svg.select(".x")
				.transition(t)
				.call(xAxis);

			let strategyBlocks = [];
			
			for (i = 0; i < this.strategies.length - 1; i++) {
				let output = {
					end: xScale(this.strategies[i].timestamp),
					start: xScale(this.strategies[i + 1].timestamp),
					detail: this.strategies[i + 1].detail
				}
				output.width = output.end - output.start
				strategyBlocks.push(output)
			}

			let strategies = this.svg.selectAll('.strategy')
				.data(strategyBlocks)
			
						
			strategies.exit().transition(t).remove()
			
			strategies
				.attr('x', function(d) {
					return d.start
				})
				.attr('y', 0)
				.attr('width', function(d) {
					return d.width
				})
				.attr('height', this.height)
			
			strategies.enter()
				.append('rect')
				.attr('class', function(d){return `strategy ${d.detail}`})
				.attr('x', function(d) {
					return d.start
				})
				.attr('y', 0)
				.attr('width', function(d) {
					return d.width
				})
				.attr('height', this.height)

			
			let iconSize = 8;
			let iconMap = {
				standard : '\uf06e',
				bedtime : '\uf236',
				blind : '\uf070'
			}

			let icons = this.svg.selectAll('.icon')
				.data(strategyBlocks)
			
			icons.exit().transition(t).remove()
			
			
			icons
				.attr('class', function(d){return `icon ${d.detail} fa`})
				.attr('x', function(d) {
					return d.start + d.width/2
				})
				.attr('y', (d)=>{
					if(d.width > iconSize) return this.height/2 + iconSize/2
					else return iconSize/2
				})
				.attr('text-anchor', 'middle')
				.attr('font-weight', '900')
				.attr('font-size', `${iconSize}px`)
				.text(function(d) { return iconMap[d.detail]})
			
			icons.enter()
				.append('text')
				.attr('class', function(d){return `icon ${d.detail} fa`})
				.attr('x', function(d) {
					return d.start + d.width/2
				})
				.attr('y', (d)=>{
					if(d.width > iconSize) return this.height/2 + iconSize/2
					else return iconSize/2
				})
				.attr('text-anchor', 'middle')
				.attr('font-weight', '900')
				.attr('font-size', `${iconSize}px`)
				.text(function(d) { return iconMap[d.detail]})
		
			
			let movementSize = 12;

			let movements =  this.svg.selectAll('.movement')
				.data(this.movements)
						
			movements.exit().transition(t).remove()
			
			movements
				.attr('class', function(d){return `movement ${d.detail}`})
				.attr('cx', function(d) {
					return xScale(d.timestamp);
				})
				.attr('cy', function(d) {
					return yScale(d.detail);
				})
				.attr('r', `${movementSize/2}`)

				
			movements.enter()
				.append('circle')
				.attr('class', function(d){return `movement ${d.detail}`})
				.attr('cx', function(d) {
					return xScale(d.timestamp);
				})
				.attr('cy', function(d) {
					return yScale(d.detail);
				})
				.attr('r', `${movementSize/2}`)
			



			return true;
		}
	}
})



var app = new Vue({
	el: '#app',
	data: {
		raw : false,
	},
	methods : {
		fetchData(){
			signHttpRequest("GET", "/alarm/monitor")
				.then(axios)
				.then(({
					data
				}) => {
					this.raw = data;
				})
		}
	},
	computed: {
		shadow(){
			if(!this.raw.shadow) return {}
			return this.raw.shadow;
		},
		strategies(){
			if(!this.raw.metrics) return []
			let strategies = this.raw.metrics.strategyState.map(strategy => {
				strategy.timestamp = new Date(strategy.timestamp);
				return strategy;
			})

			strategies.unshift({
				timestamp: new Date,
				detail: "unknown"
			})

			if(strategies.length == 1){
				strategies.push({
					timestamp: new Date(Date.now() - 24*60*60*1000),
					detail: this.shadow.strategy
				})
			}
			return strategies
		},
		movements() {
			if(!this.raw.metrics || this.strategies.length == 0) return []
			let earliestStrategy = this.strategies.reduce((a,b)=>({timestamp:Math.min(a.timestamp,b.timestamp)}));
			let earliestDate = new Date(earliestStrategy.timestamp)

			return this.raw.metrics.movement
			.map(movement => {
				movement.timestamp = new Date(movement.timestamp);
				return movement;
			})
			.filter(movement=>movement.timestamp>earliestDate)	
		}
	},
	/*mounted : function (){
	    this.rawShadow = {"armed":false,"strategy":"blind","state":"quiet"}
	    this.rawStrategies = [{"detail":"blind","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"standard","timestamp":"2019-08-11T09:59:00.000Z"}]
	    //this.states = [{"detail":"quiet","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"warning","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"guarding","timestamp":"2019-08-11T09:59:00.000Z"},{"detail":"arming","timestamp":"2019-08-11T09:58:00.000Z"}]
	    this.rawMovements = [{"detail":"Entry","timestamp":"2019-08-11T13:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:07:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:03:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T13:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:02:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:01:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T13:00:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:55:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:50:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:49:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:48:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:47:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:47:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:46:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:46:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:44:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:44:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:42:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:41:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:40:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:39:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:38:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:38:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:37:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:37:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:36:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:36:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:35:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:35:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:34:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:30:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:29:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:28:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:27:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:26:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:23:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:22:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:21:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:14:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:10:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T12:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:09:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T12:08:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:57:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:54:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:52:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:51:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:51:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:50:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:50:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:38:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:35:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:33:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:32:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:31:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:30:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:29:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:28:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:27:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:24:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:24:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:21:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:19:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:17:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:16:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:16:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:15:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:13:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:09:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:08:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:07:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:06:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:05:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:02:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:01:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T09:00:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T09:00:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:59:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:56:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T08:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:55:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:52:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:51:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:50:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:46:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:43:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:42:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:41:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:40:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:35:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:34:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:33:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:32:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:21:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:19:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:15:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:14:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:13:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:11:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:10:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:09:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:06:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:04:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T08:03:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:59:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:58:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:57:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:56:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:55:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:54:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:54:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:53:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:53:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:45:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:45:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:26:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:25:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:24:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:23:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:22:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:21:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:20:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:19:00.000Z"},{"detail":"Entry","timestamp":"2019-08-11T07:18:00.000Z"},{"detail":"Lounge","timestamp":"2019-08-11T07:18:00.000Z"}]                      
	}*/
	mounted: function() {
		this.fetchData();
	}
})
