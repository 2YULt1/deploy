import AsyncLock from "async-lock";
import jwt from "jsonwebtoken";
import { AccessError, InputError } from "./error.js";
import redis from './db.js';

const lock = new AsyncLock();
const JWT_SECRET = "llamallamaduck";

/***************************************************************
                      State Management
***************************************************************/

const update = async (admins, games, sessions) => {
  try {
    await redis.set('admins', JSON.stringify(admins));
    await redis.set('games', JSON.stringify(games));
    await redis.set('sessions', JSON.stringify(sessions));
  } catch (error) {
    throw new Error("Writing to database failed");
  }
};

export const save = async () => {
  const admins = JSON.parse(await redis.get('admins') || '{}');
  const games = JSON.parse(await redis.get('games') || '{}');
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  await update(admins, games, sessions);
};

export const reset = async () => {
  await update({}, {}, {});
};

// Initialize data if not exists
const initializeData = async () => {
  try {
    const admins = await redis.get('admins');
    const games = await redis.get('games');
    const sessions = await redis.get('sessions');
    
    if (!admins || !games || !sessions) {
      await update({}, {}, {});
    }
  } catch (error) {
    console.log("WARNING: Error initializing data, creating new database");
    await update({}, {}, {});
  }
};

initializeData();

/***************************************************************
                      Helper Functions
***************************************************************/

const newSessionId = async () => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  return generateId(Object.keys(sessions), 999999);
};

const newPlayerId = async () => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  return generateId(
    Object.keys(sessions).map((s) => Object.keys(sessions[s].players || {}))
  );
};

export const userLock = (callback) =>
  new Promise((resolve, reject) => {
    lock.acquire("userAuthLock", callback(resolve, reject));
  });

export const gameLock = (callback) =>
  new Promise((resolve, reject) => {
    lock.acquire("gameMutateLock", callback(resolve, reject));
  });

export const sessionLock = (callback) =>
  new Promise((resolve, reject) => {
    lock.acquire("sessionMutateLock", callback(resolve, reject));
  });

const copy = (x) => JSON.parse(JSON.stringify(x));
const randNum = (max) =>
  Math.round(
    Math.random() * (max - Math.floor(max / 10)) + Math.floor(max / 10)
  );
const generateId = (currentList, max = 999999999) => {
  let R = randNum(max);
  while (currentList.includes(R)) {
    R = randNum(max);
  }
  return R.toString();
};

/***************************************************************
                      Auth Functions
***************************************************************/

export const getEmailFromAuthorization = async (authorization) => {
  try {
    const token = authorization.replace("Bearer ", "");
    const { email } = jwt.verify(token, JWT_SECRET);
    const admins = JSON.parse(await redis.get('admins') || '{}');
    if (!(email in admins)) {
      throw new AccessError("Invalid Token");
    }
    return email;
  } catch {
    throw new AccessError("Invalid token");
  }
};

export const login = async (email, password) =>
  userLock(async (resolve, reject) => {
    const admins = JSON.parse(await redis.get('admins') || '{}');
    if (email in admins) {
      if (admins[email].password === password) {
        admins[email].sessionActive = true;
        await redis.set('admins', JSON.stringify(admins));
        resolve(jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" }));
      }
    }
    reject(new InputError("Invalid username or password"));
  });

export const logout = async (email) =>
  userLock(async (resolve, reject) => {
    const admins = JSON.parse(await redis.get('admins') || '{}');
    admins[email].sessionActive = false;
    await redis.set('admins', JSON.stringify(admins));
    resolve();
  });

export const register = async (email, password, name) =>
  userLock(async (resolve, reject) => {
    const admins = JSON.parse(await redis.get('admins') || '{}');
    if (email in admins) {
      return reject(new InputError("Email address already registered"));
    }
    admins[email] = {
      name,
      password,
      sessionActive: true,
    };
    await redis.set('admins', JSON.stringify(admins));
    const token = jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" });
    resolve(token);
  });

/***************************************************************
                      Game Functions
***************************************************************/

export const assertOwnsGame = async (email, gameId) =>
  gameLock(async (resolve, reject) => {
    const games = JSON.parse(await redis.get('games') || '{}');
    if (!(gameId in games)) {
      return reject(new InputError("Invalid game ID"));
    } else if (games[gameId].owner !== email) {
      return reject(new InputError("Admin does not own this Game"));
    } else {
      resolve();
    }
  });

export const getGamesFromAdmin = async (email) =>
  gameLock(async (resolve, reject) => {
    const games = JSON.parse(await redis.get('games') || '{}');
    const filteredGames = Object.keys(games)
      .filter((key) => games[key].owner === email)
      .map((key) => {
        const game = games[key] || {};
        return {
          ...(game || {}),
          id: parseInt(key, 10),
          active: getActiveSessionIdFromGameId(key),
          oldSessions: getInactiveSessionsIdFromGameId(key),
        };
      });
    resolve(filteredGames);
  });

export const updateGamesFromAdmin = async ({ gamesArrayFromRequest, email }) =>
  gameLock(async (resolve, reject) => {
    try {
      const games = JSON.parse(await redis.get('games') || '{}');
      // Get all existing game IDs owned by other admins
      const otherAdminGameIds = Object.keys(games).filter(
        (gameId) => games[gameId].owner !== email
      );

      // Verify all games in array belong to admin
      for (const gameFromRequest of gamesArrayFromRequest) {
        if (!gameFromRequest.owner) {
          return reject(
            new InputError(`Game must have owner: ${gameFromRequest.owner}`)
          );
        }
        if (gameFromRequest.owner !== email) {
          return reject(
            new InputError("Cannot modify games owned by other admins")
          );
        }
      }

      // Convert array to object format and update
      const newGames = {};
      gamesArrayFromRequest.forEach((gameFromRequest) => {
        const gameIdFromRequest = gameFromRequest.id || gameFromRequest.gameId || gameFromRequest.gameID;
        const gameId =
          gameIdFromRequest &&
          otherAdminGameIds.includes(gameIdFromRequest.toString()) === false
            ? gameIdFromRequest.toString()
            : generateId(Object.keys(games));

        newGames[gameId] = {
          owner: gameFromRequest.owner,
          active: getActiveSessionIdFromGameId(gameId),
          oldSessions: getInactiveSessionsIdFromGameId(gameId),
          ...gameFromRequest,
        };
      });

      // Only update games owned by this admin, preserve others
      Object.keys(games).forEach((gameId) => {
        if (games[gameId].owner !== email) {
          newGames[gameId] = games[gameId];
        }
      });

      await redis.set('games', JSON.stringify(newGames));
      resolve();
    } catch (error) {
      reject(new Error("Failed to update games"));
    }
  });

export const startGame = async (gameId) =>
  gameLock(async (resolve, reject) => {
    const games = JSON.parse(await redis.get('games') || '{}');
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    
    if (await gameHasActiveSession(gameId)) {
      return reject(new InputError("Game already has active session"));
    } else {
      const id = await newSessionId();
      sessions[id] = await newSessionPayload(gameId);
      await redis.set('sessions', JSON.stringify(sessions));
      resolve(id);
    }
  });

export const advanceGame = async (gameId) =>
  gameLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = await getActiveSessionFromGameIdThrow(gameId);
    
    if (!session.active) {
      return reject(new InputError("Cannot advance a game that is not active"));
    } else {
      const totalQuestions = session.questions.length;
      session.position += 1;
      session.answerAvailable = false;
      session.isoTimeLastQuestionStarted = new Date().toISOString();
      
      if (session.position >= totalQuestions) {
        await endGame(gameId);
      } else {
        try {
          const questionDuration = session.questions[session.position].duration;
          if (sessionTimeouts[session.id]) {
            clearTimeout(sessionTimeouts[session.id]);
          }
          sessionTimeouts[session.id] = setTimeout(async () => {
            session.answerAvailable = true;
            await redis.set('sessions', JSON.stringify(sessions));
          }, questionDuration * 1000);
        } catch (error) {
          reject(new InputError("Question duration not found"));
        }
      }
      
      await redis.set('sessions', JSON.stringify(sessions));
      resolve(session.position);
    }
  });

export const endGame = async (gameId) =>
  gameLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = await getActiveSessionFromGameIdThrow(gameId);
    session.active = false;
    await redis.set('sessions', JSON.stringify(sessions));
    resolve();
  });

export const mutateGame = async ({ gameId, mutationType }) => {
  let result;
  try {
    switch (mutationType.toUpperCase()) {
      case "START":
        const sessionId = await startGame(gameId);
        result = { status: "started", sessionId };
        break;
      case "ADVANCE":
        const position = await advanceGame(gameId);
        result = { status: "advanced", position };
        break;
      case "END":
        await endGame(gameId);
        result = { status: "ended" };
        break;
      default:
        throw new InputError("Invalid mutation type");
    }
    return result;
  } catch (error) {
    throw error instanceof InputError
      ? error
      : new Error("Failed to mutate game: " + error.message);
  }
};

/***************************************************************
                      Session Functions
***************************************************************/

const gameHasActiveSession = async (gameId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  return Object.keys(sessions).filter(
    (s) => sessions[s].gameId === gameId && sessions[s].active
  ).length > 0;
};

const getActiveSessionFromGameIdThrow = async (gameId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  if (!await gameHasActiveSession(gameId)) {
    throw new InputError("Game has no active session");
  }
  const sessionId = await getActiveSessionIdFromGameId(gameId);
  if (sessionId !== null) {
    return sessions[sessionId];
  }
  return null;
};

const getActiveSessionIdFromGameId = async (gameId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  const activeSessions = Object.keys(sessions).filter(
    (s) => sessions[s].gameId === gameId && sessions[s].active
  );
  if (activeSessions.length === 1) {
    return parseInt(activeSessions[0], 10);
  }
  return null;
};

const getInactiveSessionsIdFromGameId = async (gameId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  return Object.keys(sessions)
    .filter((sid) => sessions[sid].gameId === gameId && !sessions[sid].active)
    .map((s) => parseInt(s, 10));
};

const getActiveSessionFromSessionId = async (sessionId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  if (sessionId in sessions) {
    if (sessions[sessionId].active) {
      return sessions[sessionId];
    }
  }
  throw new InputError("Session ID is not an active session");
};

const sessionIdFromPlayerId = async (playerId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  for (const sessionId of Object.keys(sessions)) {
    if (
      Object.keys(sessions[sessionId].players).filter((p) => p === playerId)
        .length > 0
    ) {
      return sessionId;
    }
  }
  throw new InputError("Player ID does not refer to valid player id");
};

const newSessionPayload = async (gameId) => {
  const games = JSON.parse(await redis.get('games') || '{}');
  return {
    gameId,
    position: -1,
    isoTimeLastQuestionStarted: null,
    players: {},
    questions: copy(games[gameId].questions),
    active: true,
    answerAvailable: false,
  };
};

const newPlayerPayload = (name, numQuestions) => ({
  name: name,
  answers: Array(numQuestions).fill({
    questionStartedAt: null,
    answeredAt: null,
    answers: [],
    correct: false,
  }),
});

export const sessionStatus = async (sessionId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  const session = sessions[sessionId];
  return {
    active: session.active,
    answerAvailable: session.answerAvailable,
    isoTimeLastQuestionStarted: session.isoTimeLastQuestionStarted,
    position: session.position,
    questions: session.questions,
    players: Object.keys(session.players).map(
      (player) => session.players[player].name
    ),
  };
};

export const assertOwnsSession = async (email, sessionId) => {
  const sessions = JSON.parse(await redis.get('sessions') || '{}');
  await assertOwnsGame(email, sessions[sessionId].gameId);
};

export const sessionResults = async (sessionId) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = sessions[sessionId];
    if (session.active) {
      return reject(new InputError("Cannot get results for active session"));
    } else {
      resolve(Object.keys(session.players).map((pid) => session.players[pid]));
    }
  });

export const playerJoin = async (name, sessionId) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    if (name === undefined) {
      return reject(new InputError("Name must be supplied"));
    } else {
      const session = await getActiveSessionFromSessionId(sessionId);
      if (session.position >= 0) {
        return reject(new InputError("Session has already begun"));
      } else {
        const id = await newPlayerId();
        session.players[id] = newPlayerPayload(name, session.questions.length);
        await redis.set('sessions', JSON.stringify(sessions));
        resolve(parseInt(id, 10));
      }
    }
  });

export const hasStarted = async (playerId) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = await getActiveSessionFromSessionId(
      await sessionIdFromPlayerId(playerId)
    );
    if (session.isoTimeLastQuestionStarted !== null) {
      resolve(true);
    } else {
      resolve(false);
    }
  });

export const getQuestion = async (playerId) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = await getActiveSessionFromSessionId(
      await sessionIdFromPlayerId(playerId)
    );
    if (session.position === -1) {
      return reject(new InputError("Session has not started yet"));
    } else {
      try {
        const question = session.questions[session.position];
        const { correctAnswers, ...questionWithoutAnswer } = question;
        const questionWithSessionInfo = {
          ...questionWithoutAnswer,
          isoTimeLastQuestionStarted: session.isoTimeLastQuestionStarted,
        };
        resolve(questionWithSessionInfo);
      } catch (error) {
        reject(new InputError("Question not found"));
      }
    }
  });

export const getAnswers = async (playerId) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = await getActiveSessionFromSessionId(
      await sessionIdFromPlayerId(playerId)
    );
    if (session.position === -1) {
      return reject(new InputError("Session has not started yet"));
    } else if (!session.answerAvailable) {
      return reject(new InputError("Answers are not available yet"));
    } else {
      try {
        const answers = session.questions[session.position].correctAnswers;
        resolve(answers);
      } catch (error) {
        reject(new InputError("Question not found"));
      }
    }
  });

export const submitAnswers = async (playerId, answersFromRequest) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    if (answersFromRequest === undefined || answersFromRequest.length === 0) {
      return reject(new InputError("Answers must be provided"));
    }

    const session = await getActiveSessionFromSessionId(
      await sessionIdFromPlayerId(playerId)
    );
    if (session.position === -1) {
      return reject(new InputError("Session has not started yet"));
    } else if (session.answerAvailable) {
      return reject(
        new InputError("Can't answer question once answer is available")
      );
    } else {
      const currentQuestion = session.questions[session.position];
      session.players[playerId].answers[session.position] = {
        questionStartedAt: session.isoTimeLastQuestionStarted,
        answeredAt: new Date().toISOString(),
        answers: answersFromRequest,
        correct:
          JSON.stringify(currentQuestion.correctAnswers.sort()) ===
          JSON.stringify(answersFromRequest.sort()),
      };
      await redis.set('sessions', JSON.stringify(sessions));
      resolve();
    }
  });

export const getResults = async (playerId) =>
  sessionLock(async (resolve, reject) => {
    const sessions = JSON.parse(await redis.get('sessions') || '{}');
    const session = sessions[await sessionIdFromPlayerId(playerId)];
    if (session.active) {
      return reject(
        new InputError("Session is ongoing, cannot get results yet")
      );
    } else if (session.position === -1) {
      return reject(new InputError("Session has not started yet"));
    } else {
      resolve(session.players[playerId].answers);
    }
  });
