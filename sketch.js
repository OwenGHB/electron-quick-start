//make a graph, give it some properties and methods
//it's just a heirarchical tree and this could all be achieved with css selectors but plenty of other relations between nodes could be defined
//I should be using a real constructor and a prototyping system but this works for now
function newgraph(){
	var graph = {};
	//nodes is just an array, so we can do simple loops, count it, find maxima etc
	graph.nodes = [
		//give it the first object rightaway
		{
			generation:0,
			//call it ancestor because parent might muddle things with built in properties? first node has negative ancestry
			//these properties record which of the other nodes where the given relation is present, as an index value
			ancestor:-1,
			children:[],
			//we'll use 0 1 2 as constants for a three colour pallette
			colour:0
		}
	];
	graph.currentnode=0;
	//creating the child adding to the graph and defining its relations would ideally be separated
	graph.spawnchild=function(nodeindex){
		var child = {
			//fill all the properties
			generation:(this.nodes[nodeindex].generation+1),
			ancestor:nodeindex,
			children:[],
			colour:this.nodes[nodeindex].colour
		}	
		this.nodes.push(child);
		this.nodes[nodeindex].children.push(this.nodes.length-1);
	}
	//find child nodes recursively - not used
	graph.getdescendants=function(nodeindex){
		var descendants=[];
		for (child in nodes[nodeindex].children){
			descendants.push(nodes[nodeindex].children[child]);
		}
		var start=0;
		var stop=descendants.length;
		while (start<stop){
			for (var i=start;i<stop;i++){
				for (var j=0;j<this.nodes[descendants[i]].children.length;j++){
					descendants.push(this.nodes[descendants[i]].children[j]);
				}
			}
			start=stop;
			stop=descendants.length;
		}
		return descendants;
	}
	//find all ancestors
	graph.getancestors=function(nodeindex){
		var ancestors=[];
		if (typeof(this.nodes[nodeindex].ancestor)!='undefined'){
			var localancestor = this.nodes[nodeindex].ancestor;
			var localgeneration = this.nodes[nodeindex].generation;
			while (localgeneration>0){
				localgeneration=this.nodes[localancestor].generation;
				ancestors.push(localancestor);
				localancestor=this.nodes[localancestor].ancestor;
			}
		}
		return ancestors;
	}
	//derive another relation from the previous two
	graph.getsiblings=function(nodeindex){
		var siblings=[];
		//a node is its own sibling
		if (this.nodes[nodeindex].generation>0) {
			siblings=this.nodes[this.nodes[nodeindex].ancestor].children;
		} else {
			siblings.push(nodeindex);
		}
		return siblings;
	}
	//figuring out where to draw our nodes
	graph.getscreenpos=function(nodeindex){
		//using a basic polar coordinate system, we can position each node by adding vectors from each ancestor
		// sum 1->infinity (1/2^n)=1 so we just half the distance of each spoke and everything should fit
		var offsets = [];
		var ancestors = this.getancestors(nodeindex);
		var siblings = this.getsiblings(nodeindex);
		var offset = {
			r:(Math.pow(2,-this.nodes[nodeindex].generation)),
			theta:(2*Math.PI)*siblings.indexOf(nodeindex)/(siblings.length)
		}
		offsets.push(offset);
		for (var i=0;i<ancestors.length;i++){
			siblings = this.getsiblings(ancestors[i]);
			offset = {
				r:(Math.pow(2,-this.nodes[ancestors[i]].generation)),
				theta:(2*Math.PI)*siblings.indexOf(ancestors[i])/(siblings.length)
			}
			//adjust theta in previous offset to make things line up better
			offsets[offsets.length-1].theta+=offset.theta;
			offsets.push(offset);
		}
		var totaloffset={
			x:0,y:0
		}
		for (var i=0;i<offsets.length;i++){
			//put them all into cartesian form for summation
			//twist it through a right angle because that looks nicer
			totaloffset.x += offsets[i].r*Math.cos(offsets[i].theta-Math.PI/2);
			totaloffset.y += offsets[i].r*Math.sin(offsets[i].theta-Math.PI/2);
		}
		//finally translate those into screen coordinates, adjusting for initial offset
		totaloffset.x=300*(1+totaloffset.x);
		totaloffset.y=300*(2+totaloffset.y);
		return totaloffset;
	}
	//time to draw our graph
	graph.draw=function(){
		var sketchpad=document.getElementById("sketchpad");
		sketchpad.innerHTML="";
		var pallette = ["red","green","blue"];
		for (var i=0;i<this.nodes.length;i++){
			var screenpos = this.getscreenpos(i);
			var radius = 75/(this.nodes[i].generation+1);
			var fill = "white";
			if (i==this.currentnode) fill = pallette[this.nodes[i].colour];
			sketchpad.innerHTML+='<circle cx="'+screenpos.x+'" cy="'+screenpos.y+'" r="'+radius+'" stroke="'+pallette[this.nodes[i].colour]+'" stroke-width="4" fill="'+fill+'" />';
		}
	}
	return graph;
}
