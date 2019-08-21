Vue.component('google-login', {
	data: () => ({
		authenticated: false
	}),
	template: `
		<div class = "row">
			<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>
		</div>
	`,
	mounted: function() {
		Credentials.then(() => {
			this.authenticated = true
		})
	}
})

Vue.component('state-view',{
	props: ['shadow','ready'],
	template: `
		<div class = "row center-align" v-if = "ready">
			<br><br>
			<i :class="'fas fa-'+icon+' fa-5x'"></i>
		</div>
	`,
	computed : {
		icon(){
			if(!this.shadow.strategy || !this.shadow.state){
				return "lock"
			} else if (this.shadow.strategy == "bedtime"){
				return "bed"
			} else if (this.shadow.state == "quiet"){
				return "lock-open"
			} else {
				return "lock"
			}
		}
	}
})
	
Vue.component('alarm-controls',{
	props: ['shadow','presence','ready'],
	template: `
		<div v-if = "ready" class = "row center-align">
			<div class = "col s12 center-align">
				<button v-on:click = "action().handler()" type="button" class="btn"><i :class = "'fas fa-'+action().icon"></i></button>
				<button v-on:click = "bedtime()" type="button" class="btn"><i class = "fas fa-bed"></i></button>
				<button v-on:click = "visitors()" type="button" class="btn"><i class = "fas fa-user-plus"></i></button>
			</div>
			<div class = "col s12 center-align">
				<br><br>
				<table class = "centered striped">
					<tbody>
						<tr>
							<td v-if = "presence.length == 0">
								<i class = "fas fa-user-slash"></i>
								<br>
								<small>Nobody</small>
							</td>
							<td v-for = "person in presence">
								<i class = "fas fa-user"></i>
								<br>
								<small>{{person}}</small>
							</td>
						</tr>
					<tbody>
				</table>
			</div>
		</div>
	`,
	computed : {
		icon(){
			let iconMap = {
				"blind" : "lock-open",
				"bedtime" : "bed",
				"standard" : "lock",
				"default" : ""
			}
			return iconMap[this.shadow.strategy || "default"]
		}
	},
	methods: {
		arm(){
			signHttpRequest("POST", "/alarm/monitor/on")
				.then(axios)
				.then(this.$root.pollData())
		},
		disarm(){
			signHttpRequest("POST", "/alarm/monitor/off")
				.then(axios)
				.then(this.$root.pollData())
		},
		bedtime(){
			signHttpRequest("POST", "/alarm/monitor/bedtime")
				.then(axios)
				.then(this.$root.pollData())
		},
		visitors(){
			signHttpRequest("PATCH", "/alarm/monitor/visitors" , {days: 1, device: "Guest"})
				.then(axios)
				.then(this.$root.pollPresence())
		},
		action() {
			let actionMap = {
				"quiet" : {icon:"lock","handler":this.arm},
				"arming" : {icon:"lock-open","handler":this.disarm},
				"guarding" : {icon:"lock-open","handler":this.disarm},
				"warning" : {icon:"lock-open","handler":this.disarm},
				"sounding" : {icon:"lock-open","handler":this.disarm},
				"default" : {icon:"lock-open","handler":this.disarm},
			}
			return actionMap[this.shadow.state || "default"]
		}
	},
})

Vue.component('time-d-three', {
	props: ['strategies', 'movements'],
	data: function() {
		let margin = {
			top: 50,
			right: 25,
			bottom: 50,
			left: 25
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
	template: `
		<div class = 'row'>
			<div id = 'd3'>
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
			.attr('font-weight', '900')
			.attr('font-size', `8px`)
			.attr("class", "y axis fa")
		
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
			
			let iconMap = {
				standard : '\uf06e',
				bedtime : '\uf236',
				blind : '\uf070',
				Lounge : '\uf4b8',
				Entry : '\uf52b'
			}
			let iconSize = 8;
			
			let xScale = d3.scaleTime()
				.domain(d3.extent(this.strategies, function(d) {
					return d.timestamp
				}))
				.range([0, this.width])

			let xAxis = d3.axisBottom(xScale)
				.ticks(5); // specify the number of ticks

			let yScale = d3.scalePoint()
				.domain(this.movements.map(movement => iconMap[movement.detail]))
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
			
						
			strategies.exit().remove()
			
			strategies
				.attr('class', function(d){return `strategy ${d.detail}`})
				.attr('width', function(d) {
					return d.width
				})
				.attr('height', this.height)
				.attr('y', 0)
				.transition(t)
				.attr('x', function(d) {
					return d.start
				})


			
			strategies.enter()
				.append('rect')
				.attr('class', function(d){return `strategy ${d.detail}`})
				.attr('width', function(d) {
					return d.width
				})
				.attr('height', this.height)
				.attr('y', 0)
				.transition(t)
				.attr('x', function(d) {
					return d.start
				})

			


			let icons = this.svg.selectAll('.icon')
				.data(strategyBlocks)
			
			icons.exit().remove()
			
			
			icons
				.attr('class', function(d){return `icon ${d.detail} fa`})
				.attr('text-anchor', 'middle')
				.attr('font-weight', '900')
				.attr('font-size', `${iconSize}px`)
				.text(function(d) { return d.width > iconSize ? iconMap[d.detail] : ""})
				.attr('y', (d)=>{
					if(d.width > iconSize) return this.height/2 + iconSize/2
					else return iconSize/2
				})
				.transition(t)
				.attr('x', function(d) {
					return d.start + d.width/2
				})

			
			icons.enter()
				.append('text')
				.attr('class', function(d){return `icon ${d.detail} fa`})
				.attr('text-anchor', 'middle')
				.attr('font-weight', '900')
				.attr('font-size', `${iconSize}px`)
				.text(function(d) { return d.width > iconSize ? iconMap[d.detail] : ""})
				.attr('y', (d)=>{
					if(d.width > iconSize) return this.height/2 + iconSize/2
					else return iconSize/2
				})
				.transition(t)
				.attr('x', function(d) {
					return d.start + d.width/2
				})
		
			
			let movementSize = 12;

			let movements =  this.svg.selectAll('.movement')
				.data(this.movements)
						
			movements.exit().remove()
			
			movements
				.attr('class', function(d){return `movement ${d.detail}`})
				.attr('cy', function(d) {
					return yScale(iconMap[d.detail]);
				})
				.transition(t)
				.attr('cx', function(d) {
					return xScale(d.timestamp);
				})
				.attr('r', `${movementSize/2}`)

				
			movements.enter()
				.append('circle')
				.attr('class', function(d){return `movement ${d.detail}`})
				.attr('cy', function(d) {
					return yScale(iconMap[d.detail]);
				})
				.transition(t)
				.attr('cx', function(d) {
					return xScale(d.timestamp);
				})
				.attr('r', `${movementSize/2}`)
			



			return true;
		}
	}
})



var app = new Vue({
	el: '#app',
	data: {
		raw :  {
			data: false,
			presence : false
		},
		pollers : {
			data: false,
			presence : false
		}
	},
	methods : {
		pollData(){
			if(this.pollers.data) clearInterval(this.pollers.data)
			this.pollers.data = this.poll(this.fetchData,this.pollers.data)
		},
		pollPresence(){
			if(this.pollers.presence) clearInterval(this.pollers.presence)
			this.pollers.presence = this.poll(this.fetchPresence,this.pollers.presence)
		},
		poll(fn,poller){
			let [count, maxCount, interval] = [0,4,500];
			return setInterval(()=>{
				if(count<maxCount){
					count++
					fn();
				} else {
					clearInterval(poller)
				}
			},interval)
		},
		fetchData(){
			signHttpRequest("GET", "/alarm/monitor")
				.then(axios)
				.then(({
					data
				}) => {
					this.raw.data = data;
				})
		},
		fetchPresence(){
			signHttpRequest("GET", "/alarm/monitor/visitors")
				.then(axios)
				.then(({
					data
				}) => {
					this.raw.presence = data;
				})
		}
	},
	computed: {
		ready(){
			if(
				!this.raw.presence || 
				!this.raw.data ||
				!this.raw.data.shadow ||
				!this.raw.data.metrics
			) return false
			return true
		},
		presence(){
			if(!this.ready) return []
			return this.raw.presence.people
		},
		shadow(){
			if(!this.ready) return {}
			return this.raw.data.shadow.reported;
		},
		strategies(){
			if(!this.ready) return []
			let strategies = this.raw.data.metrics.strategyState.map(strategy => {
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
			if(!this.ready || this.strategies.length == 0) return []
			let earliestStrategy = this.strategies.reduce((a,b)=>({timestamp:Math.min(a.timestamp,b.timestamp)}));
			let earliestDate = new Date(earliestStrategy.timestamp)

			return this.raw.data.metrics.movement
			.map(movement => {
				movement.timestamp = new Date(movement.timestamp);
				return movement;
			})
			.filter(movement=>movement.timestamp>earliestDate)	
		}
	},
	mounted: function() {
		this.fetchData();
		this.fetchPresence();
	}
})
