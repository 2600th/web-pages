import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, PERSON, SITE } from '../../src/data/site';

describe('site identity', () => {
  it('uses the human identity and canonical production URL', () => {
    expect(PERSON.name).toBe('Pranshul Chandhok');
    expect(SITE.url).toBe('https://www.2600th.com');
    expect(CONTACT_EMAIL).toBe('2600th@gmail.com');
  });
});
