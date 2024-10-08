// src/utils/makeApi.js
import axios from 'axios';

const makeApi = axios.create({
  baseURL: `${process.env.MAKE_BASE_URL}${process.env.MAKE_API_VERSION}`,
  headers: {
    Authorization: `Token ${process.env.MAKE_API_KEY}`,
  },
});

// Intercepting the request to log only the body
makeApi.interceptors.request.use((config) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Request Body:', config.data);  // Log only the request body
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepting the response to log only the body
makeApi.interceptors.response.use((response) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Response Body:', response.data);  // Log only the response body
  }
  return response;
}, (error) => {
  if (process.env.NODE_ENV !== 'production') {
    if (error.response) {
      console.error('Error Response Body:', error.response.data);  // Log only the error response body
    } else {
      console.error('Error:', error.message);
    }
  }
  return Promise.reject(error);
});

// Make API functions

// Function to create a team in Make API
export async function createTeam(name, organizationId) {
  const response = await makeApi.post('/teams', { name, organizationId });
  return response.data;
}

const redirectUri = `http://${process.env.APPLICATION_URL}:${process.env.PORT}/api/flow/callback`;

// Function to initiate a flow in Make API
export async function initiateFlow(templateId, teamId, prefill) {
  const response = await makeApi.post('/instances/flow/init/template', {
    templateId,
    teamId,
    redirectUri,
    prefill,
    scenario: {
      enable: true
    },
    autoActivate: true,
    autoFinalize: true,
    allowReusingComponents: false,
    allowCreatingComponents: true,
  });
  return response.data;
}

// Function to process a flow in Make API
export async function processFlow(flowId) {
  const response = await makeApi.get(`/instances/flow/${flowId}`);
  return response.data;
}

// Function to trigger a webhook
export async function triggerWebhook(url, action) {
  const response = await makeApi.post(url, { action });
  return response.data;
}

export async function getWebhook(hookId) {
  const response = await makeApi.get(`/hooks/${hookId}`);
  return response.data;
}


export async function getTeamTemplates(teamId) {
  // Use masterTeam if defined, otherwise use the passed teamId
  const finalTeamId = process.env.MASTER_MAKE_TEAM || teamId;

  try {
    const response = await makeApi.get('/templates/v2/instanceable', {
      params: {
        teamId: finalTeamId,
      },
    });
    return response.data.templates;  // Return the templates array
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

export async function createWebhook(data) {
  const response = await makeApi.post('/hooks', data);
  return response.data;
}

export async function getScenario(id) {
  const response = await makeApi.get(`/scenarios/${id}`);  // Use GET and remove 'data'
  return response.data;
}

export async function getOrgScenarios(organizationId) {
  let offset = 0;
  let results = [];

  while (true) {
    const pagination = {
      pg: {
        limit: 50,
        offset,
        sortBy: 'id',
        sortDir: 'asc',
      },
    };

    const response = await makeApi.get('/scenarios', { params: { organizationId, ...pagination } });
    const data = response.data;

    if (data && data.scenarios) {
      results = results.concat(data.scenarios);
    }

    // Check if we have reached the end based on the `pg` object
    if (data.pg && data.pg.limit > data.scenarios.length) {
      break;
    }

    // Increment the offset for the next page of data
    offset += 50;
  }

  return results;
}
