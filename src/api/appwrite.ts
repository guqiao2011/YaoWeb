import { Client, Account } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || ''
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''

if (!endpoint || !projectId) {
  console.warn('Appwrite endpoint or project ID is not configured')
}

export const client = new Client()
client.setEndpoint(endpoint).setProject(projectId)

export const account = new Account(client)
