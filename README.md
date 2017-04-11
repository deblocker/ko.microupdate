# ko.microupdate
Update viewmodels which follows the Constructor pattern.

Example of rule for observable arrays:

var rules = {
  "Items[]": {updateByKey: "Type"},
  "Order.Items[]": {replaceAll: true}
};

Execute data import from JSON:

var importTask = new ko.microupdate.Task(viewModel, ko.utils.parseJson(data), rules);
