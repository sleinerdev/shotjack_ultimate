/* ===== Logging System ===== */

/**
 * Logger class with different log levels
 */
class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  _log(level, message, data = null) {
    if (level > currentLogLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS)[level];
    const prefix = this.prefix ? `[${this.prefix}] ` : '';

    const logMessage = `${timestamp} ${levelName}: ${prefix}${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  error(message, data = null) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }
}

// Create loggers for different components
const serverLogger = new Logger('SERVER');
const gameLogger = new Logger('GAME');
const wsLogger = new Logger('WEBSOCKET');
const errorLogger = new Logger('ERROR');

/**
 * Logs server startup information
 */
function logServerStart(port) {
  serverLogger.info(`WebSocket server listening on port ${port}`);
}

/**
 * Logs match creation
 */
function logMatchCreated(matchId, playerId, playerName) {
  gameLogger.info(`Match created: ${matchId} by ${playerName} (${playerId})`);
}

/**
 * Logs player joining match
 */
function logPlayerJoined(matchId, playerId, playerName) {
  gameLogger.info(`Player joined: ${playerName} (${playerId}) joined match ${matchId}`);
}

/**
 * Logs game actions
 */
function logGameAction(matchId, playerId, action) {
  gameLogger.debug(`Action in ${matchId}: ${playerId} -> ${action}`);
}

/**
 * Logs round start
 */
function logRoundStart(matchId, round) {
  gameLogger.info(`Round ${round} started in match ${matchId}`);
}

/**
 * Logs WebSocket connection events
 */
function logConnection(clientId, event) {
  wsLogger.debug(`Connection ${clientId}: ${event}`);
}

/**
 * Logs errors with context
 */
function logError(error, context = '') {
  const contextStr = context ? ` (${context})` : '';
  errorLogger.error(`${error.message}${contextStr}`, {
    stack: error.stack,
    ...error
  });
}

/**
 * Logs validation errors
 */
function logValidationError(clientId, messageType, error) {
  wsLogger.warn(`Validation error from ${clientId} for ${messageType}: ${error}`);
}

/**
 * Logs rate limiting
 */
function logRateLimited(clientId, action) {
  wsLogger.warn(`Rate limited: ${clientId} attempted ${action}`);
}

/**
 * Logs match cleanup
 */
function logMatchCleanup(matchId, reason) {
  gameLogger.info(`Match ${matchId} cleaned up: ${reason}`);
}

// Export constants
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

export const currentLogLevel = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : LOG_LEVELS.INFO;

// Export class
export { Logger };

// Export logger instances
export { serverLogger, gameLogger, wsLogger, errorLogger };

// Export functions
export {
  logServerStart,
  logMatchCreated,
  logPlayerJoined,
  logGameAction,
  logRoundStart,
  logConnection,
  logError,
  logValidationError,
  logRateLimited,
  logMatchCleanup
};
