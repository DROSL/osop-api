const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Answer = require("./answer");

const PollSchema = Schema({
	title: {
		type: String,
		default: "Untitled poll",
	},
	event: {
		type: Schema.Types.ObjectId,
		ref: "Event",
		required: true,
	},
	votesPerParticipant: {
		type: Number,
		default: 1,
	},
	allowMultipleVotesPerAnswer: {
		type: Boolean,
		default: false,
	},
	allowCustomAnswers: {
		type: Boolean,
		default: false,
	},
	started: {
		type: Boolean,
		default: false,
	},
	stopped: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

PollSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
	await Answer.deleteMany({ poll: this._id });
	next();
});

module.exports = mongoose.model("Poll", PollSchema);
