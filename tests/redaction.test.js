import {containsSensitiveValue, redactSensitive, sanitizeError} from '../lib/redaction.js';

function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}

const source = [
    'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456789',
    'Cookie: session=sess-abcdefghijklmnopqrstuvwxyz',
    'access_token=tok_abcdefghijklmnopqrstuvwxyz123456',
    'account_id=acct_123456789abcdef',
    'user@example.com',
    'raw payload abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
].join('\n');

const redacted = redactSensitive(source);

assert(!redacted.includes('abcdefghijklmnopqrstuvwxyz123456789'), 'bearer token redacted');
assert(!redacted.includes('sess-abcdefghijklmnopqrstuvwxyz'), 'cookie token redacted');
assert(!redacted.includes('tok_abcdefghijklmnopqrstuvwxyz123456'), 'token-like value redacted');
assert(!redacted.includes('acct_123456789abcdef'), 'account identifier redacted');
assert(!redacted.includes('user@example.com'), 'email redacted');
assert(redacted.includes('[redacted]'), 'redaction marker present');
assert(containsSensitiveValue(source), 'sensitive source detected');

const error = sanitizeError(new Error('Authorization: Bearer supersecrettoken1234567890'));
assert(!error.includes('supersecrettoken1234567890'), 'errors sanitized');

const long = redactSensitive('x'.repeat(800));
assert(long.length <= 603, 'long payloads truncated');

print('redaction tests passed');
