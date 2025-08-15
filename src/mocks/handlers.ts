import { rest } from 'msw';

export const handlers = [
  // GitHub API mocks
  rest.get('https://api.github.com/user', (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.includes('token')) {
      return res(
        ctx.status(401),
        ctx.json({ message: 'Requires authentication' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://github.com/images/error/testuser_happy.gif',
      })
    );
  }),

  rest.get('https://api.github.com/user/repos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          name: 'test-repo',
          full_name: 'testuser/test-repo',
          private: false,
          html_url: 'https://github.com/testuser/test-repo',
          description: 'Test repository',
          fork: false,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          pushed_at: '2023-01-01T00:00:00Z',
          stargazers_count: 0,
          watchers_count: 0,
          language: 'JavaScript',
          has_pages: false,
          default_branch: 'main',
        },
      ])
    );
  }),

  rest.post('https://api.github.com/user/repos', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 2,
        name: 'new-site',
        full_name: 'testuser/new-site',
        private: false,
        html_url: 'https://github.com/testuser/new-site',
        description: 'Generated website',
        fork: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
        stargazers_count: 0,
        watchers_count: 0,
        language: 'HTML',
        has_pages: false,
        default_branch: 'main',
      })
    );
  }),

  rest.put('https://api.github.com/repos/:owner/:repo/contents/:path', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        content: {
          name: req.params.path,
          path: req.params.path,
          sha: 'mock-sha-' + Math.random().toString(36).substr(2, 9),
          size: 1024,
          url: `https://api.github.com/repos/${req.params.owner}/${req.params.repo}/contents/${req.params.path}`,
          html_url: `https://github.com/${req.params.owner}/${req.params.repo}/blob/main/${req.params.path}`,
          git_url: `https://api.github.com/repos/${req.params.owner}/${req.params.repo}/git/blobs/mock-sha`,
          download_url: `https://raw.githubusercontent.com/${req.params.owner}/${req.params.repo}/main/${req.params.path}`,
          type: 'file',
        },
        commit: {
          sha: 'mock-commit-sha-' + Math.random().toString(36).substr(2, 9),
          url: `https://api.github.com/repos/${req.params.owner}/${req.params.repo}/git/commits/mock-commit-sha`,
        },
      })
    );
  }),

  // Gemini API mock
  rest.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'This is a mock response from Gemini AI. Here is some generated content based on your request.',
                },
              ],
            },
            finishReason: 'STOP',
            index: 0,
            safetyRatings: [
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE',
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE',
              },
            ],
          },
        ],
        promptFeedback: {
          safetyRatings: [
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              probability: 'NEGLIGIBLE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              probability: 'NEGLIGIBLE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              probability: 'NEGLIGIBLE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              probability: 'NEGLIGIBLE',
            },
          ],
        },
      })
    );
  }),

  // GitHub OAuth mock
  rest.post('https://github.com/login/oauth/access_token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.text('access_token=mock-github-token&scope=repo%2Cuser&token_type=bearer')
    );
  }),
];