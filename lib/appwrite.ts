import { Client, Databases, Storage, Users, Teams } from 'node-appwrite'

export type AppwriteClients = {
  client: Client
  databases: Databases
  storage: Storage
  users: Users
  teams: Teams
}

export function getAppwrite(): AppwriteClients {
  const endpoint = process.env.APPWRITE_ENDPOINT || ''
  const projectId = process.env.APPWRITE_PROJECT_ID || ''
  const apiKey = process.env.APPWRITE_API_KEY || ''
  if (!endpoint || !projectId || !apiKey) {
    throw new Error('Missing Appwrite env: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY')
  }
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
    teams: new Teams(client),
  }
}


