const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Poll = require("./poll");

const EventSchema = Schema({
	title: {
		type: String,
		default: "Untitled event",
	},
	organisators: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	],
	participants: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	code: {
		type: String,
		unique: true,
		required: true,
	},
	open: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

EventSchema.pre("remove", async function (next) {
	await Poll.deleteMany({ event: this._id });
	next();
});

module.exports = mongoose.model("Event", EventSchema);
