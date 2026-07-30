// Stores and retrieves the comments for the review tool, using Supabase.
// Needs two environment variables set in the Vercel project:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// (see README.md for where to get these — it's free)

module.exports = async (req, res) => {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!URL || !KEY) {
    res.status(500).json({
      error:
        'Storage is not set up yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project settings (Settings > Environment Variables), then redeploy.'
    });
    return;
  }

  const TABLE = URL.replace(/\/$/, '') + '/rest/v1/comments';
  const headers = {
    apikey: KEY,
    Authorization: 'Bearer ' + KEY,
    'Content-Type': 'application/json'
  };

  // Map a database row to the shape the frontend expects.
  function fromRow(row) {
    return {
      id: row.id,
      author: row.author,
      ts: Number(row.ts),
      quote: row.quote,
      text: row.body,
      tab: row.tab,
      occurrenceIndex: row.occurrence_index || 0
    };
  }

  async function fetchAll() {
    const r = await fetch(TABLE + '?select=*&order=ts.asc', { headers });
    if (!r.ok) throw new Error('Could not read comments (' + r.status + ')');
    const rows = await r.json();
    return rows.map(fromRow);
  }

  try {
    if (req.method === 'GET') {
      const comments = await fetchAll();
      res.status(200).json({ comments });
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          body = {};
        }
      }
      body = body || {};

      if (body.action === 'add' && body.comment && body.comment.id) {
        const c = body.comment;
        const row = {
          id: c.id,
          author: c.author,
          ts: c.ts,
          quote: c.quote,
          body: c.text,
          tab: c.tab || null,
          occurrence_index: c.occurrenceIndex || 0
        };
        const r = await fetch(TABLE, {
          method: 'POST',
          headers: Object.assign({}, headers, { Prefer: 'return=minimal' }),
          body: JSON.stringify(row)
        });
        if (!r.ok) {
          const msg = await r.text();
          throw new Error('Could not save the comment (' + r.status + '): ' + msg);
        }
      } else if (body.action === 'delete' && body.id) {
        const r = await fetch(TABLE + '?id=eq.' + encodeURIComponent(body.id), {
          method: 'DELETE',
          headers
        });
        if (!r.ok) {
          const msg = await r.text();
          throw new Error('Could not delete the comment (' + r.status + '): ' + msg);
        }
      } else {
        res.status(400).json({ error: 'Unrecognised request.' });
        return;
      }

      const comments = await fetchAll();
      res.status(200).json({ comments });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Storage error: ' + err.message });
  }
};

