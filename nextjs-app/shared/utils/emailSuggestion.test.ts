import { describe, it, expect } from 'vitest';
import { suggestEmailCorrection } from './emailSuggestion';

describe('suggestEmailCorrection', () => {
  it('returns null for valid email domains', () => {
    expect(suggestEmailCorrection('test@gmail.com')).toBeNull();
    expect(suggestEmailCorrection('test@outlook.com')).toBeNull();
    expect(suggestEmailCorrection('test@hotmail.com')).toBeNull();
    expect(suggestEmailCorrection('test@yahoo.com')).toBeNull();
    expect(suggestEmailCorrection('test@icloud.com')).toBeNull();
  });

  it('suggests correction for Gmail typos', () => {
    expect(suggestEmailCorrection('user@gmial.com')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@gmal.com')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@gamil.com')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@gnail.com')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@gmail.co')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@gmaill.com')).toBe('user@gmail.com');
  });

  it('suggests correction for Hotmail typos', () => {
    expect(suggestEmailCorrection('user@hotmal.com')).toBe('user@hotmail.com');
    expect(suggestEmailCorrection('user@hotmai.com')).toBe('user@hotmail.com');
    expect(suggestEmailCorrection('user@hotamil.com')).toBe('user@hotmail.com');
    expect(suggestEmailCorrection('user@hotmial.com')).toBe('user@hotmail.com');
  });

  it('suggests correction for Outlook typos', () => {
    expect(suggestEmailCorrection('user@outlok.com')).toBe('user@outlook.com');
    expect(suggestEmailCorrection('user@outllok.com')).toBe('user@outlook.com');
    expect(suggestEmailCorrection('user@outloo.com')).toBe('user@outlook.com');
    expect(suggestEmailCorrection('user@outlool.com')).toBe('user@outlook.com');
  });

  it('suggests correction for Yahoo typos', () => {
    expect(suggestEmailCorrection('user@yaho.com')).toBe('user@yahoo.com');
    expect(suggestEmailCorrection('user@yahooo.com')).toBe('user@yahoo.com');
    expect(suggestEmailCorrection('user@yahoo.co')).toBe('user@yahoo.com');
    expect(suggestEmailCorrection('user@yhoo.com')).toBe('user@yahoo.com');
  });

  it('suggests correction for iCloud typos', () => {
    expect(suggestEmailCorrection('user@icloud.co')).toBe('user@icloud.com');
    expect(suggestEmailCorrection('user@icoud.com')).toBe('user@icloud.com');
  });

  it('returns null for empty or invalid input', () => {
    expect(suggestEmailCorrection('')).toBeNull();
    expect(suggestEmailCorrection('invalid')).toBeNull();
    expect(suggestEmailCorrection('@')).toBeNull();
  });

  it('preserves local part case', () => {
    expect(suggestEmailCorrection('User.Name@gmial.com')).toBe('User.Name@gmail.com');
    expect(suggestEmailCorrection('UPPERCASE@gmial.com')).toBe('UPPERCASE@gmail.com');
    expect(suggestEmailCorrection('mixed.CASE@hotmal.com')).toBe('mixed.CASE@hotmail.com');
  });

  it('handles case-insensitive domain matching', () => {
    expect(suggestEmailCorrection('user@GMIAL.COM')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@GmIaL.CoM')).toBe('user@gmail.com');
    expect(suggestEmailCorrection('user@HOTMAL.COM')).toBe('user@hotmail.com');
  });

  it('returns null for unknown domains', () => {
    expect(suggestEmailCorrection('user@example.com')).toBeNull();
    expect(suggestEmailCorrection('user@company.org')).toBeNull();
    expect(suggestEmailCorrection('user@university.edu')).toBeNull();
  });

  it('handles edge cases gracefully', () => {
    expect(suggestEmailCorrection('user@')).toBeNull();
    expect(suggestEmailCorrection('@domain.com')).toBeNull();
    expect(suggestEmailCorrection('user@domain@extra.com')).toBeNull();
  });
});
