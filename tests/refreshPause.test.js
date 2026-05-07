import {shouldStartRefresh} from '../lib/settings.js';

function assertEqual(actual, expected, message) {
    if (actual !== expected)
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

assertEqual(shouldStartRefresh({refreshPaused: false}), true, 'refresh starts when pause is off');
assertEqual(shouldStartRefresh({refreshPaused: true}), false, 'refresh does not start when pause is on');
assertEqual(shouldStartRefresh({}), true, 'refresh starts by default');

print('refresh pause tests passed');
