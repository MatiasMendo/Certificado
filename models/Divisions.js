const mongoose = require('mongoose');
var Schema     = mongoose.Schema;

var divisionSchema = new Schema({
	documentName: {
		type    : Schema.Types.String,
		required: true
	},
	divisions   : [
		new Schema({
			id  : {
				type    : Schema.Types.String,
				required: true
			},
			name: {
				type    : Schema.Types.String,
				required: false
			}
		})
	]

});

const divisionMongoSchemaObject = mongoose.model("divisions", divisionSchema);
module.exports                  = divisionMongoSchemaObject;
