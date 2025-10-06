import { useState } from 'react';

export default function RedisTest() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/redis');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSet = async () => {
    if (!key || !value) {
      setResult('Please enter both key and value');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/redis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Redis Test Page</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Get Data from Redis</h2>
        <button onClick={handleGet} disabled={loading}>
          {loading ? 'Loading...' : 'Get "item" from Redis'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Set Data in Redis</h2>
        <input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={handleSet} disabled={loading}>
          {loading ? 'Setting...' : 'Set in Redis'}
        </button>
      </div>

      <div>
        <h2>Result:</h2>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          fontSize: '14px'
        }}>
          {result || 'No result yet'}
        </pre>
      </div>
    </div>
  );
}