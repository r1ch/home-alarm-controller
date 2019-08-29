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

Vue.component('version-stamp',{
	props: ['cache'],
	data: ()=>({
		version:version,
		revision:revision.substring(0,5)
	}),
	template: `
		<div class = 'row center-align'>
			<small></small>
			<div class = "chip">
				{{revision}}:{{version}}:{{cache}}
			</div>
		</div>
	`,
})

Vue.component('state-view',{
	props: ['shadow','ready'],
	template: `
		<div class = "row center-align" v-if = "ready">
			<br><br>
			<span class = "fa-stack fa-3x">
				<i :class="'fas fa-'+big+' fa-stack-2x'"></i>
				<i :class="'fas fa-'+small+' eye-pull fa-stack-1x'"></i>
			</span>
			<br>
			<small>{{shadow.state}}</small>
		</div>
	`,
	computed : {
		small(){
			if (!this.shadow.strategy || !this.shadow.state){
				return "eye"
			} else if (["bedtime","standard"].includes(this.shadow.strategy)){
				return "eye"
			} else {
				return ""
			}
		},
		big(){
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
				<button v-on:click = "addVisitor()" type="button" class="btn"><i class = "fas fa-user-plus"></i></button>
				<button v-on:click = "removeVisitor()" v-if = "here.haveVisitors" type="button" class="btn"><i class = "fas fa-user-times"></i></button>
			</div>
			<div class = "col s12 center-align">
				<br><br>
				<table class = "centered striped">
					<tbody>
						<tr>
							<td v-if = "here.all == 0">
								<i class = "fas fa-user-slash fa-2x"></i>
								<br>
								<small>Nobody</small>
							</td>
							<td v-for = "person in here.people">
								<span class = "fas fa-stack">
									<i :class = "'fas fa-stack-2x fa-'+person.icon"></i>
									<i class = "fas fa-heart fa-stack-1x heart-pull" v-if = "here.nonVisitors > 1 && !person.visitor"></i>
								</span>
								<br>
								<small v-if = "person.visitor">{{person.name}} (for {{person.days}} {{person.dayText}})</small>
								<small v-if = "!person.visitor">{{person.name}}</small>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	`,
	computed : {
		here(){
			let haveVisitors = false;
			let nonVisitors = 0;
			let visitorDays = 0;
			let all = 0;
			let people = this.presence.map((P)=>{
				all++;
				let iconList = ['moon','otter','user','lemon','kiwi-bird']
				let icon = iconList[parseInt(P.name,36) % iconList.length]
				let person =  {
					name: P.name,
				}
				if(P.name == "Guest"){
					haveVisitors = true;
					visitorDays = person.days = Math.ceil((P.left - Date.now())/(24*60*60*1000))
					person.dayText = "day" + (person.days == 1 ? "" : "s")
					person.icon = "user"
					person.visitor = true
				} else {
					person.visitor = false
					person.icon = icon;
					nonVisitors++;
				}
				return person
			})
			return {
				all: all,
				haveVisitors : haveVisitors,
				nonVisitors : nonVisitors,
				visitorDays : visitorDays,
				people : people
			}
		},
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
		randomIcon(){
			let iconList = ['user','otter','moon','lemon','kiwi-bird']
			return iconList[Math.floor(Math.random()*iconList.length)]
		},
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
		addVisitor(){
			this.visitors(this.here.visitorDays+1)
		},
		removeVisitor(){
			this.visitors(-1)
		},
		visitors(days){
			signHttpRequest("PATCH", "/alarm/monitor/visitors" , {days: days, device: "Guest"})
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
	props: ['strategies', 'movements','ready'],
	data: function() {
		let iconSize = 12
		let margin = {
			top: 25,
			right: 25,
			bottom: 25,
			left: 25
		};
		let fullWidth = 900
		let fullHeight = 150
		let width = fullWidth - margin.left - margin.right;
		let height = fullHeight - margin.top - margin.bottom;
		return {
			date : new Date(),
			iconSize : iconSize,
			margin: margin,
			width: width,
			height: height,
			fullWidth : fullWidth,
			fullHeight : fullHeight,
			svg : false
		}
	},
	computed:{
		reassurance(){
			let output = {
				lastTime : Math.floor((this.date-this.movements[0].timestamp)/(60*1000)),
				detail : this.movements[0].detail
			}
			if(output.lastTime > 60){
				output.text = "ages ago"
			} else if (output.lastTime == 0){
				output.text = "now!"
			} else {
				output.text = output.lastTime + " minute" + (output.lastTime == 1 ? " ago" : "s ago")
			}
			return output
		}
	},
	template: `
		<div class = 'row center-align'>
			<div class = "col s12" v-if = "ready">
				<h6 v-if = "movements.length>2">Last movement : {{reassurance.detail}}, {{reassurance.text}}</h6>
				<h6 v-if = "movements.length<1">No movement in a long time</h6>
			</div>
			<div id = 'd3' class = "col s12">
			</div>
		</div>
    	`,
	mounted : function(){
		let self = this;
		
		setInterval(()=>{
			self.date = new Date();
		},60*1000)
		
		this.svg = d3.select("#d3")
			.append("svg")
			.attr('width',this.fullWidth)
			.attr('height',this.fullHeight)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
		
		this.svg.append("g")
			.attr('font-weight', '900')
			.attr('font-size', `${this.iconSize}px`)
			.attr("class", "y lefthand axis fa")
		
		this.svg.append("g")
			.attr('font-weight', '900')
			.attr('font-size', `${this.iconSize}px`)
			.attr("class", "y righthand axis fa")
			.attr("transform","translate(" + this.width +  ",0)")
		
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
			if (this.strategies.length == 0) return;
			
			let t = d3.transition().duration(750);
			
			let iconMap = {
				standard : '\uf06e',
				bedtime : '\uf236',
				blind : '\uf070',
				Lounge : '\uf4b8',
				Entry : '\uf52b'
			}
			
			let xScale = d3.scaleTime()
				.domain(d3.extent(this.strategies, function(d) {
					return d.timestamp
				}))
				.range([0, this.width])

			let xAxis = d3.axisBottom(xScale)
				.ticks(d3.timeHour.every(2))
				.tickFormat(d3.timeFormat("%H"))

			let yScale = d3.scalePoint()
				.domain(this.movements.map(movement => iconMap[movement.detail]))
				.range([0, this.height])
				.padding(.5)

			let yAxisLeft = d3.axisLeft(yScale)
			let yAxisRight = d3.axisRight(yScale)


			this.svg.select(".y.lefthand")
				.transition(t)
				.call(yAxisLeft);
			
			this.svg.select(".y.righthand")
				.transition(t)
				.call(yAxisRight);

			this.svg.select(".x")
				.transition(t)
				.call(xAxis);

			let strategyBlocks = [];
			
			for (i = 0; i < this.strategies.length - 1; i++) {
				let output = {
					end: xScale(this.strategies[i].timestamp),
					start: xScale(this.strategies[i + 1].timestamp),
					fromDetail : this.strategies[i].detail,
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
			
			let currentStrategy = this.svg.selectAll('.cStrategy')
				.data([strategyBlocks[0]])
				.enter()
				.append('text')
				.attr('class', 'cStrategy fa  fa-in')
				.attr('text-anchor', 'middle')
				.attr('fill', 'rgba(30,126,200,0.5)')
				.attr('font-weight', '900')
				.attr('font-size', `${this.iconSize}px`)
				.text((d)=>iconMap[d.fromDetail])
				.attr('y',this.height/2 + this.iconSize/2)
				.transition(t)
				.attr('x',this.width - this.iconSize)
			
			let currentTime = this.svg.selectAll('.cTime')
				.data([this.strategies[0]])
				.enter()
				.append('text')
				.attr('class', 'cTime')
				.attr('text-anchor', 'middle')
				.attr('fill', 'black')
				.attr('font-size', `${this.iconSize/2}px`)
				.text((d)=>d3.timeFormat("%H:%M")(d.timestamp))
				.attr('y',-this.iconSize/4)
				.transition(t)
				.attr('x',this.width)
			
			let icons = this.svg.selectAll('.icon')
				.data(strategyBlocks)
			
			icons.exit().remove()
			
			
			icons
				.attr('class', function(d){return `icon ${d.detail} fa`})
				.attr('text-anchor', 'middle')
				.attr('font-weight', '900')
				.attr('font-size', `${this.iconSize}px`)
				.text((d)=>{ return d.width > this.iconSize ? iconMap[d.detail] : ""})
				.attr('y', (d)=>{
					if(d.width > this.iconSize) return this.height/2 + this.iconSize/2
					else return this.iconSize/2
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
				.attr('font-size', `${this.iconSize}px`)
				.text((d)=> { return d.width > this.iconSize ? iconMap[d.detail] : ""})
				.attr('y', (d)=>{
					if(d.width > this.iconSize) return this.height/2 + this.iconSize/2
					else return this.iconSize/2
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
			

			d3.selectAll("#d3").node()
				.scrollLeft = this.fullWidth

			return true;
		}
	}
})



var app = new Vue({
	el: '#app',
	data: {
		date : new Date(),
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
				timestamp: this.date,
				detail: this.shadow.strategy
			})

			if(strategies.length == 1){
				strategies.push({
					timestamp: new Date(this.date.now() - 24*60*60*1000),
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
		},
		cache(){
			return this.ready && this.raw.data && this.raw.data.metrics ? this.raw.data.metrics.used : 0
		}
	},
	mounted: function() {
		let self = this;
		setInterval(()=>{
			self.date = new Date();
		},60*1000)
		setInterval(()=>{
			self.fetchData();
			self.fetchPresence();
		},5*60*1000)
		this.fetchData();
		this.fetchPresence();
	}
})
