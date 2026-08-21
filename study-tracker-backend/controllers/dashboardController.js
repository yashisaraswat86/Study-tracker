const mongoose = require("mongoose");

const Subject = require("../models/Subject");
const Task = require("../models/Task");
const StudySession = require("../models/StudySession");
const Goal = require("../models/Goal");
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");

const {
    TIMEZONE
} = require("../utils/dateUtils");

// =====================================
// Dashboard Summary
// =====================================
const getDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Total Subjects
    const totalSubjects = await Subject.countDocuments({
      user: userId,
    });

    // Total Tasks
    const totalTasks = await Task.countDocuments({
      user: userId,
    });

    // Completed Tasks
    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    // Pending Tasks
    const pendingTasks = await Task.countDocuments({
      user: userId,
      completed: false,
    });

    // Total Study Time
    const totalStudyTimeResult = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalStudyTime: {
            $sum: "$duration",
          },
        },
      },
    ]);

    const totalStudyTime =
      totalStudyTimeResult.length > 0
        ? totalStudyTimeResult[0].totalStudyTime
        : 0;

    // =====================================
// Today's Study Time - Asia/Kolkata
// =====================================

const now = new Date();

const indiaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(now);

// Start of today in India
const todayStart = new Date(
  `${indiaDate}T00:00:00+05:30`
);

// Start of tomorrow in India
const tomorrowStart = new Date(todayStart);
tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

const todayStudyTimeResult = await StudySession.aggregate([
  {
    $match: {
      user: userId,
      status: "completed",
      endTime: {
        $gte: todayStart,
        $lt: tomorrowStart,
      },
    },
  },
  {
    $group: {
      _id: null,
      todayStudyTime: {
        $sum: "$duration",
      },
    },
  },
]);

const todayStudyTime =
  todayStudyTimeResult.length > 0
    ? todayStudyTimeResult[0].todayStudyTime
    : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalSubjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        totalStudyTime,
        todayStudyTime,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Weekly Study Analytics
// =====================================
const getWeeklyAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();

const indiaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(now);

const sevenDaysAgo = new Date(
  `${indiaDate}T00:00:00+05:30`
);

sevenDaysAgo.setUTCDate(
  sevenDaysAgo.getUTCDate() - 6
);

    const weeklyData = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
          endTime: {
            $gte: sevenDaysAgo,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$endTime",
              timezone: TIMEZONE,
            },
          },
          studyTime: {
            $sum: "$duration",
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          studyTime: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (error) {
    console.error("Weekly Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Subject Wise Analytics
// =====================================
const getSubjectAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const subjectAnalytics = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      {
        $unwind: "$subjectInfo",
      },
      {
        $group: {
          _id: "$subjectInfo.name",
          studyTime: {
            $sum: "$duration",
          },
        },
      },
      {
        $project: {
          _id: 0,
          subject: "$_id",
          studyTime: 1,
        },
      },
      {
        $sort: {
          studyTime: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: subjectAnalytics,
    });
  } catch (error) {
    console.error("Subject Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Monthly Study Analytics
// =====================================
const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const monthlyData = await StudySession.aggregate([
  {
    $match: {
      user: userId,
      status: "completed",
    },
  },
  {
    $group: {
      _id: {
        month: {
          $month: {
            date: "$endTime",
            timezone: TIMEZONE,
          },
        },
        year: {
          $year: {
            date: "$endTime",
            timezone: TIMEZONE,
          },
        },
      },
      studyTime: {
        $sum: "$duration",
      },
    },
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1,
    },
  },
]);

    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedData = monthlyData.map((item) => ({
      month: `${monthNames[item._id.month]} ${item._id.year}`,
      studyTime: item.studyTime,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Monthly Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Study Streak
// =====================================
const getStudyStreak = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get unique study days
    const studyDays = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$endTime",
              timezone: TIMEZONE,
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // No study sessions
    if (studyDays.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          totalStudyDays: 0,
        },
      });
    }

    // Calculate longest streak
    let longestStreak = 1;
    let currentRun = 1;

    for (let i = 1; i < studyDays.length; i++) {
      const previous = new Date(studyDays[i - 1]._id);
      const current = new Date(studyDays[i]._id);

      const diff =
        (current - previous) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        currentRun++;
      } else {
        currentRun = 1;
      }

      longestStreak = Math.max(longestStreak, currentRun);
    }

    // Calculate current streak
    let currentStreak = 0;

    const todayString = new Intl.DateTimeFormat(
  "en-CA",
  {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
).format(new Date());

const today = new Date(
  `${todayString}T00:00:00`
);

    const lastStudyDate = new Date(
      studyDays[studyDays.length - 1]._id
    );

    const daysSinceLastStudy =
      (today - lastStudyDate) / (1000 * 60 * 60 * 24);

    if (daysSinceLastStudy <= 1) {
      currentStreak = 1;

      for (let i = studyDays.length - 1; i > 0; i--) {
        const current = new Date(studyDays[i]._id);
        const previous = new Date(studyDays[i - 1]._id);

        const diff =
          (current - previous) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalStudyDays: studyDays.length,
      },
    });
  } catch (error) {
    console.error("Study Streak Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Productivity Score
// =====================================
const getProductivityScore = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Total Tasks
    const totalTasks = await Task.countDocuments({
      user: userId,
    });

    // Completed Tasks
    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    // Total Study Time
    const studyResult = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          studyTime: {
            $sum: "$duration",
          },
        },
      },
    ]);

    const studySeconds =
      studyResult.length > 0
        ? studyResult[0].studyTime
        : 0;

    // Get unique study days
    const studyDays = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$endTime",
              timezone: TIMEZONE
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Calculate current streak
    let currentStreak = 0;

    if (studyDays.length > 0) {
      const todayString = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const today = new Date(`${todayString}T00:00:00Z`);

      const lastStudy = new Date(studyDays[studyDays.length - 1]._id);

      const daysSinceLastStudy =
        (today - lastStudy) / (1000 * 60 * 60 * 24);

      if (daysSinceLastStudy <= 1) {
        currentStreak = 1;

        for (let i = studyDays.length - 1; i > 0; i--) {
          const current = new Date(studyDays[i]._id);
          const previous = new Date(studyDays[i - 1]._id);

          const diff =
            (current - previous) / (1000 * 60 * 60 * 24);

          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Task Completion %
    const taskCompletion =
      totalTasks === 0
        ? 0
        : (completedTasks / totalTasks) * 100;

    // Scores
    const taskScore = taskCompletion * 0.4;

    const studyScore = Math.min(
      (studySeconds / 72000) * 40,
      40
    );

    const streakScore = Math.min(
      currentStreak * 2,
      20
    );

    const score = Math.round(
      taskScore + studyScore + streakScore
    );

    // Productivity Level
    let level = "Needs Improvement";

    if (score >= 90) {
      level = "Excellent";
    } else if (score >= 75) {
      level = "Good";
    } else if (score >= 50) {
      level = "Average";
    }

    return res.status(200).json({
      success: true,
      data: {
        score,
        level,
        metrics: {
          taskCompletion: Math.round(taskCompletion),
          studyHours: Number((studySeconds / 3600).toFixed(2)),
          currentStreak,
        },
      },
    });

  } catch (error) {
    console.error("Productivity Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================
// Recent Study Sessions
// =====================================
const getRecentSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user.id,
      status: "completed",
    })
      .populate("subject", "name color")
      .sort({ endTime: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Recent Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================
// Upcoming Tasks
// =====================================
const getUpcomingTasks = async (req, res) => {
  try {
    const now = new Date();

    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const today = new Date(
      `${indiaDate}T00:00:00+05:30`
    );

    const nextWeek = new Date(today);

    nextWeek.setUTCDate(
      nextWeek.getUTCDate() + 7
    );

    nextWeek.setUTCHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user.id,
      completed: false,
      dueDate: {
        $gte: today,
        $lte: nextWeek,
      },
    })
      .populate("subject", "name color")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Upcoming Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Top Subject Analytics
// =====================================
const getTopSubject = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const result = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      {
        $unwind: "$subjectInfo",
      },
      {
        $group: {
          _id: "$subjectInfo._id",
          subject: {
            $first: "$subjectInfo.name",
          },
          color: {
            $first: "$subjectInfo.color",
          },
          studyTime: {
            $sum: "$duration",
          },
        },
      },
      {
        $sort: {
          studyTime: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          subject: 1,
          color: 1,
          studyTime: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result.length > 0 ? result[0] : null,
    });
  } catch (error) {
    console.error("Top Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Study Heatmap
// =====================================
const getStudyHeatmap = async (req, res) => {
    try {

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const heatmap = await StudySession.aggregate([

            {
                $match:{
                    user:userId,
                    status:"completed"
                }
            },

            {
                $group:{
                    _id:{
                        $dateToString:{
                            format:"%Y-%m-%d",
                            date:"$endTime",
                            timezone: TIMEZONE,
                        }
                    },
                    studyTime:{
                        $sum:"$duration"
                    }
                }
            },

            {
                $project:{
                    _id:0,
                    date:"$_id",
                    studyTime:1
                }
            },

            {
                $sort:{
                    date:1
                }
            }

        ]);

        return res.status(200).json({
            success:true,
            data:heatmap
        });

    } catch (error) {

        console.error("Heatmap Error:", error);

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// =====================================
// Weekly Comparison
// =====================================
const getWeeklyComparison = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();

const indiaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(now);

const today = new Date(
  `${indiaDate}T00:00:00+05:30`
);

// Monday = start of week
const day = today.getUTCDay();
const diff = day === 0 ? 6 : day - 1;

const thisWeekStart = new Date(today);

thisWeekStart.setUTCDate(
  thisWeekStart.getUTCDate() - diff
);

const thisWeekEnd = new Date(today);

thisWeekEnd.setUTCDate(
  thisWeekEnd.getUTCDate() + 1
);

thisWeekEnd.setUTCMilliseconds(-1);

// Previous week
const lastWeekStart = new Date(thisWeekStart);

lastWeekStart.setUTCDate(
  lastWeekStart.getUTCDate() - 7
);

const lastWeekEnd = new Date(thisWeekStart);

lastWeekEnd.setUTCMilliseconds(-1);
   

    // Current week total
    const thisWeekResult = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
          endTime: {
            $gte: thisWeekStart,
            $lte: thisWeekEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          studyTime: {
            $sum: "$duration",
          },
        },
      },
    ]);

    // Last week total
    const lastWeekResult = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
          endTime: {
            $gte: lastWeekStart,
            $lte: lastWeekEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          studyTime: {
            $sum: "$duration",
          },
        },
      },
    ]);

    const thisWeek =
      thisWeekResult.length > 0 ? thisWeekResult[0].studyTime : 0;

    const lastWeek =
      lastWeekResult.length > 0 ? lastWeekResult[0].studyTime : 0;

    const difference = thisWeek - lastWeek;

    let percentageChange = 0;

    if (lastWeek > 0) {
      percentageChange = Number(
        ((difference / lastWeek) * 100).toFixed(2)
      );
    } else if (thisWeek > 0) {
      percentageChange = 100;
    }

    return res.status(200).json({
      success: true,
      data: {
        thisWeek,
        lastWeek,
        difference,
        percentageChange,
      },
    });
  } catch (error) {
    console.error("Weekly Comparison Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Study Distribution
// =====================================
const getStudyDistribution = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const distribution = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      {
        $unwind: "$subjectInfo",
      },
      {
        $group: {
          _id: "$subjectInfo._id",
          subject: {
            $first: "$subjectInfo.name",
          },
          color: {
            $first: "$subjectInfo.color",
          },
          studyTime: {
            $sum: "$duration",
          },
        },
      },
      {
        $sort: {
          studyTime: -1,
        },
      },
    ]);

    const totalStudyTime = distribution.reduce(
      (sum, item) => sum + item.studyTime,
      0
    );

    const result = distribution.map((item) => ({
      subject: item.subject,
      color: item.color,
      studyTime: item.studyTime,
      percentage:
        totalStudyTime === 0
          ? 0
          : Number(
              ((item.studyTime / totalStudyTime) * 100).toFixed(2)
            ),
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Study Distribution Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Average Study Session
// =====================================
const getAverageSession = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const result = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          averageDuration: {
            $avg: "$duration",
          },
          totalSessions: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          averageDuration: {
            $round: ["$averageDuration", 2],
          },
          totalSessions: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data:
        result.length > 0
          ? result[0]
          : {
              averageDuration: 0,
              totalSessions: 0,
            },
    });
  } catch (error) {
    console.error("Average Session Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// Longest Study Session
// =====================================
const getLongestSession = async (req, res) => {
    try {

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const result = await StudySession.aggregate([

            {
                $match:{
                    user:userId,
                    status:"completed"
                }
            },

            {
                $lookup:{
                    from:"subjects",
                    localField:"subject",
                    foreignField:"_id",
                    as:"subjectInfo"
                }
            },

            {
                $unwind:"$subjectInfo"
            },

            {
                $sort:{
                    duration:-1
                }
            },

            {
                $limit:1
            },

            {
                $project:{
                    _id:0,
                    duration:1,
                    startTime:1,
                    endTime:1,
                    subject:"$subjectInfo.name",
                    color:"$subjectInfo.color"
                }
            }

        ]);

        return res.status(200).json({
            success:true,
            data: result.length > 0 ? result[0] : null
        });

    } catch (error) {

        console.error("Longest Session Error:", error);

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// =====================================
// Best Study Day
// =====================================
const getBestStudyDay = async (req, res) => {
    try {

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const result = await StudySession.aggregate([

            {
                $match:{
                    user:userId,
                    status:"completed"
                }
            },

            {
                $group:{
                    _id: {
                        $dayOfWeek: {
                          date: "$endTime",
                          timezone: TIMEZONE,
                        },
                      },
                    studyTime:{
                        $sum:"$duration"
                    },
                    sessions:{
                        $sum:1
                    }
                }
            },

            {
                $project:{
                    _id:0,
                    day:{
                        $switch:{
                            branches:[
                                {case:{$eq:["$_id",1]},then:"Sunday"},
                                {case:{$eq:["$_id",2]},then:"Monday"},
                                {case:{$eq:["$_id",3]},then:"Tuesday"},
                                {case:{$eq:["$_id",4]},then:"Wednesday"},
                                {case:{$eq:["$_id",5]},then:"Thursday"},
                                {case:{$eq:["$_id",6]},then:"Friday"},
                                {case:{$eq:["$_id",7]},then:"Saturday"}
                            ],
                            default:"Unknown"
                        }
                    },
                    studyTime:1,
                    sessions:1
                }
            },

            {
                $sort:{
                    studyTime:-1
                }
            },

            {
                $limit:1
            }

        ]);

        return res.status(200).json({
            success:true,
            data: result.length > 0 ? result[0] : null
        });

    } catch (error) {

        console.error("Best Study Day Error:", error);

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// =====================================
// Preferred Study Time
// =====================================
const getPreferredStudyTime = async (req, res) => {
    try {

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const result = await StudySession.aggregate([

            {
                $match: {
                    user: userId,
                    status: "completed"
                }
            },

            {
                $project: {
                    duration: 1,
                    timeBucket: {
  $switch: {
    branches: [
      {
        case: {
          $and: [
            {
              $gte: [
                {
                  $hour: {
                    date: "$startTime",
                    timezone: TIMEZONE,
                  },
                },
                5,
              ],
            },
            {
              $lt: [
                {
                  $hour: {
                    date: "$startTime",
                    timezone: TIMEZONE,
                  },
                },
                12,
              ],
            },
          ],
        },
        then: "Morning",
      },

      {
        case: {
          $and: [
            {
              $gte: [
                {
                  $hour: {
                    date: "$startTime",
                    timezone: TIMEZONE,
                  },
                },
                12,
              ],
            },
            {
              $lt: [
                {
                  $hour: {
                    date: "$startTime",
                    timezone: TIMEZONE,
                  },
                },
                17,
              ],
            },
          ],
        },
        then: "Afternoon",
      },

      {
        case: {
          $and: [
            {
              $gte: [
                {
                  $hour: {
                    date: "$startTime",
                    timezone: TIMEZONE,
                  },
                },
                17,
              ],
            },
            {
              $lt: [
                {
                  $hour: {
                    date: "$startTime",
                    timezone: TIMEZONE,
                  },
                },
                21,
              ],
            },
          ],
        },
        then: "Evening",
      },
    ],

    default: "Night",
  },
},
                }
            },

            {
                $group: {
                    _id: "$timeBucket",
                    studyTime: {
                        $sum: "$duration"
                    },
                    sessions: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    studyTime: -1
                }
            },

            {
                $limit: 1
            },

            {
                $project: {
                    _id: 0,
                    preferredTime: "$_id",
                    studyTime: 1,
                    sessions: 1
                }
            }

        ]);

        return res.status(200).json({
            success: true,
            data: result.length > 0 ? result[0] : null
        });

    } catch (error) {

        console.error("Preferred Study Time Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =====================================
// Dashboard Overview
// =====================================
const getDashboardOverview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // =====================================
    // Basic Counts
    // =====================================
    const totalSubjects = await Subject.countDocuments({
      user: userId,
    });

    const totalTasks = await Task.countDocuments({
      user: userId,
    });

    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    const pendingTasks = await Task.countDocuments({
      user: userId,
      completed: false,
    });

    // =====================================
    // Total Study Time
    // =====================================
    const totalStudyResult = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalStudyTime: {
            $sum: "$duration",
          },
        },
      },
    ]);

    const totalStudyTime =
      totalStudyResult.length > 0
        ? totalStudyResult[0].totalStudyTime
        : 0;

    // =====================================
    // Today's Study Time (Asia/Kolkata)
    // =====================================
    const now = new Date();

    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    // Start of today in India
    const today = new Date(
      `${indiaDate}T00:00:00+05:30`
    );

    // Start of tomorrow in India
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(
  tomorrow.getUTCDate() + 1
);
    

    const todayStudyResult = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
          endTime: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $group: {
          _id: null,
          studyTime: {
            $sum: "$duration",
          },
        },
      },
    ]);

    const todayStudyTime =
      todayStudyResult.length > 0
        ? todayStudyResult[0].studyTime
        : 0;

    // =====================================
    // Daily Goal
    // =====================================
    const dailyGoal = await Goal.findOne({
      user: userId,
      type: "daily",
    });

    let goalData = null;

    if (dailyGoal) {
      const remaining = Math.max(
        dailyGoal.target - todayStudyTime,
        0
      );

      const progress =
        dailyGoal.target > 0
          ? Math.min(
              Number(
                (
                  (todayStudyTime / dailyGoal.target) *
                  100
                ).toFixed(2)
              ),
              100
            )
          : 0;

      goalData = {
        target: dailyGoal.target,
        studyTime: todayStudyTime,
        remaining,
        progress,
        completed: todayStudyTime >= dailyGoal.target,
      };
    }

    // =====================================
    // Study Streak
    // =====================================
    const studyDays = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          status: "completed",
          endTime: {
            $ne: null,
          },
        },
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$endTime",
              timezone: TIMEZONE,
            },
          },
        },
      },
      {
        $group: {
          _id: "$date",
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    let longestStreak = 0;
    let currentRun = 0;

    for (let i = 0; i < studyDays.length; i++) {
      if (i === 0) {
        currentRun = 1;
      } else {
        const previous = new Date(
          studyDays[i - 1]._id
        );

        const current = new Date(
          studyDays[i]._id
        );

        previous.setUTCHours(0, 0, 0, 0);
        current.setUTCHours(0, 0, 0, 0);

        const difference = Math.floor(
          (current - previous) /
            (1000 * 60 * 60 * 24)
        );

        if (difference === 1) {
          currentRun++;
        } else {
          currentRun = 1;
        }
      }

      longestStreak = Math.max(
        longestStreak,
        currentRun
      );
    }

    // =====================================
    // Current Streak
    // =====================================
    let currentStreak = 0;

    if (studyDays.length > 0) {
      const todayString = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const todayDate = new Date(
  `${todayString}T00:00:00Z`
);

      const latestDate = new Date(
        studyDays[studyDays.length - 1]._id
      );

      latestDate.setUTCHours(0, 0, 0, 0);

      const daysFromLatest = Math.floor(
        (todayDate - latestDate) /
          (1000 * 60 * 60 * 24)
      );

      if (daysFromLatest <= 1) {
        currentStreak = 1;

        for (
          let i = studyDays.length - 1;
          i > 0;
          i--
        ) {
          const current = new Date(
            studyDays[i]._id
          );

          const previous = new Date(
            studyDays[i - 1]._id
          );

          current.setUTCHours(0, 0, 0, 0);
          previous.setUTCHours(0, 0, 0, 0);

          const difference = Math.floor(
            (current - previous) /
              (1000 * 60 * 60 * 24)
          );

          if (difference === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // =====================================
    // Achievements
    // =====================================
    const totalAchievements =
      await Achievement.countDocuments();

    const unlockedAchievements =
      await UserAchievement.countDocuments({
        user: userId,
        unlocked: true,
      });

    // =====================================
    // Response
    // =====================================
    return res.status(200).json({
      success: true,

      data: {
        summary: {
          totalSubjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          totalStudyTime,
          todayStudyTime,
        },

        goal: goalData,

        streak: {
          current: currentStreak,
          longest: longestStreak,
        },

        achievements: {
          unlocked: unlockedAchievements,
          total: totalAchievements,
        },
      },
    });

  } catch (error) {
    console.error(
      "Dashboard Overview Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getWeeklyAnalytics,
  getSubjectAnalytics,
  getMonthlyAnalytics,
  getStudyStreak,
  getProductivityScore,
  getRecentSessions,
  getUpcomingTasks,
  getTopSubject,
  getStudyHeatmap,
  getWeeklyComparison,
  getStudyDistribution,
  getAverageSession,
  getLongestSession,
  getBestStudyDay,
  getPreferredStudyTime,
  getDashboardOverview,
};