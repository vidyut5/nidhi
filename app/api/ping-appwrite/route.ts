import { NextResponse } from 'next/server'
import { Client } from 'node-appwrite'

export async function GET() {
	try {
		const endpoint = process.env.APPWRITE_ENDPOINT
		const projectId = process.env.APPWRITE_PROJECT_ID
		if (!endpoint || !projectId) {
			return NextResponse.json({ ok: false, error: 'Missing env' }, { status: 500 })
		}
		new Client().setEndpoint(endpoint).setProject(projectId)
		return NextResponse.json({ ok: true, endpoint, projectId })
	} catch (e: any) {
		return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
	}
}


