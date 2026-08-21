const mongoose = require("mongoose");

const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");

// =====================================
// Get All Achievements
// =====================================
const getAllAchievements = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const achievements = await Achievement.aggregate([
      {
        $lookup: {
          from: "userachievements",
          let: {
            achievementId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$achievement",
                        "$$achievementId",
                      ],
                    },
                    {
                      $eq: [
                        "$user",
                        userId,
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "userAchievement",
        },
      },

      {
        $unwind: {
          path: "$userAchievement",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          icon: 1,
          type: 1,
          target: 1,

          unlocked: {
            $ifNull: [
              "$userAchievement.unlocked",
              false,
            ],
          },

          progress: {
            $ifNull: [
              "$userAchievement.progress",
              0,
            ],
          },

          unlockedAt: {
            $ifNull: [
              "$userAchievement.unlockedAt",
              null,
            ],
          },
        },
      },

      {
        $sort: {
          unlocked: -1,
          name: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements,
    });

  } catch (error) {
    console.error(
      "Get All Achievements Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Earned Achievements
// =====================================
const getEarnedAchievements = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const achievements = await UserAchievement.find({
      user: userId,
      unlocked: true,
    })
      .populate(
        "achievement",
        "name description icon type target"
      )
      .sort({
        unlockedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements,
    });

  } catch (error) {
    console.error(
      "Get Earned Achievements Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Locked Achievements
// =====================================
const getLockedAchievements = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const achievements = await Achievement.aggregate([
      {
        $lookup: {
          from: "userachievements",

          let: {
            achievementId: "$_id",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$achievement",
                        "$$achievementId",
                      ],
                    },
                    {
                      $eq: [
                        "$user",
                        userId,
                      ],
                    },
                  ],
                },
              },
            },
          ],

          as: "userAchievement",
        },
      },

      {
        $unwind: {
          path: "$userAchievement",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $match: {
          $or: [
            {
              "userAchievement.unlocked": {
                $exists: false,
              },
            },
            {
              "userAchievement.unlocked": false,
            },
          ],
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          icon: 1,
          type: 1,
          target: 1,

          progress: {
            $ifNull: [
              "$userAchievement.progress",
              0,
            ],
          },
        },
      },

      {
        $sort: {
          name: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements,
    });

  } catch (error) {
    console.error(
      "Get Locked Achievements Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Get Achievement Progress
// =====================================
const getAchievementProgress = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const achievements = await Achievement.aggregate([
      {
        $lookup: {
          from: "userachievements",

          let: {
            achievementId: "$_id",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$achievement",
                        "$$achievementId",
                      ],
                    },
                    {
                      $eq: [
                        "$user",
                        userId,
                      ],
                    },
                  ],
                },
              },
            },
          ],

          as: "userAchievement",
        },
      },

      {
        $unwind: {
          path: "$userAchievement",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          icon: 1,
          type: 1,
          target: 1,

          current: {
            $ifNull: [
              "$userAchievement.progress",
              0,
            ],
          },

          completed: {
            $ifNull: [
              "$userAchievement.unlocked",
              false,
            ],
          },

          unlockedAt: {
            $ifNull: [
              "$userAchievement.unlockedAt",
              null,
            ],
          },
        },
      },

      {
        $addFields: {
          percentage: {
            $cond: [
              {
                $gt: ["$target", 0],
              },
              {
                $min: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$current",
                          "$target",
                        ],
                      },
                      100,
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },

      {
        $sort: {
          completed: -1,
          percentage: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements,
    });

  } catch (error) {
    console.error(
      "Get Achievement Progress Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllAchievements,
  getEarnedAchievements,
  getLockedAchievements,
  getAchievementProgress,
};
