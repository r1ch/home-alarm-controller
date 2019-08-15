Vue.component('google-login', {
	template: '<div v-if = "!authenticated" class="g-signin2" data-width="200" data-height="50" data-onsuccess="authenticate" data-theme="dark"></div>',
	data: () => ({
		authenticated: false
	}),
	mounted: function() {
		Credentials.then(() => {
			this.authenticated = true
		})
	}
})

Vue.component('time-d-three', {
	data: function() {
		let margin = {
			top: 100,
			right: 100,
			bottom: 100,
			left: 100
		};
		let width = 960 - margin.left - margin.right;
		let height = 400 - margin.top - margin.bottom;
		return {
			margin: margin,
			width: width,
			height: height
		}
	},
	props: ['strategies', 'movements'],
	template: `
        <div id = 'd3'></div>
    	`,
	computed: {
		svg() {
			if (this.strategies.length == 0) return;
			let xScale = d3.scaleTime()
				.domain(d3.extent(this.strategies, function(d) {
					return d.timestamp
				}))
				.range([0, this.width])

			let xAxis = d3.axisBottom(xScale)
				.ticks(10); // specify the number of ticks

			let yScale = d3.scalePoint()
				.domain(this.movements.map(movement => movement.detail))
				.range([0, this.height])
				.padding(.1)

			let yAxis = d3.axisLeft(yScale)

			let movementColor = d3.scaleOrdinal()
				.domain(this.movements.map(movement => movement.detail))
				.range(d3.schemeSet2);

			let strategyColor = d3.scaleOrdinal()
				.domain(this.strategies.map(strategy => strategy.detail))
				.range(d3.schemeSet);


			let svg = d3.select("#d3").append("svg")
				.attr("width", this.width + this.margin.left + this.margin.right)
				.attr("height", this.height + this.margin.top + this.margin.bottom)
				.append("g")
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + this.height + ")")
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

			let strategies = svg.selectAll('.strategy')
				.data(strategyBlocks)
				.enter().append('rect')
				.attr('class', 'strategy')
				.attr('x', function(d) {
					return d.end
				})
				.attr('y', 0)
				.attr('width', function(d) {
					return d.width
				})
				.attr('height', this.height)
				.attr('fill', function(d) {
					return strategyColor(d.detail)
				})

			let movements = svg.selectAll('.movement')
				.data(this.movements)
				.enter().append('circle')
				.attr('class', 'movement')
				.attr('cx', function(d) {
					return xScale(d.timestamp);
				})
				.attr('cy', function(d) {
					return yScale(d.detail);
				})
				.attr('r', function(d) {
					return 2;
				})
				.style('fill', function(d) {
					return movementColor(d.detail);
				});

			return svg
		}
	}
})



var app = new Vue({
	el: '#app',
	data: {
		rawShadow: {},
		rawStrategies: [],
		rawMovements: [],
	},
	computed: {
		shadow() {
			return this.rawShadow
		},
		strategies() {
			if (this.rawStrategies.length === 0) return []
			let output = this.rawStrategies.map(strategy => {
				strategy.timestamp = new Date(strategy.timestamp)
				return strategy
			})
			output.unshift({
				timestamp: new Date,
				detail: "unknown"
			})
			return output
		},
		movements() {
			if (this.rawMovements.length === 0) return []
			let output = this.rawMovements.map(movement => {
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
	mounted: function() {
		signHttpRequest("GET", "/alarm/monitor")
			.then(axios)
			.then(({
				data
			}) => {
				this.rawShadow = data.shadow
				this.rawMovements = data.metrics.movement
				this.rawStrategies = data.metrics.strategyState
			})
	}
})
