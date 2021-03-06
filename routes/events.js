const express = require("express");
const router = express.Router();

const setCookie = require("../middleware/setCookie");
const checkPermission = require("../middleware/checkPermission");

const Event = require("../models/event");
const File = require("../models/file");

const CODE_LENGTH = 6;
const CODE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const SECRET_LENGTH = 24;
const SECRET_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateRandomString = (length, chars) => {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

// create a new event
router.post("/events", setCookie, async (req, res) => {
	try {
		const { userId } = req.session;

		const { title, description, open } = req.body;

		const event = new Event({
			...(typeof title !== "undefined" && { title: String(title).trim() }),
			...(typeof description !== "undefined" && { description: String(description) }),
			...(open === Boolean(open) && { open: open }),
			code: generateRandomString(CODE_LENGTH, CODE_CHARS),
			secret: generateRandomString(SECRET_LENGTH, SECRET_CHARS),
			organisators: [userId],
		});
		await event.save();

		return res.status(200).json({
			title: event.title,
			code: event.code,
			secret: event.secret,
			open: event.open,
			createdAt: event.createdAt,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send("Something went wrong...");
	}
});

// get event information
router.get("/events/:code", setCookie, checkPermission, async (req, res) => {
	try {
		const { event, isOrganisator } = res.locals;

		const file = event.file ? await File.findOne({ _id: event.file._id }) : null;

		return res.status(200).json({
			title: event.title,
			description: event.description,
			file: file && {
				_id: file._id,
				name: file.name,
				size: file.size,
				mimetype: file.mimetype,
				createdAt: file.createdAt,
			},
			code: event.code,
			open: event.open,
			createdAt: event.createdAt,
			...(isOrganisator && { secret: event.secret }),
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send("Something went wrong...");
	}
});

// edit event information
router.put("/events/:code", setCookie, checkPermission, async (req, res) => {
	try {
		const { event, isOrganisator } = res.locals;

		if (!isOrganisator) {
			return res.status(403).send("You are not an organisator of this event");
		}

		const { title, description, open } = req.body;

		if (typeof title !== "undefined") {
			event.title = String(title).trim();
		}

		if (description !== "undefined") {
			event.description = String(description);
		}

		if (open === true || open === false) {
			event.open = open;
		}

		await event.save();

		return res.status(200).send("OK");
	} catch (err) {
		console.log(err);
		res.status(500).send("Something went wrong...");
	}
});

// join an existing event as a participant
router.post("/events/:code/join", setCookie, async (req, res) => {
	try {
		const { code } = req.params;
		const event = await Event.findOne({
			code: code,
		});

		if (!event) {
			return res.status(404).send("Event not found");
		}

		if (!event.open) {
			return res.status(403).send("Event is currently closed for new participants");
		}

		const { userId } = req.session;
		if (event.participants.includes(userId)) {
			return res.status(409).send("You have already joined this room");
		}

		event.participants.push(userId);
		await event.save();

		io.to(event.code).emit("user-join", event.code);

		// add socket to room
		const allSockets = await io.fetchSockets();
		const sockets = allSockets.filter((socket) => socket.data.userId === userId.toString());
		for (let socket of sockets) {
			socket.join(event.code);
		}

		return res.status(200).send("OK");
	} catch (err) {
		console.log(err);
		return res.status(500).send("Something went wrong...");
	}
});

// join an existing meeting as a organisator
router.post("/events/:secret/edit", setCookie, async (req, res) => {
	try {
		const { secret } = req.params;
		const event = await Event.findOne({
			secret: secret,
		});

		if (!event) {
			return res.status(404).send("Event not found");
		}

		const { userId } = req.session;
		if (event.organisators.includes(userId)) {
			return res.status(409).send("You have already joined this room");
		}

		event.organisators.push(userId);
		await event.save();

		io.to(event.code).emit("user-join", event.code);

		// add socket to room
		const sockets = await io.fetchSockets();
		const socket = sockets.filter((s) => s.userId === userId)[0];
		if (socket) {
			socket.join(event.code);
		}

		return res.status(200).send({
			title: event.title,
			code: event.code,
			secret: event.secret,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send("Something went wrong");
	}
});

// delete event
router.delete("/events/:code", setCookie, checkPermission, async (req, res) => {
	try {
		const { event, isOrganisator } = res.locals;

		if (!isOrganisator) {
			return res.status(403).send("You are not an organisator of this event");
		}

		await event.deleteOne();

		io.to(event.code).emit("event-delete", event.code);
		io.socketsLeave(event.code);

		return res.status(200).send("OK");
	} catch (err) {
		console.log(err);
		return res.status(500).send("Something went wrong...");
	}
});

module.exports = router;
