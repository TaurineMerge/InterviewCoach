import { parseFileShort, parseFileLong } from '../md-parser.js';
import { writeFile, unlink } from 'fs/promises';

describe('md-parser', () => {
  const testFiles = {
    normal: 'test_normal.md',
    noShort: 'test_no_short.md',
    noLong: 'test_no_long.md',
    empty: 'test_empty.md',
    extra: 'test_extra.md',
    missing: 'test_missing.md', // not existing
  };

  beforeAll(async () => {
    await writeFile(
      testFiles.normal,
      '# Короткий ответ\nshort\n# Длинный ответ\nlong answer',
    );
    await writeFile(testFiles.noShort, '# Длинный ответ\nonly long');
    await writeFile(testFiles.noLong, '# Короткий ответ\nonly short');
    await writeFile(testFiles.empty, '');
    await writeFile(
      testFiles.extra,
      '# Короткий ответ\nshort\n# Длинный ответ\nlong\n# Пример\nexample',
    );
  });

  afterAll(async () => {
    for (const file of Object.values(testFiles)) {
      try {
        await unlink(file);
      } catch {} // ingnore missing
    }
  });

  it('parses short and long answers normally', async () => {
    const result = await parseFileShort(testFiles.normal);
    expect(result).toEqual({ short: 'short', hasLong: true });

    const long = await parseFileLong(testFiles.normal);
    expect(long).toBe('long answer');
  });

  it('handles missing short answer', async () => {
    const result = await parseFileShort(testFiles.noShort);
    expect(result).toEqual({ hasLong: true });
  });

  it('handles missing long answer', async () => {
    const result = await parseFileShort(testFiles.noLong);
    expect(result).toEqual({ short: 'only short', hasLong: false });

    const long = await parseFileLong(testFiles.noLong);
    expect(long).toBeNull();
  });

  it('handles empty file', async () => {
    const result = await parseFileShort(testFiles.empty);
    expect(result).toBeNull();

    const long = await parseFileLong(testFiles.empty);
    expect(long).toBeNull();
  });

  it('parses file with extra sections', async () => {
    const result = await parseFileShort(testFiles.extra);
    expect(result).toEqual({ short: 'short', hasLong: true });

    const long = await parseFileLong(testFiles.extra);
    expect(long).toBe('long');
  });

  it('returns null for missing file', async () => {
    const short = await parseFileShort(testFiles.missing);
    expect(short).toBeNull();

    const long = await parseFileLong(testFiles.missing);
    expect(long).toBeNull();
  });
});
