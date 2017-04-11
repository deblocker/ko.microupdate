ko.microupdate = ko.microupdate || {};
ko.microupdate.Task = function(vm, data, rules) {
	this.depth = -1;
	this.level = [];
	this.path = "";
	this.rules = rules || {};
	this.fromJS(vm, data);
};
ko.microupdate.isObject = function(o) {
	return typeof o === "object" && !(o instanceof Date);
};
ko.microupdate.isArray = function(o) {
	return Object.prototype.toString.call(o) === '[object Array]';
};
ko.microupdate.isWriteableObservable = function(o) {
	return typeof o === "function" && ko.isWriteableObservable(o);
};
ko.microupdate.isObservableArray = function(o) {
	return ko.isObservable(o) && !(o.destroyAll === undefined);
};
ko.microupdate.isObservableArrayItem = function(v,p) {
	return ko.microupdate.isObservableArray(v);
};
ko.microupdate.isArrayItem = function(v,p) {
	return ko.microupdate.isArray(v);
};
ko.microupdate.isNestedObject = function(o) {
	return !ko.microupdate.isArray(o) && ko.microupdate.isObject(o);
};
ko.microupdate.objectIndex = function(a, p, k) {
	var i = null, c = 0;
	if(typeof a == "undefined") 
		return i;
	for(var q = 0, l = a.length; q < l; q++) {
		var r = (typeof a[q][p] === "function") ? a[q][p].peek() : a[q][p];
		if (r == k) {
			c++;
			i = q;
		}
	}
	if(c > 1)
		throw new Error("Duplicated values for: "+k+" in: " +p);
	return i;
};
ko.microupdate.Task.prototype.fromJS = function(vm, data) {
	var self = this, r;
	function rule(l) {
		if(l) self.level.push(l);
		self.path = self.level.join(".");
		return (self.rules[self.path] || {});
	}
	this.depth++;
	for(var d in data) {
		if(vm[d] !== null) {
			if(ko.microupdate.isObservableArray(vm[d])) {
				r = rule(d+"[]");
				if (r.replaceAll) vm[d]([]);
				this.fromJS(vm[d], data[d]);
				this.level.pop();
			} else if(ko.microupdate.isArrayItem(vm,d)) {
				r = rule();
				var i=d;
				if (r.updateByKey) {
					i=ko.microupdate.objectIndex(vm, r.updateByKey, data[d][r.updateByKey]);
				} else if(r.replaceAll) {
					vm.push(new r.Constructor(data[d]));
				}
				this.fromJS(vm[i], data[d]);
			} else if(ko.microupdate.isObservableArrayItem(vm,d)) {
				r = rule();
				var i=d;
				if (r.updateByKey) {
					i=ko.microupdate.objectIndex(vm(), r.updateByKey, data[d][r.updateByKey]);
				} else if(r.replaceAll) {
					if(r.Constructor)
						vm.push(new r.Constructor(data[d]))
					else
						vm.push(data[d]);
				}
				this.fromJS(vm()[i], data[d]);
			} else if(ko.microupdate.isNestedObject(vm[d])) {
				r = rule(d);
				this.fromJS(vm[d], data[d]);
				this.level.pop();
			} else if(ko.microupdate.isWriteableObservable(vm[d])) {
				r = rule(d);
				vm[d](data[d]);
				this.level.pop();
			} else if(ko.microupdate.isArray(vm[d])) {
				r = rule(d+"[]");
				if (r.replaceAll) vm[d]=[];
				this.fromJS(vm[d], data[d]);
				this.level.pop();
			} else if(typeof(vm[d]) != "undefined") {
				r = rule(d);
				vm[d] = data[d];
				this.level.pop();
			}
		}
	}
	this.depth--;
};
ko.microupdate.Task.prototype.depth = -1;
ko.microupdate.Task.prototype.level = [];
ko.microupdate.Task.prototype.path = "";
ko.microupdate.Task.prototype.rules = {};
