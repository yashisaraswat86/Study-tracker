import { useEffect, useState } from "react";

import { getSubjects } from "../services/subjectService";

import {
  getActiveSession,
  startStudySession,
  endStudySession,
} from "../services/studySessionService";


const ACTIVE_SESSION_STORAGE_KEY = "study_tracker_active_session";


const StudyTimer = () => {

  // =========================
  // SUBJECTS
  // =========================

  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] =
    useState("");


  // =========================
  // TIMER
  // =========================

  const [seconds, setSeconds] = useState(0);

  const [isRunning, setIsRunning] =
    useState(false);


  // =========================
  // SESSION
  // =========================

  const [activeSession, setActiveSession] =
    useState(null);


  // =========================
  // UI STATES
  // =========================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==================================================
  // SAVE ACTIVE SESSION LOCALLY
  // ==================================================

  const saveLocalSession = (session) => {

    try {

      if (!session) {
        localStorage.removeItem(
          ACTIVE_SESSION_STORAGE_KEY
        );

        return;
      }

      localStorage.setItem(
        ACTIVE_SESSION_STORAGE_KEY,
        JSON.stringify(session)
      );

    } catch (err) {

      console.error(
        "Failed to save active session locally:",
        err
      );

    }

  };


  // ==================================================
  // GET LOCAL ACTIVE SESSION
  // ==================================================

  const getLocalSession = () => {

    try {

      const stored =
        localStorage.getItem(
          ACTIVE_SESSION_STORAGE_KEY
        );

      if (!stored) {
        return null;
      }

      return JSON.parse(stored);

    } catch (err) {

      console.error(
        "Failed to read local active session:",
        err
      );

      return null;

    }

  };


  // ==================================================
  // CLEAR LOCAL ACTIVE SESSION
  // ==================================================

  const clearLocalSession = () => {

    try {

      localStorage.removeItem(
        ACTIVE_SESSION_STORAGE_KEY
      );

    } catch (err) {

      console.error(
        "Failed to clear local session:",
        err
      );

    }

  };


  // ==================================================
  // CALCULATE ELAPSED TIME
  // ==================================================

  const calculateElapsedSeconds = (startTime) => {

    if (!startTime) {
      return 0;
    }

    const start =
      new Date(startTime).getTime();

    const now =
      Date.now();

    if (Number.isNaN(start)) {
      return 0;
    }

    return Math.max(
      Math.floor((now - start) / 1000),
      0
    );

  };


  // ==================================================
  // RESTORE SESSION
  // ==================================================

  const restoreSession = (session) => {

    if (!session || !session.startTime) {
      return false;
    }

    setActiveSession(session);

    setIsRunning(true);

    // Restore exact elapsed time
    setSeconds(
      calculateElapsedSeconds(
        session.startTime
      )
    );


    // Restore selected subject
    if (session.subject) {

      const subjectId =
        session.subject._id ||
        session.subject.id ||
        session.subject;

      if (subjectId) {

        setSelectedSubject(
          String(subjectId)
        );

      }

    } else if (session.subjectId) {

      setSelectedSubject(
        String(session.subjectId)
      );

    }


    // Keep a local backup
    saveLocalSession(session);

    return true;

  };


  // ==================================================
  // LOAD SUBJECTS + ACTIVE SESSION
  // ==================================================

  useEffect(() => {

    const loadData = async () => {

      setLoading(true);
      setError("");


      // ----------------------------------------------
      // LOAD SUBJECTS
      // ----------------------------------------------

      try {

        const response =
          await getSubjects();


        console.log(
          "SUBJECTS RESPONSE:",
          response
        );


        const subjectList =
          response?.subjects ||
          response?.data?.subjects ||
          response?.data ||
          response ||
          [];


        setSubjects(
          Array.isArray(subjectList)
            ? subjectList
            : []
        );

      } catch (err) {

        console.error(
          "Failed to load subjects:",
          err
        );


        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load subjects"
        );


        setSubjects([]);

      }


      // ----------------------------------------------
      // LOAD ACTIVE SESSION FROM BACKEND
      // ----------------------------------------------

      let restored = false;


      try {

        const response =
          await getActiveSession();


        console.log(
          "ACTIVE SESSION RESPONSE:",
          response
        );


        if (
          response?.success &&
          response?.session
        ) {

          restored =
            restoreSession(
              response.session
            );

        } else if (
          response?.session
        ) {

          // Handle APIs that return session
          // without success:true

          restored =
            restoreSession(
              response.session
            );

        } else {

          console.log(
            "Backend reports no active session."
          );

        }

      } catch (err) {

        console.warn(
          "Could not load active session from backend:",
          err
        );

      }


      // ----------------------------------------------
      // FALLBACK TO LOCAL STORAGE
      // ----------------------------------------------

      if (!restored) {

        const localSession =
          getLocalSession();


        if (localSession) {

          console.log(
            "Restoring active session from localStorage:",
            localSession
          );


          restored =
            restoreSession(
              localSession
            );

        }

      }


      // ----------------------------------------------
      // NO ACTIVE SESSION
      // ----------------------------------------------

      if (!restored) {

        setActiveSession(null);

        setIsRunning(false);

        setSeconds(0);

      }


      setLoading(false);

    };


    loadData();

  }, []);


  // ==================================================
  // TIMER
  // ==================================================

  useEffect(() => {

    let interval = null;


    if (isRunning && activeSession?.startTime) {

      // Immediately calculate the correct time
      // instead of waiting for the first interval.

      setSeconds(
        calculateElapsedSeconds(
          activeSession.startTime
        )
      );


      interval = setInterval(() => {

        setSeconds(
          calculateElapsedSeconds(
            activeSession.startTime
          )
        );

      }, 1000);

    }


    return () => {

      if (interval) {

        clearInterval(interval);

      }

    };

  }, [
    isRunning,
    activeSession
  ]);


  // ==================================================
  // HANDLE TAB VISIBILITY
  // ==================================================

  useEffect(() => {

    const handleVisibilityChange = () => {

      if (
        document.visibilityState === "visible" &&
        isRunning &&
        activeSession?.startTime
      ) {

        setSeconds(
          calculateElapsedSeconds(
            activeSession.startTime
          )
        );

      }

    };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

    };

  }, [
    isRunning,
    activeSession
  ]);


  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (
    totalSeconds
  ) => {

    const hours =
      Math.floor(
        totalSeconds / 3600
      );


    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );


    const secs =
      totalSeconds % 60;


    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;

  };


  // ==================================================
  // START STUDYING
  // ==================================================

  const handleStart = async () => {

    if (!selectedSubject) {

      setError(
        "Please select a subject first."
      );

      return;

    }


    try {

      setError("");

      setLoading(true);


      console.log(
        "Starting session for subject:",
        selectedSubject
      );


      const response =
        await startStudySession(
          selectedSubject
        );


      console.log(
        "START SESSION RESPONSE:",
        response
      );


      if (
        response?.success === false
      ) {

        throw new Error(
          response.message ||
          "Failed to start study session"
        );

      }


      const session =
        response?.session;


      if (!session) {

        throw new Error(
          "Study session was not created correctly."
        );

      }


      // Save session
      setActiveSession(session);

      saveLocalSession(session);


      // Calculate from backend startTime
      setSeconds(
        calculateElapsedSeconds(
          session.startTime
        )
      );


      setIsRunning(true);

    } catch (err) {

      console.error(
        "Failed to start study session:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to start study session"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // PAUSE / END SESSION
  // ==================================================

  const handlePause = async () => {

    try {

      setError("");

      setLoading(true);


      console.log(
        "Ending study session..."
      );


      const response =
        await endStudySession();


      console.log(
        "END SESSION RESPONSE:",
        response
      );


      if (
        response?.success === false
      ) {

        throw new Error(
          response.message ||
          "Failed to end study session"
        );

      }


      // Session has now been completed.
      // Do NOT immediately reset seconds.

      setActiveSession(null);

      setIsRunning(false);

      clearLocalSession();


    } catch (err) {

      console.error(
        "Failed to end study session:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to end study session"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // RESET
  // ==================================================

  const handleReset = async () => {

    try {

      setError("");

      setLoading(true);


      // ----------------------------------------------
      // If backend session is active,
      // end it first.
      // ----------------------------------------------

      if (activeSession) {

        await endStudySession();

      }


      // ----------------------------------------------
      // NOW actually reset everything
      // ----------------------------------------------

      setActiveSession(null);

      setIsRunning(false);

      setSeconds(0);

      clearLocalSession();

    } catch (err) {

      console.error(
        "Failed to reset session:",
        err
      );


      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to reset session"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="study-timer-page">


      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            FOCUS TIME
          </p>


          <h1>
            Study Timer
          </h1>


          <p className="page-description">
            Focus on one subject and track your
            actual study time.
          </p>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="timer-error">

          {error}

        </div>

      )}


      {/* TIMER CARD */}

      <div className="study-timer-card">


        {/* SUBJECT */}

        <div className="timer-subject-group">

          <label htmlFor="subject">
            Subject
          </label>


          <select
            id="subject"

            value={selectedSubject}

            onChange={(e) => {

              setSelectedSubject(
                e.target.value
              );

              setError("");

            }}

            disabled={
              loading ||
              isRunning
            }
          >

            <option value="">

              {loading
                ? "Loading subjects..."
                : "Select a subject"}

            </option>


            {subjects.map(
              (subject) => (

                <option
                  key={
                    subject.id ||
                    subject._id
                  }

                  value={
                    subject.id ||
                    subject._id
                  }
                >

                  {subject.name}

                </option>

              )
            )}

          </select>

        </div>


        {/* TIMER */}

        <div className="timer-display">

          {formatTime(seconds)}

        </div>


        {/* STATUS */}

        <div className="timer-status">

          {isRunning
            ? "Studying..."
            : seconds > 0
            ? "Session completed"
            : "Ready to start"}

        </div>


        {/* BUTTONS */}

        <div className="timer-actions">


          {!isRunning ? (

            <button
              className="primary-button"

              onClick={handleStart}

              disabled={
                !selectedSubject ||
                loading
              }
            >

              Start Studying

            </button>

          ) : (

            <button
              className="primary-button"

              onClick={handlePause}

              disabled={loading}
            >

              {loading
                ? "Saving..."
                : "Pause"}

            </button>

          )}


          <button
            className="secondary-button"

            onClick={handleReset}

            disabled={
              seconds === 0 ||
              loading
            }
          >

            Reset

          </button>


        </div>


      </div>

    </div>

  );

};


export default StudyTimer;