const REDACTED = '[redacted]';

const SENSITIVE_KEY_PATTERN = '(authorization|cookie|set-cookie|access[_-]?token|refresh[_-]?token|id[_-]?token|session[_-]?token|api[_-]?key|secret|password|csrf|account[_-]?id|user[_-]?id|organization[_-]?id|org[_-]?id)';

export function redactSensitive(value) {
    if (value === null || value === undefined)
        return '';

    let text = String(value);

    text = text.replace(/\b(Authorization|Cookie|Set-Cookie)\s*:\s*[^\r\n]+/gi, (_match, key) => `${key}: ${REDACTED}`);
    text = text.replace(new RegExp(`\\b(${SENSITIVE_KEY_PATTERN})\\b\\s*[:=]\\s*["']?[^\\s"',;}]+`, 'gi'), (_match, key) => `${key}: ${REDACTED}`);
    text = text.replace(/\b(token|secret|password)\s+["']?[A-Za-z0-9._~+/=-]{6,}/gi, (_match, key) => `${key} ${REDACTED}`);
    text = text.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, `Bearer ${REDACTED}`);
    text = text.replace(/\b(sk-[A-Za-z0-9_-]{12,})\b/g, REDACTED);
    text = text.replace(/\bsess-[A-Za-z0-9_-]{12,}\b/g, REDACTED);
    text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED);
    text = text.replace(/\b(acct|account|user|org|workspace|team)[:/_-]?[A-Za-z0-9_-]{8,}\b/gi, REDACTED);
    text = text.replace(/\b[A-Za-z0-9+/=_-]{36,}\b/g, REDACTED);

    if (text.length > 600)
        text = `${text.slice(0, 600)}...`;

    return text;
}

export function sanitizeError(error, fallback = 'Unable to refresh Codex Balance.') {
    if (!error)
        return fallback;
    const message = typeof error === 'string' ? error : (error.message ?? String(error));
    const redacted = redactSensitive(message).trim();
    return redacted || fallback;
}

export function containsSensitiveValue(value) {
    const text = String(value ?? '');
    return redactSensitive(text) !== text;
}
