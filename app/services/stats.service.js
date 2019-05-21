const { secret } = require('config.json');
const Event = require("../models/event.model");
const mongoose = require("mongoose");

module.exports = {
    getStats,
    getStatsIn,
    getManagerStats
};

async function getStats(userId) {
    let events = await Event
        .find({ "subscribedUsers": userId })
        .lean();

    let aggregatorOpts = [
        { $project: { subscribedUsers: 1, type: 1 } },
        { $unwind: "$subscribedUsers" },
        { $match: { subscribedUsers: mongoose.Types.ObjectId(userId) } },
        { $group: {
                _id: "$type",
                count: { $sum: 1 }
            }
        }
    ];

    let stats = await Event
        .aggregate(aggregatorOpts)
        .exec()

    return {
        eventsCount: events.length,
        stats: stats.map(stat => {
            return {
                type: stat._id,
                percentage: stat.count / events.length * 100
            }
        })
    };
}

async function getStatsIn(userId, startDate, endDate) {
    let events = await Event
        .find({ "subscribedUsers": userId })
        .find({ datetime: {
            $gt: new Date(startDate),
            $lt: new Date(endDate)
        }}).lean();

    let aggregatorOpts = [
        { $project: { subscribedUsers: 1, type: 1, datetime: 1 } },
        { $unwind: "$subscribedUsers" },
        {
            $match: { 
                $and: [
                    { subscribedUsers: mongoose.Types.ObjectId(userId) },
                    { datetime: { $gt: new Date(startDate), $lt: new Date(endDate) } }
                ]
            }
        },
        { $group: {
                _id: "$type",
                count: { $sum: 1 }
            }
        }
    ];

    let stats = await Event
        .aggregate(aggregatorOpts)
        .exec()

    return {
        eventsCount: events.length,
        stats: stats.map(stat => {
            return {
                type: stat._id,
                percentage: stat.count / events.length * 100
            }
        })
    };
}

async function getManagerStats(userId) {
    let aggregatorOpts = [
        { $project: { type: 1, hostUser: 1 } },
        {
            $match: { 
                hostUser: mongoose.Types.ObjectId(userId)
            }
        },
        { 
            $group: {
                _id: "$type",
                count: { $sum: 1 }
            }
        }
    ];

    let stats = await Event
        .aggregate(aggregatorOpts)
        .exec();

    return stats;
}
