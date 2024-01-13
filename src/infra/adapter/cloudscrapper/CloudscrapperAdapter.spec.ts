import CloudscrapperAdapter from './CloudscrapperAdapter';
import cloudscraper from 'cloudscraper';

jest.mock('cloudscraper');

describe('CloudscrapperAdapter', () => {
  let adapter: CloudscrapperAdapter;

  beforeEach(() => {
    (cloudscraper as unknown as jest.Mock).mockClear();
    adapter = new CloudscrapperAdapter();
  });

  it('should make a GET request with the correct parameters', async () => {
    const url = 'http://example.com';
    const mockResponse = 'response';
    (cloudscraper as unknown as jest.Mock).mockResolvedValue(mockResponse);

    const response = await adapter.get(url);

    expect(cloudscraper).toHaveBeenCalledWith({
      uri: url,
      headers: {
        'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
        'Cache-Control': 'private',
        'Accept': 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5'
      },
    });
    expect(response).toBe(mockResponse);
  });

  it('should throw an error when trying to make a POST request', async () => {
    const url = 'http://example.com';
    const params = { key: 'value' };

    await expect(adapter.post(url, params)).rejects.toThrow('Method not implemented.');
  });
});