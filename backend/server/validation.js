/* ===== Input Validation ===== */

/**
 * Validates a WebSocket message
 * @param {any} msg - The message to validate
 * @returns {Object} - { isValid: boolean, error?: string }
 */
function validateMessage(msg) {
  if (!msg || typeof msg !== 'object') {
    return { isValid: false, error: 'Message must be a valid object' };
  }

  if (!msg.type || typeof msg.type !== 'string') {
    return { isValid: false, error: 'Message must have a valid type string' };
  }

  if (!ALLOWED_MESSAGE_TYPES.includes(msg.type)) {
    return { isValid: false, error: `Unknown message type: ${msg.type}` };
  }

  // Type-specific validation
  switch (msg.type) {
    case 'create_match':
      return validateCreateMatch(msg);
    case 'join_match':
      return validateJoinMatch(msg);
    case 'reconnect':
      return validateReconnect(msg);
    case 'action':
      return validateAction(msg);
    default:
      return { isValid: true };
  }
}

/**
 * Validates create_match message
 */
function validateCreateMatch(msg) {
  if (msg.name !== undefined) {
    if (typeof msg.name !== 'string') {
      return { isValid: false, error: 'Name must be a string' };
    }
    if (msg.name.length > MAX_NAME_LENGTH) {
      return { isValid: false, error: `Name too long (max ${MAX_NAME_LENGTH} characters)` };
    }
  }
  return { isValid: true };
}

/**
 * Validates join_match message
 */
function validateJoinMatch(msg) {
  if (!msg.matchId || typeof msg.matchId !== 'string') {
    return { isValid: false, error: 'matchId is required and must be a string' };
  }
  if (msg.matchId.length > MAX_MATCH_ID_LENGTH) {
    return { isValid: false, error: `matchId too long (max ${MAX_MATCH_ID_LENGTH} characters)` };
  }

  if (msg.name !== undefined) {
    if (typeof msg.name !== 'string') {
      return { isValid: false, error: 'Name must be a string' };
    }
    if (msg.name.length > MAX_NAME_LENGTH) {
      return { isValid: false, error: `Name too long (max ${MAX_NAME_LENGTH} characters)` };
    }
  }
  return { isValid: true };
}

/**
 * Validates reconnect message
 */
function validateReconnect(msg) {
  if (!msg.matchId || typeof msg.matchId !== 'string') {
    return { isValid: false, error: 'matchId is required and must be a string' };
  }
  if (msg.matchId.length > MAX_MATCH_ID_LENGTH) {
    return { isValid: false, error: `matchId too long (max ${MAX_MATCH_ID_LENGTH} characters)` };
  }

  if (!msg.token || typeof msg.token !== 'string') {
    return { isValid: false, error: 'token is required and must be a string' };
  }

  if (msg.name !== undefined) {
    if (typeof msg.name !== 'string') {
      return { isValid: false, error: 'Name must be a string' };
    }
    if (msg.name.length > MAX_NAME_LENGTH) {
      return { isValid: false, error: `Name too long (max ${MAX_NAME_LENGTH} characters)` };
    }
  }
  return { isValid: true };
}

/**
 * Validates action message
 */
function validateAction(msg) {
  if (!msg.action || typeof msg.action !== 'string') {
    return { isValid: false, error: 'action is required and must be a string' };
  }

  if (!ALLOWED_ACTIONS.includes(msg.action)) {
    return { isValid: false, error: `Unknown action: ${msg.action}` };
  }

  return { isValid: true };
}

/**
 * Validates match ID format
 */
function validateMatchId(matchId) {
  if (!matchId || typeof matchId !== 'string') {
    return { isValid: false, error: 'matchId must be a string' };
  }

  if (matchId.length === 0 || matchId.length > MAX_MATCH_ID_LENGTH) {
    return { isValid: false, error: `matchId length must be between 1 and ${MAX_MATCH_ID_LENGTH}` };
  }

  // Basic alphanumeric check
  if (!/^[a-zA-Z0-9]+$/.test(matchId)) {
    return { isValid: false, error: 'matchId must contain only alphanumeric characters' };
  }

  return { isValid: true };
}

/**
 * Sanitizes a string by trimming and removing potentially harmful characters
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML characters
    .substring(0, MAX_NAME_LENGTH); // Limit length
}

// Export constants
export const MAX_NAME_LENGTH = 20;
export const MAX_MATCH_ID_LENGTH = 10;
export const ALLOWED_MESSAGE_TYPES = [
  'create_match', 'join_match', 'reconnect', 'leave_match',
  'start_round', 'action', 'drink_done', 'distribute_done'
];
export const ALLOWED_ACTIONS = ['hit', 'stand', 'double', 'split'];

// Export functions
export { validateMessage, validateMatchId, sanitizeString };
